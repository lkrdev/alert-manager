
export interface CronState {
  frequency: 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  interval?: number; // For minutes
  startHour?: string; // HH:MM
  endHour?: string; // HH:MM
  time?: string; // HH:MM
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
}

export const fromCron = (cron: string): CronState => {
    const parts = cron.split(' ');
    if (parts.length < 5) {
        return { frequency: 'daily', time: '05:00' }; // Default
    }

    const [minute, hour, dom, month, dow] = parts;

    // Minutes: */15 5-18 * * *
    if (minute.startsWith('*/')) {
        const interval = parseInt(minute.substring(2), 10);
        const [start, end] = hour.includes('-') ? hour.split('-') : ['0', '23'];
        return {
            frequency: 'minutes',
            interval,
            startHour: `${start.padStart(2, '0')}:00`,
            endHour: `${end.padStart(2, '0')}:00`
        };
    }

    // Hourly: 0 5-18 * * *
    if (hour.includes('-')) {
        const [start, end] = hour.split('-');
        const m = minute.padStart(2, '0');
        return {
            frequency: 'hourly',
            startHour: `${start.padStart(2, '0')}:${m}`,
            endHour: `${end.padStart(2, '0')}:${m}`
        };
    }
    
    // Hourly simple: 0 * * * *
    if (minute === '0' && hour === '*') {
         return {
            frequency: 'hourly',
            startHour: '00:00',
            endHour: '23:00'
        };
    }

    // Weekly: 0 5 * * 1
    if (dow !== '*') {
        return {
            frequency: 'weekly',
            time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
            dayOfWeek: parseInt(dow, 10)
        };
    }

    // Monthly: 0 5 1 * *
    if (dom !== '*') {
        return {
            frequency: 'monthly',
            time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
            dayOfMonth: parseInt(dom, 10)
        };
    }

    // Daily: 0 5 * * *
    return {
        frequency: 'daily',
        time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    };
};

export const toCron = (state: CronState): string => {
  const { frequency, interval, startHour, endHour, time, dayOfWeek, dayOfMonth } = state;

  // Helper to parse HH:MM
  const parseTime = (t?: string) => {
    if (!t) return { hour: '*', minute: '0' };
    const [h, m] = t.split(':');
    return { hour: parseInt(h, 10).toString(), minute: parseInt(m, 10).toString() };
  };

  switch (frequency) {
    case 'minutes':
      if (interval) {
        const { hour: startH } = parseTime(startHour);
        const { hour: endH } = parseTime(endHour);
        const hourRange = startHour && endHour ? `${startH}-${endH}` : '*';
        return `*/${interval} ${hourRange} * * *`;
      }
      return '* * * * *';

    case 'hourly':
        const { hour: startH, minute: startM } = parseTime(startHour);
        const { hour: endH } = parseTime(endHour);
        const hourRange = startHour && endHour ? `${startH}-${endH}` : '*';
        return `${startM} ${hourRange} * * *`;

    case 'daily':
      const { hour: dailyH, minute: dailyM } = parseTime(time);
      return `${dailyM} ${dailyH} * * *`;

    case 'weekly':
      const { hour: weeklyH, minute: weeklyM } = parseTime(time);
      const cronDay = dayOfWeek !== undefined ? dayOfWeek.toString() : '*';
      return `${weeklyM} ${weeklyH} * * ${cronDay}`;

    case 'monthly':
      const { hour: monthlyH, minute: monthlyM } = parseTime(time);
      const dom = dayOfMonth ? dayOfMonth.toString() : '1';
      return `${monthlyM} ${monthlyH} ${dom} * *`;

    default:
      return '* * * * *';
  }
};