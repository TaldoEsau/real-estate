import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Clock, DollarSign, Users, Eye, Database, RefreshCw, ExternalLink, MessageSquare, LogOut, User as UserIcon } from 'lucide-react';
import { Property, BookingRequest, Lead } from '../types';
import { StorageService } from '../services/storageService';
import { LeadService } from '../services/leadService';
import { AuthService } from '../services/authService';
import { formatCurrency } from '../utils/formatters';
import { PropertyInventoryTable } from '../components/admin/PropertyInventoryTable';
import { BookingTable } from '../components/admin/BookingTable';
import { AvailabilityManager } from '../components/admin/AvailabilityManager';
import { LeadManagementTable } from '../components/admin/LeadManagementTable';
import { AgentManagementTable } from '../components/admin/AgentManagementTable';

interface AdminDashboardPageProps {
  onPreviewProperty: (property: Property) => void;
  onRefresh: () => void;
  onLogout?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onPreviewProperty,
  onRefresh,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'availability' | 'leads' | 'agents'>('agents');
  const [leads, setLeads] = useState<Lead[]>([]);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    LeadService.getLeads().then(setLeads);
  }, []);

  const properties = StorageService.getProperties();
  const bookings = StorageService.getBookings();
  const agents = StorageService.getAgents();

  // Metrics
  const activeListings = properties.filter(p => p.status === 'active');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalCatalogValue = activeListings.reduce((sum, p) => sum + p.price, 0);
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseStatus = StorageService.getSupabaseStatus();

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await StorageService.syncAllToSupabase();
    setIsSyncing(false);
    setSyncFeedback(result.message);
    if (result.success) onRefresh();
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleCopySql = () => {
    const sqlUrl = 'https://supabase.com/dashboard/project/fdcvfizcfuxwimpnablp/sql';
    window.open(sqlUrl, '_blank');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '90px' }}>
      {/* Dashboard Header com Usuário & Logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--gold-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px'
          }}>
            Painel de Gestão Imobiliária
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: 0 }}>
            Central de Operações & Gestão
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}>
            <UserIcon size={16} color="var(--gold-primary)" />
            <span>Gestor: <strong style={{ color: '#FFF' }}>{currentUser?.name || 'Administrador'}</strong></span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-outline btn-sm"
              style={{
                color: '#F87171',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Encerrar sessão administrativa"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>

      {/* Supabase Database Connection & Migration Banner */}
      <div style={{
        background: supabaseStatus === 'ready' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.12)',
        border: supabaseStatus === 'ready' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 22px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            background: supabaseStatus === 'ready' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: supabaseStatus === 'ready' ? '#34D399' : '#FBBF24',
            flexShrink: 0
          }}>
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
              {supabaseStatus === 'ready' ? (
                <span style={{ color: '#34D399' }}>✓ Banco de Dados Supabase Conectado & Sincronizado</span>
              ) : (
                <span style={{ color: '#FBBF24' }}>Conexão com Supabase Configurada — Aguardando Execução do Script SQL</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {supabaseStatus === 'ready' ? (
                'Todos os imóveis, corretores, leads e agendamentos estão sendo persistidos diretamente no Supabase.'
              ) : (
                'Para persistir todos os dados nas tabelas em nuvem do Supabase, execute o script SQL no Supabase SQL Editor.'
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {supabaseStatus !== 'ready' && (
            <button
              onClick={handleCopySql}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <ExternalLink size={13} />
              <span>{copiedSql ? 'Abrindo Supabase...' : 'Abrir SQL Editor no Supabase'}</span>
            </button>
          )}

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="btn btn-gold btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar com Banco Supabase'}</span>
          </button>
        </div>

        {syncFeedback && (
          <div style={{
            width: '100%',
            marginTop: '8px',
            fontSize: '0.8rem',
            color: syncFeedback.includes('Success') || syncFeedback.includes('success') || syncFeedback.includes('sucesso') ? '#34D399' : '#F87171'
          }}>
            {syncFeedback}
          </div>
        )}
      </div>

      {/* Linha de Estatísticas e Métricas (KPIs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '36px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('listings')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Imóveis Ativos</span>
            <Building2 size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {activeListings.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>imóveis</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('bookings')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visitas Confirmadas</span>
            <Calendar size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {confirmedBookings.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>agendamentos</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Total do Portfólio</span>
            <DollarSign size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-gold)', fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(totalCatalogValue)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('agents')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corretores & Equipe</span>
            <Users size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {agents.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>corretores</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('leads')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Leads & Interessados</span>
            <MessageSquare size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {leads.length} <span style={{ fontSize: '0.9rem', color: newLeadsCount > 0 ? '#FBBF24' : 'var(--text-dim)', fontWeight: 600 }}>
              {newLeadsCount > 0 ? `(${newLeadsCount} novos)` : 'leads'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-gold)',
        paddingBottom: '14px',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('leads')}
          className={`btn ${activeTab === 'leads' ? 'btn-gold' : 'btn-outline'}`}
        >
          <MessageSquare size={16} />
          <span>Leads & CRM ({leads.length})</span>
          {newLeadsCount > 0 && (
            <span style={{
              background: '#F59E0B',
              color: '#041E11',
              borderRadius: '999px',
              padding: '1px 7px',
              fontSize: '0.7rem',
              fontWeight: 800,
              marginLeft: '4px'
            }}>
              {newLeadsCount} novos
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`btn ${activeTab === 'bookings' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Calendar size={16} />
          <span>Visitas Agendadas ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`btn ${activeTab === 'listings' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Building2 size={16} />
          <span>Gestão de Imóveis ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`btn ${activeTab === 'agents' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Users size={16} />
          <span>Corretores & Equipe ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`btn ${activeTab === 'availability' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Clock size={16} />
          <span>Disponibilidade & Bloqueios</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'agents' && (
        <AgentManagementTable
          agents={agents}
          properties={properties}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'leads' && (
        <LeadManagementTable onRefresh={() => {
          LeadService.getLeads().then(setLeads);
          onRefresh();
        }} />
      )}

      {activeTab === 'bookings' && (
        <BookingTable bookings={bookings} onRefresh={onRefresh} />
      )}

      {activeTab === 'listings' && (
        <PropertyInventoryTable
          properties={properties}
          onRefresh={onRefresh}
          onPreviewProperty={onPreviewProperty}
        />
      )}

      {activeTab === 'availability' && (
        <AvailabilityManager
          properties={properties}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
