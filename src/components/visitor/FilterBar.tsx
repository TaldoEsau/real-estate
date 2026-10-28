import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  MapPin, 
  DollarSign, 
  BedDouble, 
  Building, 
  Hash, 
  Car, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Bath,
  Maximize2
} from 'lucide-react';
import { PropertyFilterState } from '../../types';

interface FilterBarProps {
  filters: PropertyFilterState;
  onChange: (newFilters: PropertyFilterState) => void;
  onReset: () => void;
  availableStates: string[];
  availableCities: string[];
  availableNeighborhoods: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  availableStates,
  availableCities,
  availableNeighborhoods
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTransactionChange = (type: 'all' | 'for_sale' | 'for_rent') => {
    // Ao alternar entre venda e aluguel, ajusta o maxPrice para uma escala condizente
    const defaultMax = type === 'for_rent' ? 50000 : 15000000;
    onChange({
      ...filters,
      transactionType: type,
      maxPrice: defaultMax
    });
  };

  const activeAdvancedCount = [
    (filters.minSuites || 0) > 0,
    (filters.minGarageSpaces || 0) > 0,
    (filters.minBathrooms || 0) > 0,
    (filters.minAreaSqM || 0) > 0,
    Boolean(filters.state && filters.state !== 'all'),
    Boolean(filters.neighborhood && filters.neighborhood !== 'all')
  ].filter(Boolean).length;

