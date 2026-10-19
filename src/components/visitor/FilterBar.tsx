import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, MapPin, DollarSign, BedDouble, Building } from 'lucide-react';
import { PropertyFilterState } from '../../types';

interface FilterBarProps {
  filters: PropertyFilterState;
  onChange: (newFilters: PropertyFilterState) => void;
  onReset: () => void;
  availableCities: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  availableCities
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, city: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, propertyType: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  const handleBedroomsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, minBedrooms: Number(e.target.value) });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as PropertyFilterState['sortBy'] });
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      marginBottom: '36px',
      position: 'relative'
    }}>
      {/* Top Search Input */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: '1 1 300px'
        }}>
          <Search size={18} color="var(--gold-primary)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search by neighborhood, property title, architectural features..."
            value={filters.searchQuery}
            onChange={handleTextChange}
          />
        </div>

        {/* Sort Dropdown */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Featured & Newest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="area_desc">Largest Area (Sq Ft)</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="btn btn-outline"
          title="Reset all filters"
          style={{ padding: '10px 14px' }}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {/* Filter Select Controls Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {/* City Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--gold-primary)" />
            Location / City
          </label>
          <select
            className="form-select"
            value={filters.city}
            onChange={handleCityChange}
          >
            <option value="all">All Locations</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building size={12} color="var(--gold-primary)" />
            Property Type
          </label>
          <select
            className="form-select"
            value={filters.propertyType}
            onChange={handleTypeChange}
          >
            <option value="all">All Property Types</option>
            <option value="villa">Villas & Estates</option>
            <option value="penthouse">Penthouses</option>
            <option value="house">Single Family Homes</option>
            <option value="apartment">Luxury Condos</option>
            <option value="townhouse">Historic Townhouses</option>
          </select>
        </div>

        {/* Max Price */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} color="var(--gold-primary)" />
            Max Budget
          </label>
          <select
            className="form-select"
            value={filters.maxPrice}
            onChange={handleMaxPriceChange}
          >
            <option value={10000000}>Any Price</option>
            <option value={2000000}>Up to $2,000,000</option>
            <option value={3000000}>Up to $3,000,000</option>
            <option value={4000000}>Up to $4,000,000</option>
            <option value={5000000}>Up to $5,000,000</option>
          </select>
        </div>

        {/* Bedrooms */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={12} color="var(--gold-primary)" />
            Minimum Bedrooms
          </label>
          <select
            className="form-select"
            value={filters.minBedrooms}
            onChange={handleBedroomsChange}
          >
            <option value={0}>Any Bedrooms</option>
            <option value={2}>2+ Bedrooms</option>
            <option value={3}>3+ Bedrooms</option>
            <option value={4}>4+ Bedrooms</option>
            <option value={5}>5+ Bedrooms</option>
          </select>
        </div>
      </div>
    </div>
  );
};
