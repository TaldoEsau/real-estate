import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, Send } from 'lucide-react';
import { Property } from '../../types';
import { LeadService } from '../../services/leadService';

interface ReportErrorModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportErrorModal: React.FC<ReportErrorModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [problemType, setProblemType] = useState('informacao_desatualizada');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !description) {
      setErrorMessage('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await LeadService.submitErrorReport({
        tenantId: property.tenantId,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyCode: property.code,
        name,
        email,
        phone,
        problemType,
        description
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setName('');
        setEmail('');
        setPhone('');
        setDescription('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao enviar o reporte. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(4, 7, 14, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: 'var(--shadow-elevated)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} color="#34D399" />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '8px' }}>
              Reporte Enviado com Sucesso!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Agradecemos sua colaboração. Nossa equipe de moderação e o corretor responsável revisarão os dados deste anúncio imediatamente.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} color="#F59E0B" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>
                  Reportar Erro no Anúncio
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ref: {property.code || property.id.slice(0, 8)} • {property.title}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Encontrou alguma inconsistência de preço, fotos ou endereço? Preencha os campos abaixo para nos avisar.
            </p>

            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                marginBottom: '16px'
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Tipo de Inconsistência *</label>
                <select
                  className="form-select"
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="informacao_desatualizada">Informações do Imóvel Desatualizadas</option>
                  <option value="valor_incorreto">Valor de Venda ou Locação Incorreto</option>
                  <option value="imovel_indisponivel">Imóvel já foi Vendido ou Alugado</option>
                  <option value="fotos_incorretas">Fotos Incorretas ou de Baixa Qualidade</option>
                  <option value="localizacao_errada">Endereço ou Bairro Divergente</option>
                  <option value="outro">Outro Motivo</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Seu E-mail *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Descrição do Problema *</label>
                <textarea
                  required
                  rows={3}
                  className="form-input"
                  placeholder="Descreva detalhadamente o erro encontrado no anúncio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-gold btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Reporte'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
