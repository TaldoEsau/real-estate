import React, { useState } from 'react';
import { Building2, Calendar, Clock, DollarSign, Users, Eye, Database, RefreshCw, ExternalLink } from 'lucide-react';
import { Property, BookingRequest } from '../types';
import { StorageService } from '../services/storageService';
import { formatCurrency } from '../utils/formatters';
import { PropertyInventoryTable } from '../components/admin/PropertyInventoryTable';
import { BookingTable } from '../components/admin/BookingTable';
import { AvailabilityManager } from '../components/admin/AvailabilityManager';

interface AdminDashboardPageProps {
  onPreviewProperty: (property: Property) => void;
  onRefresh: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onPreviewProperty,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'availability'>('bookings');

  const properties = StorageService.getProperties();
  const bookings = StorageService.getBookings();
  const agents = StorageService.getAgents();

  // Metrics
  const activeListings = properties.filter(p => p.status === 'active');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalCatalogValue = activeListings.reduce((sum, p) => sum + p.price, 0);

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
      {/* Dashboard Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--gold-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '6px'
        }}>
          Agency Management Console
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF' }}>
          Real Estate Operations & Viewing Hub
        </h1>
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
                <span style={{ color: '#34D399' }}>✓ Supabase Database Connected & Synchronized</span>
              ) : (
                <span style={{ color: '#FBBF24' }}>Supabase Connection Configured — Tables Awaiting Migration</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {supabaseStatus === 'ready' ? (
                'All created properties and viewing bookings are stored directly in live Supabase cloud tables.'
              ) : (
                'To persist your records in live Supabase tables, run the SQL schema script in your Supabase SQL Editor.'
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
              <span>{copiedSql ? 'Opening Supabase...' : 'Open SQL Editor in Supabase'}</span>
            </button>
          )}

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="btn btn-gold btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data with Supabase'}</span>
          </button>
        </div>

        {syncFeedback && (
          <div style={{
            width: '100%',
            marginTop: '8px',
            fontSize: '0.8rem',
            color: syncFeedback.includes('Success') || syncFeedback.includes('success') ? '#34D399' : '#F87171'
          }}>
            {syncFeedback}
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '36px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Inventory</span>
            <Building2 size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {activeListings.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>properties</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmed Viewings</span>
            <Calendar size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {confirmedBookings.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>appointments</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catalog Portfolio Value</span>
            <DollarSign size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-gold)', fontFamily: 'var(--font-serif)' }}>
            {formatCurrency(totalCatalogValue)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Partners</span>
            <Users size={18} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
            {agents.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>advisors</span>
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
          onClick={() => setActiveTab('bookings')}
          className={`btn ${activeTab === 'bookings' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Calendar size={16} />
          <span>Viewing Requests & Appointments ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`btn ${activeTab === 'listings' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Building2 size={16} />
          <span>Property Inventory Management ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`btn ${activeTab === 'availability' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Clock size={16} />
          <span>Availability & Blackout Calendar</span>
        </button>
      </div>

      {/* Tab Panels */}
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
