import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.clientName.trim() || formData.clientName.trim().length < 2) {
      errs.clientName = 'Por favor, informe seu nome completo';
    }
    if (!formData.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      errs.clientEmail = 'Por favor, informe um e-mail válido para confirmação';
    }
    if (!formData.clientPhone.trim() || formData.clientPhone.trim().length < 8) {
      errs.clientPhone = 'Por favor, informe um número de telefone válido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !isSubmitting) {
      onSubmit(formData);
    }
  };

  const inputDisabledStyle = isSubmitting ? {
    opacity: 0.65,
    cursor: 'not-allowed',
    backgroundColor: 'rgba(15, 23, 42, 0.6)'
  } : undefined;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-gold)',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: '14px'
      }}>
        <User size={16} />
        <span>3. Dados de Contato do Visitante</span>
      </div>

      {/* Loading feedback banner when submitting */}
      {isSubmitting && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.15) 0%, rgba(15, 25, 45, 0.9) 100%)',
          border: '1px solid var(--gold-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 20px rgba(197, 168, 128, 0.2)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(197, 168, 128, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Loader2 size={22} color="var(--gold-primary)" className="animate-spin" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Enviando confirmação por e-mail...</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-light)', marginTop: '2px' }}>
              Registrando o agendamento da visita e enviando confirmação para <strong>{formData.clientEmail || 'seu e-mail'}</strong>. Aguarde.
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px'
      }}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Nome Completo *</label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              required
              disabled={isSubmitting}
              className="form-input"
              style={{
                paddingLeft: '38px',
                borderColor: errors.clientName ? '#EF4444' : undefined,
                ...inputDisabledStyle
              }}
              placeholder="Ex: Carlos Eduardo Mendes"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>
          {errors.clientName && <span style={{ color: '#F87171', fontSize: '0.75rem' }}>{errors.clientName}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">E-mail (Para Confirmação Imediata) *</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              required
              disabled={isSubmitting}
              className="form-input"
              style={{
                paddingLeft: '38px',
                borderColor: errors.clientEmail ? '#EF4444' : undefined,
                ...inputDisabledStyle
              }}
              placeholder="nome@dominio.com.br"
              value={formData.clientEmail}
              onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>
          {errors.clientEmail && <span style={{ color: '#F87171', fontSize: '0.75rem' }}>{errors.clientEmail}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Telefone / WhatsApp *</label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="tel"
              required
              disabled={isSubmitting}
              className="form-input"
              style={{
                paddingLeft: '38px',
                borderColor: errors.clientPhone ? '#EF4444' : undefined,
                ...inputDisabledStyle
              }}
              placeholder="(11) 98765-4321"
              value={formData.clientPhone}
              onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </div>
          {errors.clientPhone && <span style={{ color: '#F87171', fontSize: '0.75rem' }}>{errors.clientPhone}</span>}
        </div>

        {/* Special Requests / Notes */}
        <div className="form-group">
          <label className="form-label">Observações / Solicitações Especiais (Opcional)</label>
          <div style={{ position: 'relative' }}>
            <MessageSquare size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              disabled={isSubmitting}
              className="form-input"
              style={{
                paddingLeft: '38px',
                ...inputDisabledStyle
              }}
              placeholder="Ex: Irei acompanhado do meu arquiteto"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <ShieldCheck size={14} color="var(--gold-primary)" />
          <span>Sigilo absoluto garantido. E-mail de confirmação enviado imediatamente.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-gold"
          style={{
            minWidth: '240px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isSubmitting ? 0.8 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Reservando Horário...</span>
            </>
          ) : (
            'Confirmar Visita Presencial'
          )}
        </button>
      </div>
    </form>
  );
};

