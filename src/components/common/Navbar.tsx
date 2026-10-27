import React, { useState } from 'react';
import { Home, Heart, Bell, Shield, Menu, X, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useTenant } from '../../context/TenantContext';
import { StorageService } from '../../services/storageService';

interface NavbarProps {
  currentView: 'catalog' | 'detail' | 'admin';
  onNavigate: (view: 'catalog' | 'admin', propertyId?: string) => void;
  onOpenFavorites: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenFavorites,
  onOpenNotifications
}) => {
  const { tenant } = useTenant();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifications = StorageService.getNotifications();
  const unreadCount = notifications.filter(n => n.status === 'delivered').length;

  const brandParts = tenant.name.split(' ');
  const brandMain = brandParts[0] || 'IMÓVEIS';
  const brandSub = brandParts.slice(1).join(' ') || 'CONSULTORIA';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 10, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-gold)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(197, 168, 128, 0.35)'
          }}>
            <Home size={22} color="#0B1323" strokeWidth={2.2} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#FFF',
              display: 'block',
              lineHeight: 1
            }}>
              {brandMain.toUpperCase()}
            </span>
            <span style={{
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: 'var(--gold-light)',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              {brandSub}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '28px'
        }} className="desktop-nav">
          <button
            onClick={() => onNavigate('catalog')}
            className="btn btn-ghost"
            style={{
              color: currentView === 'catalog' ? 'var(--gold-primary)' : 'var(--text-main)',
              fontWeight: 600
            }}
          >
            Explore Properties
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="btn btn-ghost"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Saved Properties"
          >
            <Heart size={18} color={favoritesCount > 0 ? '#F87171' : 'currentColor'} fill={favoritesCount > 0 ? '#F87171' : 'none'} />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '999px',
                marginLeft: '2px'
              }}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Notifications Simulator Trigger */}
          <button
            onClick={onOpenNotifications}
            className="btn btn-ghost"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Simulated Email & Audit Notifications"
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--gold-primary)',
                color: '#0B1323',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '999px'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Switcher */}
          {currentView === 'admin' ? (
            <button
              onClick={() => onNavigate('catalog')}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              <Home size={16} />
              <span>Back to Public Catalog</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="btn btn-gold"
              style={{ fontSize: '0.8rem' }}
            >
              <Shield size={16} />
              <span>Agency Admin Portal</span>
              <ArrowRight size={14} />
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="mobile-actions">
          <button
            onClick={onOpenNotifications}
            className="btn btn-ghost"
            style={{ padding: '8px' }}
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost mobile-menu-toggle"
            style={{ padding: '8px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(7, 11, 20, 0.98)',
          borderBottom: '1px solid var(--border-gold)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <button
            onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            <Home size={18} />
            <span>Explore Properties</span>
          </button>

          <button
            onClick={() => { onOpenFavorites(); setMobileMenuOpen(false); }}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            <Heart size={18} />
            <span>Saved Favorites ({favoritesCount})</span>
          </button>

          <button
            onClick={() => { onOpenNotifications(); setMobileMenuOpen(false); }}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            <Bell size={18} />
            <span>Notification Logs ({notifications.length})</span>
          </button>

          {currentView === 'admin' ? (
            <button
              onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
              className="btn btn-gold"
            >
              <Home size={18} />
              <span>Visitor Catalog</span>
            </button>
          ) : (
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className="btn btn-gold"
            >
              <Shield size={18} />
              <span>Agency Admin Portal</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
