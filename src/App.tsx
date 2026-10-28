import React, { useState, useEffect } from 'react';
import { Property } from './types';
import { StorageService, subscribeToStore } from './services/storageService';
import { AuthService } from './services/authService';
import { AnalyticsService } from './services/analyticsService';
import { TenantProvider, useTenant } from './context/TenantContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/common/Navbar';
import { PropertyCatalog } from './components/visitor/PropertyCatalog';
import { PublicTab } from './components/visitor/VideoPresentationHero';
import { SavedPropertiesDrawer } from './components/visitor/SavedPropertiesDrawer';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';

export const AppContent: React.FC = () => {
  const { tenant, settings } = useTenant();
  
  // Rota ativa baseada em estado e URL
  const [currentView, setCurrentView] = useState<'catalog' | 'detail' | 'admin'>('catalog');
  const [activeTab, setActiveTab] = useState<PublicTab>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  // Estado de autenticação do administrador
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());

  // Storage state tick para reatividade
  const [storeRevision, setStoreRevision] = useState(0);

  // Escuta alterações na autenticação e inicializa sessão real de telemetria
  useEffect(() => {
    AnalyticsService.initRealSession();
    const unsubAuth = AuthService.subscribe(user => {
      setIsAuthenticated(!!user && user.isActive);
    });
    return unsubAuth;
  }, []);

  // Escuta alterações na URL (hashchange) para suportar navegação direta por rota /admin ou #admin
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash.includes('admin') || path.includes('/admin')) {
        setCurrentView('admin');
        setSelectedPropertyId(null);
      } else if (hash.startsWith('#imovel/') || hash.startsWith('#/imovel/')) {
        const propId = hash.replace('#/imovel/', '').replace('#imovel/', '').trim();
        if (propId) {
          setSelectedPropertyId(propId);
          setCurrentView('detail');
        }
      } else {
        if (currentView === 'admin' && !hash.includes('admin')) {
          setCurrentView('catalog');
          setSelectedPropertyId(null);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentView]);

  // Reatividade ao armazenamento de dados
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setStoreRevision(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const properties = StorageService.getProperties();
  const selectedProperty = selectedPropertyId
    ? StorageService.getPropertyById(selectedPropertyId)
    : null;

  const handleNavigate = (view: 'catalog' | 'admin', propertyId?: string) => {
    if (view === 'admin') {
      window.location.hash = '#/admin';
      setCurrentView('admin');
      setSelectedPropertyId(null);
    } else {
      if (propertyId) {
        window.location.hash = `#/imovel/${propertyId}`;
        setSelectedPropertyId(propertyId);
        setCurrentView('detail');
      } else {
        window.location.hash = '#/';
        setCurrentView('catalog');
        setSelectedPropertyId(null);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: PublicTab) => {
    setActiveTab(tab);
    AnalyticsService.trackPageView(tab);
    if (currentView !== 'catalog') {
      window.location.hash = '#/';
      setCurrentView('catalog');
      setSelectedPropertyId(null);
    }
  };

  const handleSelectProperty = (property: Property) => {
    AnalyticsService.trackPropertyView(property);
    window.location.hash = `#/imovel/${property.id}`;
    setSelectedPropertyId(property.id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sensor Global de Calor (Heatmap): captura cliques reais dos visitantes no site público
  const handleGlobalHeatmapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentView === 'admin') return;

    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    );
    const xPercent = (e.clientX / Math.max(window.innerWidth, 1)) * 100;
    const yPercent = ((e.clientY + window.scrollY) / Math.max(docHeight, 1)) * 100;

    const target = e.target as HTMLElement;
    const interactiveEl = target.closest('button, a, input, select, [data-slot="cutout-card"]') as HTMLElement | null;
    const rawLabel =
      interactiveEl?.getAttribute('title') ||
      interactiveEl?.getAttribute('aria-label') ||
      interactiveEl?.innerText?.trim().split('\n')[0]?.slice(0, 42) ||
      target.tagName.toLowerCase();

    let zone: 'navbar' | 'hero_video' | 'search_filters' | 'property_cards' | 'institutional_footer' | 'property_detail' = 'property_cards';
    if (currentView === 'detail') {
      zone = 'property_detail';
    } else if (target.closest('header')) {
      zone = 'navbar';
    } else if (target.closest('#pesquisa-imoveis')) {
      zone = 'search_filters';
    } else if (target.closest('footer')) {
      zone = 'institutional_footer';
    } else if (yPercent < 46) {
      zone = 'hero_video';
    } else if (yPercent > 86) {
      zone = 'institutional_footer';
    }

    AnalyticsService.trackHeatmapClick({
      xPercent,
      yPercent,
      tab: currentView === 'detail' ? 'detail' : activeTab,
      zone,
      elementLabel: rawLabel || 'Interação na Página',
    });
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    window.location.hash = '#/';
    setCurrentView('catalog');
    setSelectedPropertyId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      onClickCapture={handleGlobalHeatmapClick}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Barra de Navegação Superior com Identidade Visual e Abas (Início, Empresa, Venda, Locação, Temporada, Contato) */}
      <Navbar
        currentView={currentView}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onSelectTab={handleSelectTab}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      {/* Exibição Principal de Conteúdo */}
      <main style={{ flex: 1 }}>
        {currentView === 'catalog' && (
          <PropertyCatalog
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onBookProperty={handleSelectProperty}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />
        )}

        {currentView === 'detail' && selectedProperty && (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => {
              window.location.hash = '#/';
              setCurrentView('catalog');
              setSelectedPropertyId(null);
            }}
          />
        )}

        {/* Rota Administrativa Protegida */}
        {currentView === 'admin' && (
          isAuthenticated ? (
            <AdminDashboardPage
              onPreviewProperty={handleSelectProperty}
              onRefresh={() => setStoreRevision(prev => prev + 1)}
              onLogout={handleLogout}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                setStoreRevision(prev => prev + 1);
              }}
              onBackToPublic={() => {
                window.location.hash = '#/';
                setCurrentView('catalog');
              }}
            />
          )
        )}
      </main>

      {/* Gaveta de Imóveis Favoritos (acessada pelo botão ★ na barra superior) */}
      <SavedPropertiesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectProperty={handleSelectProperty}
      />

      {/* Rodapé Institucional (Estilo Editorial) */}
      <footer style={{
        background: '#F3F1EB',
        borderTop: '1px solid #E4E1D7',
        padding: '44px 0 60px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          fontSize: '0.82rem',
          color: '#5F5E58'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              color: '#1F1F1C',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}>
              {tenant.name}
            </div>
            <div>{settings.aboutTitle || 'Consultoria Imobiliária & Intermediação de Imóveis'}</div>
            {tenant.documentNumber && (
              <div style={{ fontSize: '0.75rem', marginTop: '2px', color: '#4A593D', fontWeight: 600 }}>
                {tenant.documentNumber}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-muted)' }}>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('empresa');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Empresa
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('venda');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Venda
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('locacao');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Locação
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('temporada');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Temporada
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectTab('contato');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Contato
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span>
              {tenant.address.city && tenant.address.state
                ? `${tenant.address.city} - ${tenant.address.state}`
                : 'Plataforma Imobiliária'}
            </span>
            <span style={{ opacity: 0.3 }}>•</span>
            
            {/* Acesso Restrito ao Dono da Imobiliária */}
            <button
              onClick={() => handleNavigate('admin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: 0.5,
                padding: 0
              }}
              title="Acesso exclusivo ao proprietário e administradores"
            >
              Acesso Restrito
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TenantProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </TenantProvider>
  );
};

export default App;
