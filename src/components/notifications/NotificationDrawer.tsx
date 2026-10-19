import React, { useState } from 'react';
import { X, Mail, Bell, Check, User, Shield, Eye } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { NotificationRecord } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const notifications = StorageService.getNotifications();
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          background: 'var(--bg-glass-modal)',
          borderLeft: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.15rem', color: '#FFF' }}>
                Notification & Email Audit Log
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Live simulation of client confirmation emails and agent alerts
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List of Notifications */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Mail size={40} color="var(--border-gold)" style={{ margin: '0 auto 12px auto' }} />
              <p>No notifications generated yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Book a viewing on any property to see automatic client confirmation & agent alerts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    StorageService.markNotificationOpened(item.id);
                    setSelectedNotification(item);
                  }}
                  style={{
                    background: item.status === 'delivered' ? 'rgba(197, 168, 128, 0.08)' : 'rgba(15, 25, 45, 0.65)',
                    border: item.status === 'delivered' ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span className={`badge ${item.recipientRole === 'client' ? 'badge-gold' : 'badge-status-confirmed'}`}>
                      {item.recipientRole === 'client' ? <User size={10} /> : <Shield size={10} />}
                      {item.recipientRole === 'client' ? 'Client Email' : 'Agent Alert'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {formatDateTime(item.sentAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFF', marginBottom: '4px' }}>
                    {item.subject}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>To: {item.recipientEmail}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-light)' }}>
                      <Eye size={12} /> Click to View HTML Email
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {selectedNotification && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNotification(null)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '640px', background: '#070B14' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '4px' }}>
                  Simulated Transactional Email
                </span>
                <h4 style={{ color: '#FFF', fontSize: '1rem', marginTop: '2px' }}>
                  {selectedNotification.subject}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Recipient: <strong>{selectedNotification.recipientEmail}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ background: '#04070E', maxHeight: '75vh', overflowY: 'auto' }}>
              <div
                dangerouslySetInnerHTML={{ __html: selectedNotification.contentHtml }}
              />
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedNotification(null)}
                className="btn btn-gold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
