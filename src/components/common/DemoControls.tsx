import React, { useState } from 'react';
import { Database, RotateCcw, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { StorageService } from '../../services/storageService';

interface DemoControlsProps {
  currentView: 'catalog' | 'detail' | 'admin';
  onToggleView: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ currentView, onToggleView }) => {
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all demo listings, bookings, and notifications to default sample data?')) {
      StorageService.resetDemoData();
      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 2500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '18px',
      right: '18px',
      zIndex: 90,
      background: 'rgba(7, 11, 20, 0.94)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--border-gold)',
      borderRadius: 'var(--radius-full)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: 'var(--shadow-elevated)',
      fontSize: '0.75rem'
    }}>
      {/* Supabase Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          background: isSupabaseConfigured ? '#10B981' : '#F59E0B',
          boxShadow: `0 0 8px ${isSupabaseConfigured ? '#10B981' : '#F59E0B'}`
        }} />
        <span style={{ color: 'var(--text-muted)' }}>
          {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
        </span>
      </div>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* Quick View Toggle */}
      <button
        onClick={onToggleView}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--gold-light)',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <Sparkles size={12} color="var(--gold-primary)" />
        <span>Switch to {currentView === 'admin' ? 'Visitor View' : 'Admin Portal'}</span>
      </button>

      <span style={{ color: 'var(--border-subtle)' }}>|</span>

      {/* Reset Demo Data Button */}
      <button
        onClick={handleReset}
        title="Reset catalog and bookings to seed data"
        style={{
          background: 'none',
          border: 'none',
          color: resetFeedback ? '#34D399' : 'var(--text-dim)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {resetFeedback ? <Check size={12} /> : <RotateCcw size={12} />}
        <span>{resetFeedback ? 'Data Reset!' : 'Reset Demo'}</span>
      </button>
    </div>
  );
};
