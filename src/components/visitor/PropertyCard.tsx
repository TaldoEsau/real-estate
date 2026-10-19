import React from 'react';
import { Bed, Bath, Maximize2, MapPin, Heart, Calendar } from 'lucide-react';
import { Property } from '../../types';
import { formatCurrency, formatArea } from '../../utils/formatters';
import { useFavorites } from '../../context/FavoritesContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookViewing?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onBookViewing
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookViewing) {
      onBookViewing(property);
    } else {
      onSelect(property);
    }
  };

  return (
    <div
      onClick={() => onSelect(property)}
      className="glass-panel"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Property Cover Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '62%', // 16:10 aspect
        overflow: 'hidden',
        backgroundColor: '#070B14'
      }}>
        <img
          src={property.featuredImage}
          alt={property.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="property-img-hover"
        />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(6,10,18,0.2) 0%, rgba(6,10,18,0.7) 100%)'
        }} />

        {/* Property Type Badge */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          display: 'flex',
          gap: '8px'
        }}>
          <span className="badge badge-gold">
            {property.propertyType.toUpperCase()}
          </span>
          {property.status === 'archived' && (
            <span className="badge badge-status-cancelled">Archived</span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save Property"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            background: 'rgba(6, 10, 18, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Heart
            size={18}
            color={favorited ? '#F87171' : '#FFF'}
            fill={favorited ? '#F87171' : 'none'}
          />
        </button>

        {/* Price Tag in Image Footer */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          left: '16px'
        }}>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#FFF',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}>
            {formatCurrency(property.price)}
          </span>
        </div>
      </div>

      {/* Property Details Section */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--gold-light)',
            fontSize: '0.8rem',
            marginBottom: '6px'
          }}>
            <MapPin size={14} color="var(--gold-primary)" />
            <span>{property.location.city}, {property.location.state}</span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#FFF',
            marginBottom: '14px',
            lineHeight: 1.35
          }}>
            {property.title}
          </h3>

          {/* Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '12px 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bed size={16} color="var(--gold-primary)" />
              <span>{property.specs.bedrooms} Beds</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bath size={16} color="var(--gold-primary)" />
              <span>{property.specs.bathrooms} Baths</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Maximize2 size={16} color="var(--gold-primary)" />
              <span>{formatArea(property.specs.areaSqFt)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleBookClick}
            className="btn btn-gold"
            style={{ width: '100%', fontSize: '0.8rem' }}
          >
            <Calendar size={15} />
            <span>Book a Viewing</span>
          </button>
        </div>
      </div>

      <style>{`
        .property-img-hover:hover {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};
