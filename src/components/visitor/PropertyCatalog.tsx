import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyFilterState } from '../../types';
import { FilterBar } from './FilterBar';
import { PropertyCard } from './PropertyCard';
import { Sparkles, Building2, CheckCircle2, Sliders } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

interface PropertyCatalogProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onBookProperty: (property: Property) => void;
}

const STORAGE_FILTER_KEY = 'moliaria_active_filters_v1';

const DEFAULT_FILTERS: PropertyFilterState = {
  searchQuery: '',
  code: '',
  state: 'all',
  city: 'all',
  neighborhood: 'all',
  propertyType: 'all',
  transactionType: 'all',
  minPrice: 0,
  maxPrice: 15000000,
  minBedrooms: 0,
  minSuites: 0,
  minGarageSpaces: 0,
  minBathrooms: 0,
  minAreaSqM: 0,
  sortBy: 'newest'
};

export const PropertyCatalog: React.FC<PropertyCatalogProps> = ({
  properties,
  onSelectProperty,
  onBookProperty
}) => {
  const { tenant, settings } = useTenant();

  // Carrega filtros salvos da sessão se existirem
  const [filters, setFilters] = useState<PropertyFilterState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_FILTER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao restaurar filtros salvos:', e);
    }
    return DEFAULT_FILTERS;
  });

  // Salva os filtros no sessionStorage a cada alteração
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_FILTER_KEY, JSON.stringify(filters));
    } catch (e) {
      console.warn('Erro ao salvar filtros na sessão:', e);
    }
  }, [filters]);

  // 1. Estados únicos disponíveis
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => {
      if (p.location?.state) set.add(p.location.state);
    });
    return Array.from(set).sort();
  }, [properties]);

  // 2. Cidades disponíveis (em cascata se um estado estiver selecionado)
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => {
      if (!p.location?.city) return;
      if (filters.state && filters.state !== 'all') {
        if (p.location.state === filters.state) {
          set.add(p.location.city);
        }
      } else {
        set.add(p.location.city);
      }
    });
    return Array.from(set).sort();
  }, [properties, filters.state]);

  // 3. Bairros disponíveis (em cascata se uma cidade estiver selecionada)
  const availableNeighborhoods = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => {
      if (!p.location?.neighborhood) return;
      if (filters.city && filters.city !== 'all') {
        if (p.location.city === filters.city) {
          set.add(p.location.neighborhood);
        }
      } else if (filters.state && filters.state !== 'all') {
        if (p.location.state === filters.state) {
          set.add(p.location.neighborhood);
        }
      } else {
        set.add(p.location.neighborhood);
      }
    });
    return Array.from(set).sort();
  }, [properties, filters.state, filters.city]);

  // 4. Mecanismo de Filtragem Completo dos Imóveis
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (p.status === 'archived' || p.status === 'draft') return false;

      // Busca por Código do Imóvel (Feature Legada)
      if (filters.code && filters.code.trim()) {
        const targetCode = filters.code.trim().toUpperCase();
        const pCode = (p.code || '').toUpperCase();
        if (!pCode.includes(targetCode)) {
          return false;
        }
      }

      // Busca Textual Geral (Palavra-chave)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCity = (p.location?.city || '').toLowerCase().includes(q);
        const matchesNeighborhood = (p.location?.neighborhood || '').toLowerCase().includes(q);
        const matchesAddress = (p.location?.address || '').toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesAmenities = p.amenities.some(a => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCity && !matchesNeighborhood && !matchesAddress && !matchesDesc && !matchesAmenities) {
          return false;
        }
      }

      // Chaveamento Transacional (Comprar vs Alugar)
      if (filters.transactionType === 'for_sale') {
        if (p.listingType !== 'for_sale' && p.listingType !== 'both') return false;
        // Filtro de Preço de Venda
        if (filters.maxPrice && p.price > filters.maxPrice) return false;
      } else if (filters.transactionType === 'for_rent') {
        if (p.listingType !== 'for_rent' && p.listingType !== 'both') return false;
        // Filtro de Valor de Locação
        const rentPrice = p.rentalPrice || 0;
        if (filters.maxPrice && rentPrice > filters.maxPrice) return false;
      } else {
        // 'all'
        if (filters.maxPrice && p.price > filters.maxPrice) return false;
      }

      // Filtro Geográfico: Estado
      if (filters.state && filters.state !== 'all' && p.location.state !== filters.state) {
        return false;
      }

      // Filtro Geográfico: Cidade
      if (filters.city && filters.city !== 'all' && p.location.city !== filters.city) {
        return false;
      }

      // Filtro Geográfico: Bairro
      if (filters.neighborhood && filters.neighborhood !== 'all' && p.location.neighborhood !== filters.neighborhood) {
        return false;
      }

      // Tipo de Imóvel / Categoria
      if (filters.propertyType && filters.propertyType !== 'all' && p.propertyType !== filters.propertyType) {
        return false;
      }

      // Quartos Mínimos
      if (filters.minBedrooms > 0 && p.specs.bedrooms < filters.minBedrooms) {
        return false;
      }

      // Suítes Mínimas
      if (filters.minSuites && filters.minSuites > 0) {
        const suites = p.specs.suites || 0;
        if (suites < filters.minSuites) return false;
      }

      // Vagas de Garagem Mínimas
      if (filters.minGarageSpaces && filters.minGarageSpaces > 0) {
        const vagas = p.specs.garageSpaces || 0;
        if (vagas < filters.minGarageSpaces) return false;
      }

      // Banheiros Mínimos
      if (filters.minBathrooms && filters.minBathrooms > 0) {
        const banheiros = p.specs.bathrooms || 0;
        if (banheiros < filters.minBathrooms) return false;
      }

      // Área Mínima (m²)
      if (filters.minAreaSqM && filters.minAreaSqM > 0) {
        const area = p.specs.areaSqM || Math.round(p.specs.areaSqFt / 10.764);
        if (area < filters.minAreaSqM) return false;
      }

      return true;
    }).sort((a, b) => {
      // Ordenação
      if (filters.sortBy === 'price_asc') {
        const priceA = filters.transactionType === 'for_rent' ? (a.rentalPrice || a.price) : a.price;
        const priceB = filters.transactionType === 'for_rent' ? (b.rentalPrice || b.price) : b.price;
        return priceA - priceB;
      }
      if (filters.sortBy === 'price_desc') {
        const priceA = filters.transactionType === 'for_rent' ? (a.rentalPrice || a.price) : a.price;
        const priceB = filters.transactionType === 'for_rent' ? (b.rentalPrice || b.price) : b.price;
        return priceB - priceA;
      }
      if (filters.sortBy === 'area_desc') {
        const areaA = a.specs.areaSqM || a.specs.areaSqFt;
        const areaB = b.specs.areaSqM || b.specs.areaSqFt;
        return areaB - areaA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [properties, filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    sessionStorage.removeItem(STORAGE_FILTER_KEY);
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Hero Header White-label */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
          {tenant.name || 'Catálogo Imobiliário Exclusivo'}
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 700,
          color: '#FFF',
          marginBottom: '16px',
          letterSpacing: '0.03em'
        }}>
          Encontre seu Próximo Imóvel. <span className="gold-gradient-text">Agendamento Imediato.</span>
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto',
          fontSize: '1rem',
          lineHeight: 1.6
        }}>
          {settings.aboutText || 'Navegue por coberturas, casas em condomínio e apartamentos de alto padrão com assessoria especializada e visitas presenciais simplificadas.'}
        </p>
      </div>

      {/* Componente Motor de Busca e Filtros */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        availableStates={availableStates}
        availableCities={availableCities}
        availableNeighborhoods={availableNeighborhoods}
      />

      {/* Barra de Contagem e Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '0 4px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Mostrando <strong style={{ color: '#FFF' }}>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}
          {filters.transactionType !== 'all' && (
            <span style={{ color: 'var(--gold-light)', marginLeft: '6px' }}>
              ({filters.transactionType === 'for_sale' ? 'Venda' : 'Locação'})
            </span>
          )}
          {filters.code && (
            <span style={{ color: 'var(--gold-light)', marginLeft: '6px' }}>
              • Ref: "{filters.code}"
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.8rem',
          color: 'var(--gold-light)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="var(--gold-primary)" /> Agendamento Online
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="var(--gold-primary)" /> Dados e Metragens Validados
          </span>
        </div>
      </div>

      {/* Grid de Imóveis */}
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
          maxWidth: '520px',
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
            Nenhum imóvel encontrado
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Não encontramos imóveis com os critérios selecionados. Tente limpar o código, alterar a cidade/bairro ou expandir a faixa de valor.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-gold"
          >
            Limpar Todos os Filtros
          </button>
        </div>
      )}
    </div>
  );
};
