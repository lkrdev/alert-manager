
import { fromCron, toCron } from './toCron';

describe('toCron', () => {
  it('should generate daily cron', () => {
    expect(toCron({ frequency: 'daily', time: '05:00' })).toBe('0 5 * * *');
  });

  it('should generate daily cron', () => {
    expect(toCron({ frequency: 'daily', time: '05:10' })).toBe('10 5 * * *');
  });

  it('should generate weekly cron', () => {
    expect(toCron({ frequency: 'weekly', dayOfWeek: 1, time: '05:00' })).toBe('0 5 * * 1');
  });

  it('should generate monthly cron', () => {
    expect(toCron({ frequency: 'monthly', dayOfMonth: 1, time: '05:00' })).toBe('0 5 1 * *');
  });

  it('should generate hourly cron with range (hourly half)', () => {
    expect(toCron({ frequency: 'hourly', startHour: '05:30', endHour: '18:30' })).toBe('30 5-18 * * *');
  });
  it('should generate hourly cron with range', () => {
    expect(toCron({ frequency: 'hourly', startHour: '05:00', endHour: '18:00' })).toBe('0 5-18 * * *');
  });

  it('should generate minutes cron with interval and range', () => {
    expect(toCron({ frequency: 'minutes', interval: 15, startHour: '05:00', endHour: '18:00' })).toBe('*/15 5-18 * * *');
  });
});

describe('fromCron', () => {
    it('should parse daily cron', () => {
        expect(fromCron('0 5 * * *')).toEqual({ frequency: 'daily', time: '05:00' });
    });

    it('should parse weekly cron', () => {
        expect(fromCron('0 5 * * 1')).toEqual({ frequency: 'weekly', time: '05:00', dayOfWeek: 1 });
    });

    it('should parse monthly cron', () => {
        expect(fromCron('0 5 1 * *')).toEqual({ frequency: 'monthly', time: '05:00', dayOfMonth: 1 });
    });

    it('should parse hourly cron with range', () => {
        expect(fromCron('0 5-18 * * *')).toEqual({ frequency: 'hourly', startHour: '05:00', endHour: '18:00' });
    });

    it('should parse hourly cron with range (hourly half)', () => {
        expect(fromCron('30 5-18 * * *')).toEqual({ frequency: 'hourly', startHour: '05:30', endHour: '18:30' });
    });

    it('should parse minutes cron with interval and range', () => {
        expect(fromCron('*/15 5-18 * * *')).toEqual({ frequency: 'minutes', interval: 15, startHour: '05:00', endHour: '18:00' });
    });
});