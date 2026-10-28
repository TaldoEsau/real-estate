import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Clock, DollarSign, Users, Eye, Database, RefreshCw, ExternalLink, MessageSquare, LogOut, User as UserIcon, Flame, BarChart3 } from 'lucide-react';
import { Property, BookingRequest, Lead } from '../types';
import { StorageService } from '../services/storageService';
import { LeadService } from '../services/leadService';
import { AuthService } from '../services/authService';
import { AnalyticsService, subscribeToAnalytics } from '../services/analyticsService';
import { formatCurrency } from '../utils/formatters';
import { PropertyInventoryTable } from '../components/admin/PropertyInventoryTable';
import { BookingTable } from '../components/admin/BookingTable';
import { AvailabilityManager } from '../components/admin/AvailabilityManager';
import { LeadManagementTable } from '../components/admin/LeadManagementTable';
import { AgentManagementTable } from '../components/admin/AgentManagementTable';
import { AnalyticsReportsPanel } from '../components/admin/AnalyticsReportsPanel';

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'listings' | 'bookings' | 'availability' | 'leads' | 'agents'>('analytics');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [, setAnalyticsTick] = useState(0);
  const currentUser = AuthService.getCurrentUser();
  const analyticsStore = AnalyticsService.getStore();

  useEffect(() => {
    LeadService.getLeads().then(setLeads);
    const unsubAnalytics = subscribeToAnalytics(() => setAnalyticsTick(t => t + 1));
    return unsubAnalytics;
  }, []);

  const properties = StorageService.getProperties();
  const bookings = StorageService.getBookings();
  const agents = StorageService.getAgents();

  // Metrics
  const activeListings = properties.filter(p => p.status === 'active');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalCatalogValue = activeListings.reduce((sum, p) => sum + p.price, 0);
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

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
            color: '#4A593D',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '6px'
          }}>
            Painel de Gestão Imobiliária
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--text-main)', margin: 0 }}>
            Central de Operações & Gestão
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F3F1EB',
            border: '1px solid #E4E1D7',
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}>
            <UserIcon size={16} color="var(--gold-primary)" />
            <span>Gestor: <strong style={{ color: 'var(--text-main)' }}>{currentUser?.name || 'Administrador'}</strong></span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-outline btn-sm"
              style={{
                color: '#DC2626',
                borderColor: '#FECACA',
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

      {/* Linha de Estatísticas e Métricas (KPIs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '36px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', background: '#22221E', color: '#FBFBF9' }} onClick={() => setActiveTab('analytics')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#E8ECE0' }}>Acessos & Sensor de Calor</span>
            <Flame size={18} color="#98A67C" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}>
            {analyticsStore.totalPageViews.toLocaleString('pt-BR')} <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: '#C7C5BC', fontWeight: 400 }}>acessos</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', background: '#F3F1EB' }} onClick={() => setActiveTab('listings')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Imóveis Ativos</span>
            <Building2 size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
            {activeListings.length} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--text-dim)', fontWeight: 400 }}>imóveis</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', background: '#E8ECE0' }} onClick={() => setActiveTab('bookings')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#444F39' }}>Visitas Confirmadas</span>
            <Calendar size={18} color="#2E6F40" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
            {confirmedBookings.length} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: '#444F39', fontWeight: 400 }}>agendamentos</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#F3F1EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Total do Portfólio</span>
            <DollarSign size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(totalCatalogValue)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', background: '#F3F1EB' }} onClick={() => setActiveTab('agents')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corretores & Equipe</span>
            <Users size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
            {agents.length} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--text-dim)', fontWeight: 400 }}>corretores</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', background: '#E6EEF2' }} onClick={() => setActiveTab('leads')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#42525C' }}>Leads & Interessados</span>
            <MessageSquare size={18} color="#222D35" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
            {leads.length} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: newLeadsCount > 0 ? '#B45309' : '#42525C', fontWeight: 600 }}>
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
          onClick={() => setActiveTab('analytics')}
          className={`btn ${activeTab === 'analytics' ? 'btn-gold' : 'btn-outline'}`}
        >
          <BarChart3 size={16} />
          <span>Relatórios, Acessos & Mapa de Calor</span>
        </button>

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
      {activeTab === 'analytics' && (
        <AnalyticsReportsPanel
          properties={properties}
          bookings={bookings}
          leads={leads}
          onPreviewProperty={onPreviewProperty}
        />
      )}

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
