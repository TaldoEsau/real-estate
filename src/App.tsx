import React, { useState, useEffect } from 'react';
import { Property } from './types';
import { StorageService, subscribeToStore } from './services/storageService';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/common/Navbar';
import { PropertyCatalog } from './components/visitor/PropertyCatalog';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SavedPropertiesDrawer } from './components/visitor/SavedPropertiesDrawer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { DemoControls } from './components/common/DemoControls';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'catalog' | 'detail' | 'admin'>('catalog');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Storage state tick for reactivity
  const [storeRevision, setStoreRevision] = useState(0);

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
      setCurrentView('admin');
      setSelectedPropertyId(null);
    } else {
      if (propertyId) {
        setSelectedPropertyId(propertyId);
        setCurrentView('detail');
      } else {
        setCurrentView('catalog');
        setSelectedPropertyId(null);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedPropertyId(property.id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main View Display */}
      <main style={{ flex: 1 }}>
        {currentView === 'catalog' && (
          <PropertyCatalog
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onBookProperty={handleSelectProperty}
          />
        )}

        {currentView === 'detail' && selectedProperty && (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => {
              setCurrentView('catalog');
              setSelectedPropertyId(null);
            }}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage
            onPreviewProperty={handleSelectProperty}
            onRefresh={() => setStoreRevision(prev => prev + 1)}
          />
        )}
      </main>

      {/* Slide-over Drawers */}
      <SavedPropertiesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectProperty={handleSelectProperty}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Demo Floating Controls */}
      <DemoControls
        currentView={currentView}
        onToggleView={() => handleNavigate(currentView === 'admin' ? 'catalog' : 'admin')}
      />

      {/* Luxury Footer */}
      <footer style={{
        background: '#04070E',
        borderTop: '1px solid var(--border-gold)',
        padding: '36px 0 60px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              color: 'var(--gold-light)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: '4px'
            }}>
              AURA ESTATES
            </div>
            <div>Luxury Residential Advisory & In-Person Viewing Platform</div>
          </div>

          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
            <span>Bel-Air</span>
            <span>•</span>
            <span>Beverly Hills</span>
            <span>•</span>
            <span>Tribeca</span>
            <span>•</span>
            <span>Miami</span>
          </div>

          <div>
            English (US) | Instant Viewing Scheduling System
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FavoritesProvider>
      <AppContent />
    </FavoritesProvider>
  );
};

export default App;
