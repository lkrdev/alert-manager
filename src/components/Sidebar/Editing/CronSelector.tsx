
import { FieldSelect, Space } from '@looker/components';
import { range } from 'lodash';
import React, { useEffect, useState } from 'react';
import { CronState, fromCron, toCron } from '../../../utils/toCron';

interface CronSelectorProps {
    value?: string;
    onChange: (value: string) => void;
}

const CronSelector: React.FC<CronSelectorProps> = ({ value, onChange }) => {
    const [state, setState] = useState<CronState>(() => {
        return value ? fromCron(value) : { frequency: 'daily', time: '05:00' };
    });

    // Update internal state when prop changes (if needed, but usually controlled by parent via onChange)
    // However, to avoid loops, we only update if the generated cron from state doesn't match value
    useEffect(() => {
        if (value && toCron(state) !== value) {
             setState(fromCron(value));
        }
    }, [value]);

    const handleChange = (updates: Partial<CronState>) => {
        const newState = { ...state, ...updates };
        setState(newState);
        onChange(toCron(newState));
    };

    const frequencyOptions = [
        { value: 'minutes', label: 'Minutes' },
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
    ];

    const timeOptions = range(0, 24).flatMap((h) => {
        return range(0, 60, 10).map((m) => {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
        });
    });

    const hourlyTimeOptions = range(0, 24).flatMap((h) => {
        return range(0, 60, 30).map((m) => {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
        });
    });

    const dayOfWeekOptions = [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
        { value: '0', label: 'Sunday' },
    ];

    const dayOfMonthOptions = range(1, 32).map((d) => {
        const suffix = ["th", "st", "nd", "rd"];
        const v = d % 100;
        const ord = suffix[(v - 20) % 10] || suffix[v] || suffix[0];
        return { value: d.toString(), label: `${d}${ord}` };
    });
    
    const intervalOptions = [
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
    ];

    return (
        <Space>
            <FieldSelect
                label="Frequency"
                value={state.frequency}
                options={frequencyOptions}
                onChange={(value) => handleChange({ frequency: value as any })}
            />

            {state.frequency === 'minutes' && (
                <>
                     <FieldSelect
                        label="Check every"
                        value={state.interval?.toString()}
                        options={intervalOptions}
                        onChange={(value) => handleChange({ interval: parseInt(value, 10) })}
                    />
                    <FieldSelect
                        label="Start"
                        value={state.startHour}
                        options={timeOptions}
                        onChange={(value) => handleChange({ startHour: value })}
                    />
                    <FieldSelect
                        label="End"
                        value={state.endHour}
                        options={timeOptions}
                        onChange={(value) => handleChange({ endHour: value })}
                    />
                </>
            )}

            {state.frequency === 'hourly' && (
                <>
                    <FieldSelect
                        label="Start"
                        value={state.startHour}
                        options={hourlyTimeOptions}
                        onChange={(value) => handleChange({ startHour: value })}
                    />
                    <FieldSelect
                        label="End"
                        value={state.endHour}
                        options={hourlyTimeOptions}
                        onChange={(value) => handleChange({ endHour: value })}
                    />
                </>
            )}

            {state.frequency === 'daily' && (
                <FieldSelect
                    label="Time"
                    value={state.time}
                    options={timeOptions}
                    onChange={(value) => handleChange({ time: value })}
                />
            )}

            {state.frequency === 'weekly' && (
                <>
                    <FieldSelect
                        label="Day"
                        value={state.dayOfWeek?.toString()}
                        options={dayOfWeekOptions}
                        onChange={(value) => handleChange({ dayOfWeek: parseInt(value, 10) })}
                    />
                    <FieldSelect
                        label="Time"
                        value={state.time}
                        options={timeOptions}
                        onChange={(value) => handleChange({ time: value })}
                    />
                </>
            )}

            {state.frequency === 'monthly' && (
                <>
                    <FieldSelect
                        label="Day"
                        value={state.dayOfMonth?.toString()}
                        options={dayOfMonthOptions}
                        onChange={(value) => handleChange({ dayOfMonth: parseInt(value, 10) })}
                    />
                    <FieldSelect
                        label="Time"
                        value={state.time}
                        options={timeOptions}
                        onChange={(value) => handleChange({ time: value })}
                    />
                </>
            )}
        </Space>
    );
};

export default CronSelector;
