import React, { useState, useMemo } from 'react';
import { Property, PropertyFilterState } from '../../types';
import { FilterBar } from './FilterBar';
import { PropertyCard } from './PropertyCard';
import { Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface PropertyCatalogProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onBookProperty: (property: Property) => void;
}

const DEFAULT_FILTERS: PropertyFilterState = {
  searchQuery: '',
  city: 'all',
  propertyType: 'all',
  minPrice: 0,
  maxPrice: 10000000,
  minBedrooms: 0,
  sortBy: 'newest'
};

export const PropertyCatalog: React.FC<PropertyCatalogProps> = ({
  properties,
  onSelectProperty,
  onBookProperty
}) => {
  const [filters, setFilters] = useState<PropertyFilterState>(DEFAULT_FILTERS);

  // Available unique cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => {
      if (p.location.city) set.add(p.location.city);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (p.status === 'archived') return false; // public catalog hides archived

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCity = p.location.city.toLowerCase().includes(q);
        const matchesAddress = p.location.address.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesAmenities = p.amenities.some(a => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCity && !matchesAddress && !matchesDesc && !matchesAmenities) {
          return false;
        }
      }

      // City
      if (filters.city !== 'all' && p.location.city !== filters.city) {
        return false;
      }

      // Property Type
      if (filters.propertyType !== 'all' && p.propertyType !== filters.propertyType) {
        return false;
      }

      // Max Price
      if (p.price > filters.maxPrice) {
        return false;
      }

      // Min Bedrooms
      if (p.specs.bedrooms < filters.minBedrooms) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'area_desc') return b.specs.areaSqFt - a.specs.areaSqFt;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [properties, filters]);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(197, 168, 128, 0.12)',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          color: 'var(--gold-light)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          <Sparkles size={14} color="var(--gold-primary)" />
          Curated Architectural Catalog
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 700,
          color: '#FFF',
          marginBottom: '16px',
          letterSpacing: '0.03em'
        }}>
          Exceptional Residences. <span className="gold-gradient-text">Private Viewings.</span>
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          maxWidth: '650px',
          margin: '0 auto',
          fontSize: '1rem',
          lineHeight: 1.6
        }}>
          Explore iconic luxury villas, penthouses, and townhouses. Reserve an in-person private viewing online with immediate advisor confirmation.
        </p>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        availableCities={availableCities}
      />

      {/* Results Counter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '0 4px'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: '#FFF' }}>{filteredProperties.length}</strong> available luxury {filteredProperties.length === 1 ? 'property' : 'properties'}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--gold-light)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="var(--gold-primary)" /> Instant Booking
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="var(--gold-primary)" /> Verified Architectural Specs
          </span>
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '28px'
        }}>
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              onBookViewing={onBookProperty}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '999px',
            background: 'rgba(197, 168, 128, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <Building2 size={32} color="var(--gold-primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '8px' }}>
            No Matching Properties
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Try expanding your price range, clearing specific filters, or searching for a different city.
          </p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="btn btn-gold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
