import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Lead, LeadStatus, LeadType } from '../../types';
import { LeadService } from '../../services/leadService';
import { formatDateTime, formatPhoneNumber } from '../../utils/formatters';

interface LeadManagementTableProps {
  onRefresh?: () => void;
}

export const LeadManagementTable: React.FC<LeadManagementTableProps> = ({ onRefresh }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await LeadService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await LeadService.updateLeadStatus(leadId, newStatus);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    if (onRefresh) onRefresh();
  };

  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (typeFilter !== 'all' && l.leadType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchEmail = l.email.toLowerCase().includes(q);
      const matchPhone = l.phone.toLowerCase().includes(q);
      const matchProperty = (l.propertyTitle || '').toLowerCase().includes(q);
      const matchCode = (l.propertyCode || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchProperty && !matchCode) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Novo</span>;
      case 'contacted':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Em Contato</span>;
      case 'scheduled':
        return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Visita Agendada</span>;
      case 'won':
        return <span className="badge badge-status-confirmed">Negócio Fechado</span>;
      case 'lost':
        return <span className="badge badge-status-cancelled">Perdido</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: LeadType) => {
    switch (type) {
      case 'property_inquiry':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--gold-light)', fontSize: '0.75rem', fontWeight: 600 }}>
            <MessageSquare size={13} color="var(--gold-primary)" /> Interesse em Imóvel
          </span>
        );
      case 'report_error':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#F87171', fontSize: '0.75rem', fontWeight: 600 }}>
            <AlertTriangle size={13} color="#F87171" /> Reporte de Erro
          </span>
        );
      case 'general_contact':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#60A5FA', fontSize: '0.75rem', fontWeight: 600 }}>
            <Users size={13} color="#60A5FA" /> Contato Geral
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const handleOpenWhatsApp = (phone: string, name: string, propertyTitle?: string) => {
    const rawNumber = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${name}! Sou da consultoria imobiliária. Recebemos sua mensagem sobre ${propertyTitle ? `o imóvel "${propertyTitle}"` : 'nossos imóveis'}. Como posso ajudar?`
    );
    window.open(`https://wa.me/${rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`}?text=${text}`, '_blank');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Cabeçalho do CRM */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#FFF', margin: '0 0 4px 0' }}>
            CRM & Gestão de Leads Recebidos
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Acompanhe o funil de atendimento, interessados em imóveis e reportes em tempo real
          </span>
        </div>

        <button
          onClick={loadLeads}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.78rem' }}
        >
          Atualizar Lista
        </button>
      </div>

      {/* Barra de Filtros do CRM */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        {/* Busca por texto */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--gold-primary)" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input form-input-sm"
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar por cliente, telefone, e-mail ou imóvel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtro de Status */}
        <div style={{ minWidth: '150px' }}>
          <select
            className="form-select form-input-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="new">Novos (Sem contato)</option>
            <option value="contacted">Em Contato</option>
            <option value="scheduled">Visita Agendada</option>
            <option value="won">Negócio Fechado</option>
            <option value="lost">Perdido</option>
          </select>
        </div>

        {/* Filtro por Tipo de Lead */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select form-input-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            <option value="property_inquiry">Interesse em Imóvel</option>
            <option value="report_error">Reportes de Erro</option>
            <option value="general_contact">Contato Institucional</option>
          </select>
        </div>
      </div>

      {/* Tabela de Leads */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Carregando leads da imobiliária...
        </div>
      ) : filteredLeads.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{
                textAlign: 'left',
                borderBottom: '1px solid var(--border-gold)',
                color: 'var(--gold-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.725rem'
              }}>
                <th style={{ padding: '12px 10px' }}>Data / Tipo</th>
                <th style={{ padding: '12px 10px' }}>Cliente</th>
                <th style={{ padding: '12px 10px' }}>Contatos</th>
                <th style={{ padding: '12px 10px' }}>Imóvel / Referência</th>
                <th style={{ padding: '12px 10px' }}>Status no Funil</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <React.Fragment key={lead.id}>
                  <tr style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s ease'
                  }}>
                    {/* Data / Tipo */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>
                        {formatDateTime(lead.createdAt)}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {getTypeBadge(lead.leadType)}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <strong style={{ color: '#FFF', display: 'block' }}>{lead.name}</strong>
                      {lead.message && (
                        <button
                          type="button"
                          onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-light)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '2px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span>{expandedLeadId === lead.id ? 'Ocultar mensagem' : 'Ver mensagem'}</span>
                          <ChevronDown size={12} style={{ transform: expandedLeadId === lead.id ? 'rotate(180deg)' : 'none' }} />
                        </button>
                      )}
                    </td>

                    {/* Contatos */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                          <Phone size={12} color="var(--gold-primary)" />
                          {formatPhoneNumber(lead.phone)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                          <Mail size={12} color="var(--gold-primary)" />
                          {lead.email}
                        </span>
                      </div>
                    </td>

                    {/* Imóvel Referência */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      {lead.propertyTitle ? (
                        <div>
                          <span style={{
                            display: 'inline-block',
                            background: 'rgba(197, 168, 128, 0.15)',
                            color: 'var(--gold-light)',
                            borderRadius: '3px',
                            padding: '1px 5px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            marginBottom: '2px'
                          }}>
                            {lead.propertyCode || 'REF'}
                          </span>
                          <div style={{ color: '#FFF', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.propertyTitle}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>Geral da Empresa</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>{getStatusBadge(lead.status)}</div>
                        <select
                          className="form-select form-input-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', height: 'auto' }}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        >
                          <option value="new">Novo</option>
                          <option value="contacted">Em Contato</option>
                          <option value="scheduled">Visita Agendada</option>
                          <option value="won">Negócio Fechado</option>
                          <option value="lost">Perdido</option>
                        </select>
                      </div>
                    </td>

                    {/* Ações Rápidas (WhatsApp / Email) */}
                    <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {lead.phone && (
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.propertyTitle)}
                            className="btn btn-sm"
                            title="Conversar no WhatsApp"
                            style={{
                              backgroundColor: 'rgba(37, 211, 102, 0.15)',
                              border: '1px solid rgba(37, 211, 102, 0.4)',
                              color: '#25D366',
                              padding: '6px 10px'
                            }}
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </button>
                        )}
                        <a
                          href={`mailto:${lead.email}?subject=Contato sobre ${lead.propertyTitle || 'imóveis'}`}
                          className="btn btn-outline btn-sm"
                          title="Enviar E-mail"
                          style={{ padding: '6px 10px' }}
                        >
                          <Mail size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>

                  {/* Detalhes expandidos da mensagem */}
                  {expandedLeadId === lead.id && (
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <td colSpan={6} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{
                          background: 'rgba(6, 10, 18, 0.6)',
                          border: '1px solid rgba(197, 168, 128, 0.2)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 16px'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 700, marginBottom: '4px' }}>
                            {lead.leadType === 'report_error' ? 'DETALHES DO ERRO REPORTADO:' : 'MENSAGEM ENVIADA PELO CLIENTE:'}
                          </div>
                          <p style={{ color: '#FFF', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {lead.message || 'Sem mensagem adicional'}
                          </p>
                          {lead.details?.problemType && (
                            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#F87171' }}>
                              Tipo reportado: <strong>{lead.details.problemType}</strong>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          Nenhum lead encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
};
