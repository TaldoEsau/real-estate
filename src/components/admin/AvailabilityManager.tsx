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
      setFeedbackMsg('Esta data já está bloqueada.');
      return;
    }

    StorageService.toggleBlackoutDate(selectedPropertyId, newBlackoutDate);
    setNewBlackoutDate('');
    setFeedbackMsg(`Visitas bloqueadas para ${formatDateString(newBlackoutDate)}`);
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
    setFeedbackMsg('Horário de funcionamento para visitas atualizado com sucesso');
    setTimeout(() => setFeedbackMsg(null), 3000);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="var(--gold-primary)" />
          Configuração de Disponibilidade & Bloqueio de Datas
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Configure os horários de visitação e bloqueie datas específicas (proprietário indisponível, manutenção, feriados) para cada imóvel.
        </p>

        {/* Property Selector */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Selecione o Imóvel</label>
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
          background: '',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
            <Clock size={16} />
            <span>Horário Diário de Visitas (Sessões de 45 min com Intervalo de 15 min)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label className="form-label">Primeiro Horário</label>
              <select
                className="form-select"
                value={schedule.startHour}
                onChange={e => handleHoursChange(Number(e.target.value), schedule.endHour)}
              >
                <option value={8}>08:00</option>
                <option value={9}>09:00 (Padrão)</option>
                <option value={10}>10:00</option>
                <option value={11}>11:00</option>
              </select>
            </div>

            <div>
              <label className="form-label">Encerramento do Expediente</label>
              <select
                className="form-select"
                value={schedule.endHour}
                onChange={e => handleHoursChange(schedule.startHour, Number(e.target.value))}
              >
                <option value={17}>17:00</option>
                <option value={18}>18:00 (Padrão)</option>
                <option value={19}>19:00</option>
                <option value={20}>20:00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Block Specific Date */}
        <form onSubmit={handleAddBlackout} style={{ marginBottom: '24px' }}>
          <label className="form-label">Bloquear uma Data Específica</label>
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
              <span>Bloquear Data Selecionada</span>
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
            Datas Bloqueadas Ativas ({schedule.blackoutDates.length})
          </div>

          {schedule.blackoutDates.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Nenhuma data bloqueada. Todos os dias úteis e sábados estão abertos para agendamento de visitas.
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
                    title="Remover Bloqueio"
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
