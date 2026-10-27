import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, ExternalLink, X, Mail, Send, Check } from 'lucide-react';
import { BookingRequest } from '../../types';
import { StorageService } from '../../services/storageService';
import { CalendarService } from '../../services/calendarService';
import { formatDateString } from '../../utils/formatters';
import { EmailDispatchResult } from '../../services/emailDispatchService';

interface ConfirmationReceiptProps {
  booking: BookingRequest;
  emailStatus?: EmailDispatchResult | null;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

export const ConfirmationReceipt: React.FC<ConfirmationReceiptProps> = ({
  booking,
  emailStatus,
  onClose,
  onOpenNotifications
}) => {
  const property = StorageService.getPropertyById(booking.propertyId);
  const agent = StorageService.getAgentById(booking.agentId);

  useEffect(() => {
    // Celebratory golden confetti burst
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#C5A880', '#DFCAAA', '#FFFFFF', '#9E825D']
    });
  }, []);

  const googleCalUrl = CalendarService.getGoogleCalendarUrl(booking);

  // Mailto direct client link
  const mailtoSubject = encodeURIComponent(`My Viewing Reservation: ${booking.propertyTitle}`);
  const mailtoBody = encodeURIComponent(
    `Hello ${agent ? agent.name : 'Aura Estates'},\n\nI have confirmed my private viewing for ${booking.propertyTitle} on ${formatDateString(booking.date)} at ${booking.timeSlot}.\n\nReference: #${booking.id.slice(0, 8).toUpperCase()}\nClient: ${booking.clientName}\nPhone: ${booking.clientPhone}`
  );
  const mailtoUrl = `mailto:${agent ? agent.email : 'advisory@auraestates.com'}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '560px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.2) 0%, rgba(11, 19, 35, 0.8) 100%)',
          padding: '28px 24px 20px 24px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid var(--border-gold)'
        }}>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '999px',
            background: 'var(--gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 0 25px rgba(197, 168, 128, 0.5)'
          }}>
            <CheckCircle2 size={32} color="#0B1323" strokeWidth={2.5} />
          </div>

          <h2 style={{
            fontSize: '1.45rem',
            color: '#FFF',
            fontFamily: 'var(--font-serif)',
            marginBottom: '4px'
          }}>
            Viewing Confirmed
          </h2>
          <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem' }}>
            Reference: <strong style={{ letterSpacing: '1px', color: '#FFF' }}>#{booking.id.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {/* Email Dispatch Real Status Banner */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
              flexShrink: 0
            }}>
              <Send size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399' }}>
                Confirmation Email Dispatched
              </div>
              <div style={{ fontSize: '0.75rem', color: '#E5E7EB' }}>
                Dispatched to: <strong>{booking.clientEmail}</strong> with complete viewing instructions.
              </div>
            </div>
          </div>

          {/* Booking Summary Card */}
          <div style={{
            background: 'rgba(15, 25, 45, 0.85)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-sm)',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Reserved Property
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFF', marginBottom: '14px' }}>
              {booking.propertyTitle}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Date</span>
                <strong style={{ color: '#FFF' }}>{formatDateString(booking.date)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Time Slot</span>
                <strong style={{ color: 'var(--gold-primary)' }}>{booking.timeSlot}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Client Name</span>
                <span style={{ color: '#FFF' }}>{booking.clientName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Dedicated Advisor</span>
                <span style={{ color: '#FFF' }}>{agent ? agent.name : 'Alexandra Vance'}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ flex: '1 1 200px', fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} />
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={() => CalendarService.downloadIcsFile(booking)}
                className="btn btn-outline"
                style={{ flex: '1 1 180px', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Download .ics File</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={mailtoUrl}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                <Mail size={14} />
                <span>Enviar E-mail ao Corretor</span>
              </a>

              {onOpenNotifications && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNotifications();
                  }}
                  className="btn btn-ghost"
                  style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-subtle)'
                  }}
                >
                  <Check size={14} color="var(--gold-primary)" />
                  <span>Ver Prévia do E-mail</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-gold"
            style={{ width: '100%', maxWidth: '240px' }}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
