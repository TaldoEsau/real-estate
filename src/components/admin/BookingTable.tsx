import React, { useState } from 'react';
import { Download, Search, Check, RefreshCw, XCircle, Calendar, Phone, Mail } from 'lucide-react';
import { BookingRequest, BookingStatus } from '../../types';
import { StorageService } from '../../services/storageService';
import { ExportService } from '../../services/exportService';
import { formatDateString } from '../../utils/formatters';

interface BookingTableProps {
  bookings: BookingRequest[];
  onRefresh: () => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({ bookings, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = b.clientName.toLowerCase().includes(q);
      const matchEmail = b.clientEmail.toLowerCase().includes(q);
      const matchProperty = b.propertyTitle.toLowerCase().includes(q);
      if (!matchClient && !matchEmail && !matchProperty) return false;
    }
    return true;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    StorageService.updateBookingStatus(bookingId, newStatus);
    onRefresh();
  };

  const handleExportCsv = () => {
    ExportService.exportBookingsToCsv(filtered);
  };

  const getBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'badge-status-confirmed';
      case 'pending': return 'badge-status-pending';
      case 'cancelled': return 'badge-status-cancelled';
      case 'rescheduled': return 'badge-status-rescheduled';
    }
  };

  const statusLabels: Record<'all' | BookingStatus, string> = {
    all: 'Todos',
    confirmed: 'Confirmado',
    pending: 'Pendente',
    rescheduled: 'Reagendado',
    cancelled: 'Cancelado'
  };

  return (
    <div>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.8rem' }}
              placeholder="Buscar nome do cliente, e-mail ou imóvel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'confirmed', 'pending', 'rescheduled', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-gold' : 'btn-outline'}`}
              >
                {statusLabels[s]} ({s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length})
              </button>
            ))}
          </div>
        </div>

        {/* Export CSV Trigger */}
        <button
          onClick={handleExportCsv}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
        >
          <Download size={16} />
          <span>Exportar Visitas (CSV)</span>
        </button>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={36} color="var(--border-gold)" style={{ margin: '0 auto 10px auto' }} />
            <p>Nenhuma solicitação de visita encontrada para este filtro.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{
                background: '#F3F1EB',
                borderBottom: '1px solid var(--border-gold)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--text-gold)',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '16px 20px' }}>Data & Horário</th>
                <th style={{ padding: '16px 14px' }}>Imóvel</th>
                <th style={{ padding: '16px 14px' }}>Dados do Cliente</th>
                <th style={{ padding: '16px 14px' }}>Observações</th>
                <th style={{ padding: '16px 14px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Atualizar Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => (
                <tr
                  key={booking.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Date & Slot */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {formatDateString(booking.date)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {booking.timeSlot}
                    </div>
                  </td>

                  {/* Property */}
                  <td style={{ padding: '16px 14px', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {booking.propertyTitle}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      ID: #{booking.id.slice(0, 8)}
                    </div>
                  </td>

                  {/* Client Info */}
                  <td style={{ padding: '16px 14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {booking.clientName}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} /> {booking.clientEmail}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> {booking.clientPhone}
                      </span>
                    </div>
                  </td>

                  {/* Notes */}
                  <td style={{ padding: '16px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                    {booking.notes || <span style={{ color: 'var(--text-dim)' }}>Nenhuma</span>}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '16px 14px' }}>
                    <span className={`badge ${getBadgeClass(booking.status)}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </td>

                  {/* Action Dropdown / Buttons */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          className="btn btn-sm btn-outline"
                          title="Confirmar Visita"
                        >
                          <Check size={14} color="#34D399" />
                          <span>Confirmar</span>
                        </button>
                      )}
                      {booking.status !== 'rescheduled' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'rescheduled')}
                          className="btn btn-sm btn-outline"
                          title="Reagendar Visita"
                        >
                          <RefreshCw size={13} color="#818CF8" />
                          <span>Reagendar</span>
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="btn btn-sm btn-danger"
                          title="Cancelar Visita"
                        >
                          <XCircle size={14} />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
