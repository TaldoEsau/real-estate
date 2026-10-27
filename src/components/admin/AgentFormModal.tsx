import React, { useState } from 'react';
import { X, User, Phone, Mail, Award, Check, Upload, Loader2, Camera, Share2, MessageCircle } from 'lucide-react';
import { Agent } from '../../types';
import { StorageService } from '../../services/storageService';
import { uploadPropertyImage } from '../../services/imageUploadService';
import { generateUUID } from '../../utils/formatters';

interface AgentFormModalProps {
  agentToEdit?: Agent | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  agentToEdit,
  onClose,
  onSaved
}) => {
  const [name, setName] = useState(agentToEdit?.name || '');
  const [email, setEmail] = useState(agentToEdit?.email || '');
  const [phone, setPhone] = useState(agentToEdit?.phone || '');
  const [role, setRole] = useState(agentToEdit?.role || 'Consultor Imobiliário');
  const [creci, setCreci] = useState(agentToEdit?.creci || '');
  const [bio, setBio] = useState(agentToEdit?.bio || '');
  const [instagram, setInstagram] = useState(agentToEdit?.socialLinks?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(agentToEdit?.socialLinks?.whatsapp || '');
  const [avatar, setAvatar] = useState(
    agentToEdit?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
  );
  const [isActive, setIsActive] = useState(agentToEdit?.isActive !== false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadPropertyImage(file);
      setAvatar(url);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar a foto de perfil.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Por favor, preencha os campos obrigatórios (Nome, E-mail e Telefone).');
      return;
    }

    setErrorMessage(null);

    const agent: Agent = {
      id: agentToEdit?.id || generateUUID(),
      tenantId: agentToEdit?.tenantId || 't1111111-1111-1111-1111-111111111111',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      creci: creci.trim() || undefined,
      avatar,
      bio: bio.trim(),
      socialLinks: {
        instagram: instagram.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined
      },
      isActive
    };

    await StorageService.saveAgent(agent);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '620px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="var(--gold-primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#FFF' }}>
              {agentToEdit ? 'Editar Corretor Responsável' : 'Cadastrar Novo Corretor'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            title="Fechar"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
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

          {/* Avatar Upload Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(197, 168, 128, 0.2)'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatar}
                alt="Avatar Preview"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  border: '3px solid var(--gold-primary)'
                }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'var(--gold-gradient)',
                  color: '#0B1323',
                  borderRadius: '999px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
                title="Alterar foto de perfil"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', color: '#FFF', margin: '0 0 4px 0' }}>
                Foto de Perfil do Corretor
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                A foto será exibida nos anúncios atribuídos e no agendamento de visitas presenciais.
              </p>
              <input
                type="url"
                className="form-input form-input-sm"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="Ou cole a URL direta da foto"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Mariana Silveira"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={13} color="var(--gold-primary)" /> CRECI
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={creci}
                  onChange={e => setCreci(e.target.value.toUpperCase())}
                  placeholder="Ex: 189422-F"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} color="var(--gold-primary)" /> E-mail Profissional *
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mariana@imobiliaria.com.br"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} color="var(--gold-primary)" /> Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Cargo / Especialidade</label>
                <input
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Ex: Consultora Sênior de Alto Padrão"
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={isActive ? 'true' : 'false'}
                  onChange={e => setIsActive(e.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Minibiografia / Experiência</label>
              <textarea
                rows={3}
                className="form-input"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Resumo das qualificações, tempo de atuação no mercado, regiões de foco..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Redes Sociais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Share2 size={13} color="var(--gold-primary)" /> Instagram / Social
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="@corretora.mariana"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={13} color="var(--gold-primary)" /> WhatsApp Direto
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="5511987654321"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Check size={16} />
              <span>{agentToEdit ? 'Salvar Corretor' : 'Cadastrar Corretor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
