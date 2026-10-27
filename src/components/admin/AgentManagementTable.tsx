import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Award, 
  Building2, 
  MessageCircle, 
  CheckCircle2, 
  XCircle,
  Share2
} from 'lucide-react';
import { Agent, Property } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatPhoneNumber } from '../../utils/formatters';
import { AgentFormModal } from './AgentFormModal';

interface AgentManagementTableProps {
  agents: Agent[];
  properties: Property[];
  onRefresh: () => void;
}

export const AgentManagementTable: React.FC<AgentManagementTableProps> = ({
  agents,
  properties,
  onRefresh
}) => {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (agent: Agent) => {
    const assignedCount = properties.filter(p => p.assignedAgentId === agent.id).length;
    let confirmMsg = `Deseja realmente remover o corretor ${agent.name}?`;
    if (assignedCount > 0) {
      confirmMsg += `\nAtenção: este corretor possui ${assignedCount} imóvel(is) atribuído(s).`;
    }

    if (window.confirm(confirmMsg)) {
      await StorageService.deleteAgent(agent.id);
      onRefresh();
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    await StorageService.toggleAgentStatus(agent.id);
    onRefresh();
  };

  return (
    <div>
      {/* Header com Ação de Cadastro */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#FFF', margin: '0 0 4px 0' }}>
            Equipe & Corretores Responsáveis
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Gerencie os corretores, CRECI, contatos de atendimento e fotos de exibição nos anúncios
          </span>
        </div>

        <button
          onClick={() => {
            setEditingAgent(null);
            setIsModalOpen(true);
          }}
          className="btn btn-gold"
          style={{ fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Cadastrar Novo Corretor</span>
        </button>
      </div>

      {/* Grid de Cards de Corretores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {agents.map(agent => {
          const assignedProperties = properties.filter(p => p.assignedAgentId === agent.id);
          const isActive = agent.isActive !== false;

          return (
            <div
              key={agent.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: '1px solid rgba(197, 168, 128, 0.25)',
                opacity: isActive ? 1 : 0.65
              }}
            >
              <div>
                {/* Topo do Card com Avatar e Dados */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '999px',
                      objectFit: 'cover',
                      border: '2px solid var(--gold-primary)',
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        color: '#FFF',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {agent.name}
                      </h3>

                      <span
                        onClick={() => handleToggleStatus(agent)}
                        style={{
                          cursor: 'pointer',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isActive ? '#34D399' : '#F87171',
                          border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                        title="Clique para alternar status"
                      >
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--gold-light)', margin: '2px 0 4px 0' }}>
                      {agent.role}
                    </div>

                    {agent.creci && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.725rem',
                        color: 'var(--text-dim)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        <Award size={12} color="var(--gold-primary)" />
                        <span>{agent.creci}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Minibiografia */}
                {agent.bio && (
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {agent.bio}
                  </p>
                )}

                {/* Contatos */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '16px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Phone size={13} color="var(--gold-primary)" />
                      {formatPhoneNumber(agent.phone)}
                    </span>
                    <a
                      href={`https://wa.me/${agent.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        textDecoration: 'none'
                      }}
                    >
                      <MessageCircle size={13} /> Chamar
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Mail size={13} color="var(--gold-primary)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.email}</span>
                  </div>

                  {agent.socialLinks?.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-light)', fontSize: '0.75rem' }}>
                      <Share2 size={13} />
                      <span>{agent.socialLinks.instagram}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé do Card com Imóveis Atribuídos e Ações */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)'
                }}>
                  <Building2 size={13} color="var(--gold-primary)" />
                  <span>{assignedProperties.length} imóveis sob gestão</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingAgent(agent);
                      setIsModalOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    title="Editar dados do corretor"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(agent)}
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      padding: '6px 8px'
                    }}
                    title="Excluir corretor"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <AgentFormModal
          agentToEdit={editingAgent}
          onClose={() => setIsModalOpen(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
};
