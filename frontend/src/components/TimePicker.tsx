import { HOURS_24, MINUTES_STEP } from '../utils/formatters';

interface Time24PickerProps {
    value: string;
    onChange: (nextValue: string) => void;
}

export function Time24Picker({ value, onChange }: Readonly<Time24PickerProps>) {
    const parts = value.split(':');
    const currentHour = parts[0] && HOURS_24.includes(parts[0]) ? parts[0] : '14';
    const currentMinute = parts[1] ? parts[1].slice(0, 2) : '00';
    const minuteOptions = MINUTES_STEP.includes(currentMinute)
        ? MINUTES_STEP
        : [...MINUTES_STEP, currentMinute].sort((a, b) => a.localeCompare(b));

    return (
        <div className="time24-picker">
            <select
                aria-label="Hour"
                value={currentHour}
                onChange={(e) => onChange(`${e.target.value}:${currentMinute}`)}
            >
                {HOURS_24.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>
            <span className="time24-colon">:</span>
            <select
                aria-label="Minute"
                value={currentMinute}
                onChange={(e) => onChange(`${currentHour}:${e.target.value}`)}
            >
                {minuteOptions.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
            <span className="time24-tag">24H</span>
        </div>
    );
}