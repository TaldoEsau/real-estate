import React, { useState } from 'react';
import { Home, Menu, X, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

interface NavbarProps {
  currentView: 'catalog' | 'detail' | 'admin';
  onNavigate: (view: 'catalog' | 'admin', propertyId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate
}) => {
  const { tenant } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandParts = tenant.name.split(' ');
  const brandMain = brandParts[0] || 'IMÓVEIS';
  const brandSub = brandParts.slice(1).join(' ') || 'CONSULTORIA';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 10, 18, 0.92)',
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
          gap: '24px'
        }} className="desktop-nav">
          <button
            onClick={() => onNavigate('catalog')}
            className="btn btn-ghost"
            style={{
              color: currentView === 'catalog' ? 'var(--gold-primary)' : 'var(--text-main)',
              fontWeight: 600
            }}
          >
            Imóveis Disponíveis
          </button>

          {tenant.whatsapp && (
            <a
              href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={15} color="#25D366" />
              <span>Fale Conosco</span>
            </a>
          )}

          {/* Se estiver no Painel Admin, botão discreto para voltar ao site */}
          {currentView === 'admin' && (
            <button
              onClick={() => onNavigate('catalog')}
              className="btn btn-gold btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <ArrowLeft size={15} />
              <span>Voltar ao Site</span>
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="mobile-actions">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost mobile-menu-toggle"
            style={{ padding: '8px' }}
            aria-label="Abrir Menu"
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
          gap: '12px'
        }}>
          <button
            onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            <Home size={18} />
            <span>Imóveis Disponíveis</span>
          </button>

          {tenant.whatsapp && (
            <a
              href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', color: '#25D366' }}
            >
              <MessageCircle size={18} />
              <span>WhatsApp de Atendimento</span>
            </a>
          )}

          {currentView === 'admin' && (
            <button
              onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
              className="btn btn-gold"
              style={{ justifyContent: 'flex-start' }}
            >
              <ArrowLeft size={18} />
              <span>Voltar ao Site Público</span>
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
