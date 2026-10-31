import { type SyntheticEvent, useMemo, useState } from 'react';
import { Time24Picker } from '../components/TimePicker';
import type { HeadsetDto, TimeBlock, WeekDayInfo } from '../types';
import {
    clockToMinutes,
    formatHuf,
    formatTimeShort24,
    timeToPercentage,
    toIsoDateString,
} from '../utils/formatters';

interface TimetablePageProps {
    headsets: HeadsetDto[];
    availableBlocks: TimeBlock[];
    selectedHeadsetId: number;
    onSelectHeadsetId: (id: number) => void;
    weekOffset: number;
    onChangeWeekOffset: (nextOffset: number) => void;
    weekDays: WeekDayInfo[];
    onBookReservation: (headsetId: number, startIso: string, endIso: string) => Promise<void>;
}

export function TimetablePage({
                                  headsets,
                                  availableBlocks,
                                  selectedHeadsetId,
                                  onSelectHeadsetId,
                                  weekOffset,
                                  onChangeWeekOffset,
                                  weekDays,
                                  onBookReservation,
                              }: TimetablePageProps) {
    const [selectedDate, setSelectedDate] = useState<string>(() => toIsoDateString(new Date()));
    const [bookingStartTime, setBookingStartTime] = useState<string>('14:00');
    const [bookingEndTime, setBookingEndTime] = useState<string>('15:00');

    const activeHeadset = useMemo(
        () => headsets.find((h) => h.id === selectedHeadsetId) || null,
        [headsets, selectedHeadsetId]
    );

    const bookingDurationMinutes = useMemo(() => {
        const diff = clockToMinutes(bookingEndTime) - clockToMinutes(bookingStartTime);
        return diff > 0 ? diff : 0;
    }, [bookingStartTime, bookingEndTime]);

    const estimatedPriceHuf = useMemo(() => {
        if (!activeHeadset || bookingDurationMinutes <= 0) return 0;
        return (bookingDurationMinutes / 60) * activeHeadset.hourlyPrice;
    }, [activeHeadset, bookingDurationMinutes]);

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const startIso = `${selectedDate}T${bookingStartTime}:00`;
        const endIso = `${selectedDate}T${bookingEndTime}:00`;
        await onBookReservation(selectedHeadsetId, startIso, endIso);
    };

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>Weekly 24-Hour VR Timetable</h1>
                    <p className="subtitle">
                        Step backward or forward across weeks. Click any <strong>Green</strong> available window
                        on any day to load its 00:00–24:00 interval.
                    </p>
                </div>
                <div className="week-nav-controls">
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => onChangeWeekOffset(weekOffset - 1)}
                    >
                        ← Prev Week
                    </button>
                    <button
                        type="button"
                        className={weekOffset === 0 ? 'primary-btn' : 'secondary-btn'}
                        onClick={() => onChangeWeekOffset(0)}
                    >
                        Current Week
                    </button>
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => onChangeWeekOffset(weekOffset + 1)}
                    >
                        Next Week →
                    </button>
                </div>
            </div>

            <div className="timetable-toolbar card">
                <label className="toolbar-field">
                    <span>1. Select Available VR Headset:</span>
                    <select
                        value={selectedHeadsetId}
                        onChange={(e) => onSelectHeadsetId(Number(e.target.value))}
                    >
                        <option value={0} disabled>
                            -- Select Headset --
                        </option>
                        {headsets.map((h) => (
                            <option key={h.id} value={h.id} disabled={h.status !== 'Available'}>
                                {h.name} ({formatHuf(h.hourlyPrice)} / hr) — [{h.status}]
                            </option>
                        ))}
                    </select>
                </label>

                <div className="week-range-badge">
                    <span>Selected Week:</span>
                    <strong>
                        {weekDays[0].iso.replaceAll('-', '.')} — {weekDays[6].iso.replaceAll('-', '.')}
                    </strong>
                </div>
            </div>

            <div className="weekly-matrix card">
                <div className="matrix-ruler">
                    <div className="matrix-day-col-header">Day / Date</div>
                    <div className="matrix-hours-header">
                        <span>00:00</span>
                        <span>04:00</span>
                        <span>08:00</span>
                        <span>12:00</span>
                        <span>16:00</span>
                        <span>20:00</span>
                        <span>24:00</span>
                    </div>
                </div>

                {weekDays.map((day) => {
                    const dayBlocks = availableBlocks.filter(
                        (b) => b.headsetId === selectedHeadsetId && b.startTime.startsWith(day.iso)
                    );
                    const isSelectedDay = selectedDate === day.iso;

                    return (
                        <div
                            key={day.iso}
                            className={isSelectedDay ? 'matrix-row selected-day-row' : 'matrix-row'}
                        >
                            <button
                                type="button"
                                className="matrix-day-label"
                                onClick={() => setSelectedDate(day.iso)}
                            >
                <span className="day-name">
                  {day.dayName} {day.isToday && <em className="today-dot">TODAY</em>}
                </span>
                                <span className="day-date">{day.iso.replaceAll('-', '.')}</span>
                            </button>

                            <div className="timeline-bar-red">
                                {dayBlocks.map((block) => {
                                    const leftPercent = timeToPercentage(block.startTime);
                                    const endPercent = timeToPercentage(block.endTime);
                                    const widthPercent = Math.max(endPercent - leftPercent, 2);
                                    const blockKey = `${block.headsetId}-${block.startTime}-${block.endTime}`;

                                    return (
                                        <button
                                            type="button"
                                            key={blockKey}
                                            className="timeline-block-green"
                                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                            title={`Available: ${formatTimeShort24(block.startTime)} - ${formatTimeShort24(block.endTime)}`}
                                            onClick={() => {
                                                setSelectedDate(day.iso);
                                                setBookingStartTime(formatTimeShort24(block.startTime));
                                                setBookingEndTime(formatTimeShort24(block.endTime));
                                            }}
                                        >
                      <span>
                        {formatTimeShort24(block.startTime)}–{formatTimeShort24(block.endTime)}
                      </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form className="booking-form card" onSubmit={handleSubmit}>
                <div className="booking-form-header">
                    <div>
                        <h3>2. Customize Your 24-Hour Reservation Interval (Min. 30 mins)</h3>
                        <p className="muted-text">
                            All times use strict 00:00–24:00 format. Pricing is calculated automatically in HUF.
                        </p>
                    </div>
                    <div className="price-summary-pill">
            <span>
              Duration: <strong>{bookingDurationMinutes} mins</strong>
            </span>
                        <span className="total-huf">Total: {formatHuf(estimatedPriceHuf)}</span>
                    </div>
                </div>

                <div className="form-row">
                    <label>
                        <span>Selected Date:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                    </label>

                    <div className="field-group">
                        <span>Start Time (00–24):</span>
                        <Time24Picker value={bookingStartTime} onChange={setBookingStartTime} />
                    </div>

                    <div className="field-group">
                        <span>End Time (00–24):</span>
                        <Time24Picker value={bookingEndTime} onChange={setBookingEndTime} />
                    </div>

                    <button type="submit" className="primary-btn glow-btn">
                        Confirm Booking ({formatHuf(estimatedPriceHuf)})
                    </button>
                </div>
            </form>
        </section>
    );
}