  return (
    <div id="pesquisa-imoveis" className="glass-panel" style={{
      padding: '24px',
      marginBottom: '36px',
      position: 'relative',
      scrollMarginTop: '96px'
    }}>
      {/* 1. Abas de Chaveamento Transacional (Comprar / Alugar / Todos) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #EAE7DF',
        paddingBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleTransactionChange('all')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: (!filters.transactionType || filters.transactionType === 'all')
              ? '#22221E'
              : '#E2DFD5',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: (!filters.transactionType || filters.transactionType === 'all')
              ? '#22221E'
              : '#F3F1EB',
            color: (!filters.transactionType || filters.transactionType === 'all')
              ? '#FBFBF9'
              : '#5F5E58'
          }}
        >
          Todos os Imóveis
        </button>

        <button
          type="button"
          onClick={() => handleTransactionChange('for_sale')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: filters.transactionType === 'for_sale'
              ? '#22221E'
              : '#E2DFD5',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: filters.transactionType === 'for_sale'
              ? '#22221E'
              : '#F3F1EB',
            color: filters.transactionType === 'for_sale'
              ? '#FBFBF9'
              : '#5F5E58'
          }}
        >
          Comprar (Venda)
        </button>

        <button
          type="button"
          onClick={() => handleTransactionChange('for_rent')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: filters.transactionType === 'for_rent'
              ? '#22221E'
              : '#E2DFD5',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: filters.transactionType === 'for_rent'
              ? '#22221E'
              : '#F3F1EB',
            color: filters.transactionType === 'for_rent'
              ? '#FBFBF9'
              : '#5F5E58'
          }}
        >
          Alugar (Locação)
        </button>
      </div>

      {/* 2. Barra de Busca Textual + Código de Referência + Ordenação */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Busca por Palavra-chave */}
        <div style={{ position: 'relative', flex: '2 1 260px' }}>
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
            placeholder="Buscar por bairro, título, condomínio ou características..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          />
        </div>

        {/* Busca direta por Código de Referência (Feature do Legado) */}
        <div style={{ position: 'relative', flex: '1 1 150px' }}>
          <Hash size={16} color="var(--gold-primary)" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Código (ex: AP1042)"
            value={filters.code || ''}
            onChange={(e) => onChange({ ...filters, code: e.target.value.toUpperCase() })}
          />
        </div>

        {/* Ordenação */}
        <div style={{ minWidth: '170px' }}>
          <select
            className="form-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as PropertyFilterState['sortBy'] })}
          >
            <option value="newest">Destaques e Mais Recentes</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
            <option value="area_desc">Maior Metragem (m²)</option>
          </select>
        </div>

        {/* Botão de Toggle Filtros Avançados */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn ${showAdvanced ? 'btn-gold' : 'btn-outline'}`}
          style={{ padding: '10px 14px', position: 'relative' }}
        >
          <SlidersHorizontal size={16} />
          <span>Filtros</span>
          {activeAdvancedCount > 0 && (
            <span style={{
              background: '#98A67C',
              color: '#1F1F1C',
              borderRadius: '999px',
              padding: '2px 7px',
              fontSize: '0.7rem',
              fontWeight: 700,
              marginLeft: '4px'
            }}>
              {activeAdvancedCount}
            </span>
          )}
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline"
          title="Limpar todos os filtros"
          style={{ padding: '10px 14px' }}
        >
          <RotateCcw size={16} />
          <span>Limpar</span>
        </button>
      </div>

      {/* 3. Grid Principal de Filtros Rápidos (Estado, Cidade, Tipo, Preço, Quartos) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {/* Estado (UF) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--gold-primary)" />
            Estado (UF)
          </label>
          <select
            className="form-select"
            value={filters.state || 'all'}
            onChange={(e) => onChange({ ...filters, state: e.target.value, city: 'all', neighborhood: 'all' })}
          >
            <option value="all">Todos os Estados</option>
            {availableStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Cidade (Cascata do Estado) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--gold-primary)" />
            Cidade
          </label>
          <select
            className="form-select"
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value, neighborhood: 'all' })}
          >
            <option value="all">Todas as Cidades</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Bairro (Cascata da Cidade) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--gold-primary)" />
            Bairro
          </label>
          <select
            className="form-select"
            value={filters.neighborhood || 'all'}
            onChange={(e) => onChange({ ...filters, neighborhood: e.target.value })}
          >
            <option value="all">Todos os Bairros</option>
            {availableNeighborhoods.map(bairro => (
              <option key={bairro} value={bairro}>{bairro}</option>
            ))}
          </select>
        </div>

        {/* Categoria / Tipo */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building size={12} color="var(--gold-primary)" />
            Tipo de Imóvel
          </label>
          <select
            className="form-select"
            value={filters.propertyType}
            onChange={(e) => onChange({ ...filters, propertyType: e.target.value })}
          >
            <option value="all">Todos os Tipos</option>
            <option value="apartment">Apartamentos</option>
            <option value="house">Casas</option>
            <option value="villa">Casas em Condomínio / Vilas</option>
            <option value="penthouse">Coberturas</option>
            <option value="townhouse">Townhouses / Sobrados</option>
            <option value="commercial">Comercial</option>
          </select>
        </div>

        {/* Faixa de Preço Máximo Inteligente (Venda vs Aluguel) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} color="var(--gold-primary)" />
            {filters.transactionType === 'for_rent' ? 'Valor Aluguel (Até)' : 'Valor Venda (Até)'}
          </label>
          <select
            className="form-select"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          >
            {filters.transactionType === 'for_rent' ? (
              <>
                <option value={50000}>Qualquer Valor</option>
                <option value={3000}>Até R$ 3.000/mês</option>
                <option value={5000}>Até R$ 5.000/mês</option>
                <option value={10000}>Até R$ 10.000/mês</option>
                <option value={20000}>Até R$ 20.000/mês</option>
                <option value={35000}>Até R$ 35.000/mês</option>
              </>
            ) : (
              <>
                <option value={15000000}>Qualquer Valor</option>
                <option value={500000}>Até R$ 500.000</option>
                <option value={1000000}>Até R$ 1.000.000</option>
                <option value={2000000}>Até R$ 2.000.000</option>
                <option value={3500000}>Até R$ 3.500.000</option>
                <option value={5000000}>Até R$ 5.000.000</option>
                <option value={10000000}>Até R$ 10.000.000</option>
              </>
            )}
          </select>
        </div>

        {/* Dormitórios Mínimos */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={12} color="var(--gold-primary)" />
            Quartos Mínimos
          </label>
          <select
            className="form-select"
            value={filters.minBedrooms}
            onChange={(e) => onChange({ ...filters, minBedrooms: Number(e.target.value) })}
          >
            <option value={0}>Qualquer</option>
            <option value={1}>1+ Quarto</option>
            <option value={2}>2+ Quartos</option>
            <option value={3}>3+ Quartos</option>
            <option value={4}>4+ Quartos</option>
          </select>
        </div>
      </div>

      {/* 4. Painel Desdobrável de Filtros Avançados (Suítes, Vagas, Banheiros, Área) */}
      {showAdvanced && (
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px dashed rgba(197, 168, 128, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {/* Suítes */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BedDouble size={12} color="var(--gold-primary)" />
              Mínimo de Suítes
            </label>
            <select
              className="form-select"
              value={filters.minSuites || 0}
              onChange={(e) => onChange({ ...filters, minSuites: Number(e.target.value) })}
            >
              <option value={0}>Qualquer</option>
              <option value={1}>1+ Suíte</option>
              <option value={2}>2+ Suítes</option>
              <option value={3}>3+ Suítes</option>
              <option value={4}>4+ Suítes</option>
            </select>
          </div>

          {/* Vagas de Garagem */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Car size={12} color="var(--gold-primary)" />
              Vagas de Garagem
            </label>
            <select
              className="form-select"
              value={filters.minGarageSpaces || 0}
              onChange={(e) => onChange({ ...filters, minGarageSpaces: Number(e.target.value) })}
            >
              <option value={0}>Qualquer</option>
              <option value={1}>1+ Vaga</option>
              <option value={2}>2+ Vagas</option>
              <option value={3}>3+ Vagas</option>
              <option value={4}>4+ Vagas</option>
            </select>
          </div>

          {/* Banheiros */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bath size={12} color="var(--gold-primary)" />
              Banheiros
            </label>
            <select
              className="form-select"
              value={filters.minBathrooms || 0}
              onChange={(e) => onChange({ ...filters, minBathrooms: Number(e.target.value) })}
            >
              <option value={0}>Qualquer</option>
              <option value={1}>1+ Banheiro</option>
              <option value={2}>2+ Banheiros</option>
              <option value={3}>3+ Banheiros</option>
              <option value={4}>4+ Banheiros</option>
            </select>
          </div>

          {/* Metragem Mínima (m²) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize2 size={12} color="var(--gold-primary)" />
              Área Mínima (m²)
            </label>
            <select
              className="form-select"
              value={filters.minAreaSqM || 0}
              onChange={(e) => onChange({ ...filters, minAreaSqM: Number(e.target.value) })}
            >
              <option value={0}>Qualquer metragem</option>
              <option value={50}>50+ m²</option>
              <option value={100}>100+ m²</option>
              <option value={200}>200+ m²</option>
              <option value={300}>300+ m²</option>
              <option value={500}>500+ m²</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
