import React, { useState } from 'react';
import { Send, MessageSquare, CheckCircle2, MessageCircle, Shield } from 'lucide-react';
import { Property, Agent } from '../../types';
import { LeadService } from '../../services/leadService';

interface PropertyInquiryFormProps {
  property: Property;
  agent?: Agent;
}

export const PropertyInquiryForm: React.FC<PropertyInquiryFormProps> = ({
  property,
  agent
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Olá! Tenho interesse no imóvel ${property.title} (Cód: ${property.code || property.id.slice(0, 8)}). Gostaria de mais informações.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMessage('Por favor, preencha seu nome, e-mail e telefone.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await LeadService.submitPropertyInquiry({
        tenantId: property.tenantId,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyCode: property.code,
        name,
        email,
        phone,
        message
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setEmail('');
        setPhone('');
      }, 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao enviar mensagem. Tente novamente ou chame no WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const rawNumber = agent?.phone ? agent.phone.replace(/\D/g, '') : '17997577374';
    const fullNumber = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
    const text = encodeURIComponent(
      `Olá! Estou no site vendo o imóvel "${property.title}" (Cód: ${property.code || property.id.slice(0, 6)}). Gostaria de falar sobre ele.`
    );
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ marginTop: '4px' }}>
      {isSuccess ? (
        <div style={{
          textAlign: 'center',
          padding: '28px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={36} color="#34D399" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '6px' }}>
            Mensagem Enviada com Sucesso!
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            O corretor responsável <strong>{agent?.name || 'da equipe'}</strong> entrará em contato via WhatsApp ou e-mail o mais breve possível.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem'
            }}>
              {errorMessage}
            </div>
          )}

          <div>
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Mensagem ou Proposta</label>
            <textarea
              rows={3}
              className="form-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-gold"
            style={{ width: '100%', marginTop: '4px', fontSize: '0.9rem' }}
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Enviando Interesse...' : 'Enviar Mensagem de Interesse'}</span>
          </button>

          {/* Atalho WhatsApp Direto com o Corretor */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '6px 0',
            textAlign: 'center'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ou fale agora</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="btn"
            style={{
              width: '100%',
              backgroundColor: '#25D366',
              color: '#041E11',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={17} />
            <span>Chamar no WhatsApp do Corretor</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            marginTop: '4px'
          }}>
            <Shield size={12} color="var(--gold-primary)" />
            <span>Seus dados estão protegidos sob a LGPD. Não enviamos spam.</span>
          </div>
        </form>
      )}
    </div>
  );
};
