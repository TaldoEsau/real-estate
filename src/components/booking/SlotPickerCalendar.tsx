import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { BookingService, CalculatedTimeSlot } from '../../services/bookingService';

interface SlotPickerCalendarProps {
  propertyId: string;
  selectedDate: string;
  selectedSlot: string;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: string) => void;
}

export const SlotPickerCalendar: React.FC<SlotPickerCalendarProps> = ({
  propertyId,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot
}) => {
  // Generate next 14 available days
  const availableDates = React.useMemo(() => {
    const list: { dateStr: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const now = new Date();

    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const dateStr = d.toISOString().split('T')[0];
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
      const dayNum = d.getDate();
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);

      list.push({ dateStr, dayName, dayNum, monthName });
    }
    return list;
  }, []);

  const [slotData, setSlotData] = useState<{
    isBlackedOut: boolean;
    isPastDate: boolean;
    slots: CalculatedTimeSlot[];
  }>({ isBlackedOut: false, isPastDate: false, slots: [] });

  useEffect(() => {
    if (selectedDate) {
      const result = BookingService.getTimeSlotsForDate(propertyId, selectedDate);
      setSlotData(result);
    }
  }, [propertyId, selectedDate]);

  return (
    <div>
      {/* 1. Date Strip Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          color: 'var(--text-gold)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CalendarIcon size={16} />
          <span>1. Select Viewing Date</span>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {availableDates.map(d => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.dateStr}
                onClick={() => onSelectDate(d.dateStr)}
                style={{
                  minWidth: '68px',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--border-gold)',
                  background: isSelected ? 'rgba(197, 168, 128, 0.15)' : 'rgba(11, 19, 35, 0.7)',
                  color: isSelected ? '#FFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: isSelected ? 'var(--gold-light)' : 'var(--text-dim)' }}>
                  {d.dayName}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0' }}>
                  {d.dayNum}
                </div>
                <div style={{ fontSize: '0.65rem' }}>
                  {d.monthName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Slot Selection Grid */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          color: 'var(--text-gold)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Clock size={16} />
          <span>2. Select 45-Min Viewing Window</span>
        </div>

        {slotData.isBlackedOut ? (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#FCA5A5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>The advisor has marked this date as unavailable for viewings. Please pick another date above.</span>
          </div>
        ) : slotData.slots.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 0' }}>
            No available time slots for this date.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px'
          }}>
            {slotData.slots.map(slot => {
              const isSelected = slot.timeSlot === selectedSlot;
              return (
                <button
                  key={slot.timeSlot}
                  disabled={!slot.isAvailable}
                  onClick={() => onSelectSlot(slot.timeSlot)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected
                      ? '2px solid var(--gold-primary)'
                      : slot.isAvailable
                        ? '1px solid var(--border-gold)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    background: isSelected
                      ? 'rgba(197, 168, 128, 0.2)'
                      : slot.isAvailable
                        ? 'rgba(15, 25, 45, 0.8)'
                        : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected
                      ? 'var(--gold-light)'
                      : slot.isAvailable
                        ? '#FFF'
                        : 'rgba(255, 255, 255, 0.25)',
                    cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div>{slot.timeSlot}</div>
                  {!slot.isAvailable && (
                    <div style={{ fontSize: '0.65rem', color: '#EF4444', marginTop: '2px' }}>
                      Reserved
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
