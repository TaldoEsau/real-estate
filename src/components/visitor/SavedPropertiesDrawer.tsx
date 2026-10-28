import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { StorageService } from '../../services/storageService';
import { Property } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SavedPropertiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
}

export const SavedPropertiesDrawer: React.FC<SavedPropertiesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProperty
}) => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const allProperties = StorageService.getProperties();

  const savedProperties = allProperties.filter(p => favoriteIds.includes(p.id));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          background: 'var(--bg-glass-modal)',
          borderLeft: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="#4A593D" fill="#98A67C" />
            <h3 style={{ fontSize: '1.25rem', color: '#1F1F1C' }}>
              Imóveis Favoritos ({savedProperties.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar Favoritos"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {savedProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Heart size={40} color="var(--border-gold)" style={{ margin: '0 auto 12px auto' }} />
              <p>Você ainda não salvou nenhum imóvel.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Clique no ícone de coração em qualquer anúncio para adicioná-lo aos favoritos.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {savedProperties.map(property => (
                <div
                  key={property.id}
                  style={{
                    background: '#F3F1EB',
                    border: '1px solid #E4E1D7',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '12px',
                    padding: '10px',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={property.featuredImage}
                    alt={property.title}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: '#4A593D', fontWeight: 600 }}>
                      {property.location.city}
                    </div>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-serif)',
                      color: '#1F1F1C',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {property.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3E4D32', marginTop: '2px' }}>
                      {formatCurrency(property.price)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProperty(property);
                      }}
                      className="btn btn-gold btn-sm"
                      title="Ver Detalhes"
                      style={{ padding: '6px 8px' }}
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="btn btn-ghost btn-sm"
                      title="Remover dos favoritos"
                      style={{ padding: '6px 8px', color: '#F87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
