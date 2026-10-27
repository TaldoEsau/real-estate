import React from 'react';
import { Bed, Bath, Maximize2, MapPin, Heart, Calendar, Car, Hash } from 'lucide-react';
import { Property } from '../../types';
import { formatCurrency, formatAreaM2 } from '../../utils/formatters';
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

  const areaDisplay = property.specs.areaSqM 
    ? formatAreaM2(property.specs.areaSqM)
    : formatAreaM2(Math.round(property.specs.areaSqFt / 10.764));

  const getListingBadge = () => {
    if (property.listingType === 'both') {
      return <span className="badge badge-gold">VENDA & ALUGUEL</span>;
    }
    if (property.listingType === 'for_rent') {
      return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }}>LOCAÇÃO</span>;
    }
    return <span className="badge badge-gold">VENDA</span>;
  };

  const typeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    villa: 'Casa em Condomínio',
    penthouse: 'Cobertura',
    townhouse: 'Townhouse',
    commercial: 'Comercial'
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
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
          background: 'linear-gradient(180deg, rgba(6,10,18,0.25) 0%, rgba(6,10,18,0.75) 100%)'
        }} />

        {/* Property Type & Listing Badges */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {getListingBadge()}
          <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#FFF' }}>
            {typeLabels[property.propertyType] || property.propertyType.toUpperCase()}
          </span>
        </div>

        {/* Código de Referência do Anúncio (Feature do Legado) */}
        {property.code && (
          <div style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            background: 'rgba(6, 10, 18, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.7rem',
            color: 'var(--gold-light)',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            CÓD: {property.code}
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Salvar Imóvel"
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
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
        >
          <Heart
            size={18}
            color={favorited ? '#F87171' : '#FFF'}
            fill={favorited ? '#F87171' : 'none'}
          />
        </button>

        {/* Preços (Venda e/ou Aluguel) */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {property.listingType !== 'for_rent' && property.price > 0 && (
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
          )}

          {property.rentalPrice && property.rentalPrice > 0 && (
            <span style={{
              fontSize: property.price > 0 ? '0.85rem' : '1.35rem',
              fontWeight: 700,
              color: 'var(--gold-light)',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {formatCurrency(property.rentalPrice)}/mês {property.price > 0 ? '(locação)' : ''}
            </span>
          )}
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
          {/* Localização (Bairro, Cidade - UF) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--gold-light)',
            fontSize: '0.8rem',
            marginBottom: '6px'
          }}>
            <MapPin size={14} color="var(--gold-primary)" />
            <span>
              {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
              {property.location.city} - {property.location.state}
            </span>
          </div>

          {/* Título do Anúncio */}
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#FFF',
            marginBottom: '14px',
            lineHeight: 1.35
          }}>
            {property.title}
          </h3>

          {/* Grid de Especificações (Quartos, Suítes, Banheiros, Metragem) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            padding: '12px 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Bed size={15} color="var(--gold-primary)" />
              <span>{property.specs.bedrooms} Qts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Bath size={15} color="var(--gold-primary)" />
              <span>{property.specs.bathrooms} Ban</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Car size={15} color="var(--gold-primary)" />
              <span>{property.specs.garageSpaces || 0} Vag</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Maximize2 size={15} color="var(--gold-primary)" />
              <span>{areaDisplay}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleBookClick}
            className="btn btn-gold"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <Calendar size={15} />
            <span>Agendar Visita / Detalhes</span>
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
