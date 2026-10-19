import React, { useState } from 'react';
import { Calendar, ShieldAlert, Plus, Trash2, Clock, Check } from 'lucide-react';
import { Property, AvailabilitySchedule } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatDateString } from '../../utils/formatters';

interface AvailabilityManagerProps {
  properties: Property[];
  onRefresh: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  properties,
  onRefresh
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ''
  );

  const [newBlackoutDate, setNewBlackoutDate] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const schedule: AvailabilitySchedule = StorageService.getScheduleForProperty(selectedPropertyId);

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate) return;

    if (schedule.blackoutDates.includes(newBlackoutDate)) {
      setFeedbackMsg('This date is already blocked.');
      return;
    }

    StorageService.toggleBlackoutDate(selectedPropertyId, newBlackoutDate);
    setNewBlackoutDate('');
    setFeedbackMsg(`Blocked viewings for ${formatDateString(newBlackoutDate)}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
    onRefresh();
  };

  const handleRemoveBlackout = (dateStr: string) => {
    StorageService.toggleBlackoutDate(selectedPropertyId, dateStr);
    onRefresh();
  };

  const handleHoursChange = (start: number, end: number) => {
    StorageService.saveSchedule({
      ...schedule,
      startHour: start,
      endHour: end
    });
    setFeedbackMsg('Operating viewing hours updated successfully');
    setTimeout(() => setFeedbackMsg(null), 3000);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="var(--gold-primary)" />
          Viewing Availability & Blackout Configuration
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Configure working viewing hours and block specific dates (owner unavailable, private events, maintenance) per listing.
        </p>

        {/* Property Selector */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Select Target Property</label>
          <select
            className="form-select"
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.location.city})
              </option>
            ))}
          </select>
        </div>

        {/* Operating Hours Configuration */}
        <div style={{
          background: 'rgba(11, 19, 35, 0.7)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
            <Clock size={16} />
            <span>Daily Viewing Hours (45-Min Slots with 15-Min Buffer)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label className="form-label">Earliest Appointment</label>
              <select
                className="form-select"
                value={schedule.startHour}
                onChange={e => handleHoursChange(Number(e.target.value), schedule.endHour)}
              >
                <option value={8}>08:00 AM</option>
                <option value={9}>09:00 AM (Default)</option>
                <option value={10}>10:00 AM</option>
                <option value={11}>11:00 AM</option>
              </select>
            </div>

            <div>
              <label className="form-label">Latest Appointment Finish</label>
              <select
                className="form-select"
                value={schedule.endHour}
                onChange={e => handleHoursChange(schedule.startHour, Number(e.target.value))}
              >
                <option value={17}>05:00 PM</option>
                <option value={18}>06:00 PM (Default)</option>
                <option value={19}>07:00 PM</option>
                <option value={20}>08:00 PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Block Specific Date */}
        <form onSubmit={handleAddBlackout} style={{ marginBottom: '24px' }}>
          <label className="form-label">Block a Specific Date (Blackout)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
              style={{ maxWidth: '240px' }}
              value={newBlackoutDate}
              onChange={e => setNewBlackoutDate(e.target.value)}
            />
            <button type="submit" className="btn btn-gold">
              <Plus size={16} />
              <span>Block Selected Date</span>
            </button>
          </div>
        </form>

        {feedbackMsg && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#34D399',
            fontSize: '0.8rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Check size={16} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Active Blackouts List */}
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>
            Active Blackout Dates ({schedule.blackoutDates.length})
          </div>

          {schedule.blackoutDates.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No blackout dates set. All standard weekdays & Saturdays are open for viewings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {schedule.blackoutDates.map(dateStr => (
                <div
                  key={dateStr}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFF',
                    fontSize: '0.85rem'
                  }}
                >
                  <ShieldAlert size={14} color="#F87171" />
                  <span>{formatDateString(dateStr)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlackout(dateStr)}
                    style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0 }}
                    title="Remove Blackout"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
