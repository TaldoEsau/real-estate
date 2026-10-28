import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Property, PropertyFilterState } from '../../types';
import { FilterBar } from './FilterBar';
import { PropertyCard } from './PropertyCard';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Award,
  KeyRound,
  Palmtree,
  ArrowRight,
  PhoneCall,
  Plus,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { OrganicButton } from '@/components/ui/organic-button';
import { VideoPresentationHero, PublicTab } from './VideoPresentationHero';
import { EmpresaView, ContatoView } from './CompanyInfoSections';

interface PropertyCatalogProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onBookProperty: (property: Property) => void;
  activeTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
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
  onBookProperty,
  activeTab,
  onSelectTab,
}) => {
  const { tenant } = useTenant();

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

  // Sincroniza filtro transacional automaticamente quando o usuário troca de aba na barra superior
  useEffect(() => {
    if (activeTab === 'venda') {
      setFilters(prev => ({ ...prev, transactionType: 'for_sale' }));
    } else if (activeTab === 'locacao') {
      setFilters(prev => ({ ...prev, transactionType: 'for_rent' }));
    } else if (activeTab === 'temporada') {
      setFilters(prev => ({ ...prev, transactionType: 'all' }));
    } else if (activeTab === 'home') {
      setFilters(prev => ({ ...prev, transactionType: 'all' }));
    }
  }, [activeTab]);

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

      // Aba Temporada: prioriza casas em condomínio, coberturas ou imóveis com lazer completo
      if (activeTab === 'temporada') {
        const isLeisureType =
          p.propertyType === 'villa' ||
          p.propertyType === 'house' ||
          p.propertyType === 'penthouse' ||
          p.amenities.some(a =>
            a.toLowerCase().includes('piscina') ||
            a.toLowerCase().includes('gourmet') ||
            a.toLowerCase().includes('vista') ||
            a.toLowerCase().includes('spa')
          );
        if (!isLeisureType) return false;
      }

      // Busca por Código do Imóvel
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
        if (filters.maxPrice && p.price > filters.maxPrice) return false;
      } else if (filters.transactionType === 'for_rent') {
        if (p.listingType !== 'for_rent' && p.listingType !== 'both') return false;
        const rentPrice = p.rentalPrice || 0;
        if (filters.maxPrice && rentPrice > filters.maxPrice) return false;
      } else {
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
  }, [properties, filters, activeTab]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    sessionStorage.removeItem(STORAGE_FILTER_KEY);
  };

  // Se o usuário selecionou a aba EMPRESA, exibe a página institucional animada
  if (activeTab === 'empresa') {
    return (
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
        <EmpresaView onNavigateTab={onSelectTab} totalProperties={properties.length} />
      </div>
    );
  }

  // Se o usuário selecionou a aba CONTATO, exibe a central de atendimento e localização
  if (activeTab === 'contato') {
    return (
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
        <ContatoView />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* ABA INÍCIO: Apresentação em Vídeo de Fundo com Informações Animadas na Frente */}
      {activeTab === 'home' && (
        <VideoPresentationHero
          totalProperties={properties.length}
          totalCities={availableCities.length || 4}
          onNavigateTab={onSelectTab}
          onScrollToCatalog={() => {
            document.getElementById('pesquisa-imoveis')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* ABAS VENDA / LOCAÇÃO / TEMPORADA: Cabeçalho Dedicado Editorial */}
      {activeTab !== 'home' && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`relative mb-9 overflow-hidden rounded-[26px] border p-8 sm:p-11 ${
            activeTab === 'venda'
              ? 'border-[#E2DFD5] bg-[#F3F1EB]'
              : activeTab === 'locacao'
              ? 'border-[#D5DEC6] bg-[#E8ECE0]'
              : 'border-[#CEDCE4] bg-[#E6EEF2]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#22221E]/15 bg-white/75 px-3.5 py-1 text-xs font-bold tracking-wider text-[#1F1F1C] uppercase">
                {activeTab === 'venda' && <Building2 size={14} className="text-[#4A593D]" />}
                {activeTab === 'locacao' && <KeyRound size={14} className="text-[#4A593D]" />}
                {activeTab === 'temporada' && <Palmtree size={14} className="text-[#4A593D]" />}
                <span>
                  {activeTab === 'venda' && 'Portfólio de Aquisição & Patrimônio'}
                  {activeTab === 'locacao' && 'Locação Residencial & Corporativa'}
                  {activeTab === 'temporada' && 'Temporada & Mansões de Lazer'}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-5xl">
                {activeTab === 'venda' && 'Imóveis selecionados à venda'}
                {activeTab === 'locacao' && 'Imóveis disponíveis para locação'}
                {activeTab === 'temporada' && 'Imóveis de temporada e alto padrão'}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-[#4C4B46] sm:text-base">
                {activeTab === 'venda' &&
                  'Casas em condomínio fechado, coberturas duplex e propriedades com documentação 100% auditada e assessoria jurídica completa.'}
                {activeTab === 'locacao' &&
                  'Alugue com rapidez, vistoria digital detalhada e suporte dedicado durante toda a vigência contratual.'}
                {activeTab === 'temporada' &&
                  'Residências exclusivas com piscina aquecida, espaço gourmet e segurança 24h para estadias inesquecíveis.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <OrganicButton
                href="#catalogo-imoveis"
                label="Ver Opções Abaixo"
                variantColor="primary"
                size="md"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById('catalogo-imoveis')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <OrganicButton
                href="#contato"
                label="Falar com Especialista"
                variantColor="secondary"
                size="md"
                onClick={e => {
                  e.preventDefault();
                  onSelectTab('contato');
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

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
      <div
        id="catalogo-imoveis"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          padding: '0 4px',
          flexWrap: 'wrap',
          gap: '12px',
          scrollMarginTop: '96px'
        }}
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Mostrando <strong style={{ color: '#1F1F1C' }}>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}
          {filters.transactionType !== 'all' && (
            <span style={{ color: '#4A593D', fontWeight: 600, marginLeft: '6px' }}>
              ({filters.transactionType === 'for_sale' ? 'Venda' : 'Locação'})
            </span>
          )}
          {activeTab === 'temporada' && (
            <span style={{ color: '#4A593D', fontWeight: 600, marginLeft: '6px' }}>
              (Temporada & Lazer)
            </span>
          )}
          {filters.code && (
            <span style={{ color: '#4A593D', fontWeight: 600, marginLeft: '6px' }}>
              • Ref: "{filters.code}"
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.8rem',
          color: '#4A593D',
          fontWeight: 500
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="#4A593D" /> Clique em "Prévia" no card para visão rápida
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="#4A593D" /> Agendamento Online
          </span>
        </div>
      </div>

      {/* Grid de Imóveis (Usando Cult UI CutoutCard + IntroDisclosure) */}
      {filteredProperties.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gridAutoRows: '1fr',
          alignItems: 'stretch',
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
            background: '#E8ECE0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <Building2 size={32} color="#4A593D" />
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#1F1F1C', marginBottom: '8px' }}>
            Nenhum imóvel encontrado
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Não encontramos imóveis com os critérios selecionados. Tente limpar o código, alterar a cidade/bairro ou expandir a faixa de valor.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <OrganicButton
              href="#pesquisa-imoveis"
              label="Limpar Todos os Filtros"
              variantColor="primary"
              size="md"
              onClick={(e) => {
                e.preventDefault();
                handleResetFilters();
              }}
            />
          </div>
        </div>
      )}

      {/* Seção Editorial Dupla + Banner Sage (Inspirada na metade inferior da imagem de referência) */}
      {activeTab === 'home' && (
        <div className="mt-20 space-y-12">
          {/* Dois Grandes Cartões Editoriais Lado a Lado: Verde Sálvia & Azul Acinzentado */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Cartão Esquerdo: Verde Sálvia (Sage) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-between rounded-[28px] bg-[#98A67C] p-8 text-[#1F1F1C] sm:p-11"
            >
              <div>
                <h3 className="font-serif text-3xl leading-[1.12] font-medium tracking-[-0.02em] text-[#1F1F1C] sm:text-4xl">
                  O caminho mais seguro para comprar ou alugar seu imóvel
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#252B1E] sm:text-base">
                  Da primeira visita presencial até a entrega das chaves, nossa equipe jurídica e comercial cuida de todas as etapas com total transparência.
                </p>
              </div>

              <div className="mt-8 rounded-2xl bg-[#6E7C55] p-5 text-[#FBFBF9]">
                <div className="mb-3 flex items-center justify-between border-b border-white/15 pb-2.5 text-xs font-semibold tracking-wider uppercase opacity-80">
                  <span>Etapa da Consultoria</span>
                  <span>Garantia {tenant.name.split(' ')[0]}</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span>Avaliação Mercadológica</span>
                    <span className="font-semibold text-[#E8ECE0]">Laudo Técnico Incluso</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Análise de Certidões e Matrícula</span>
                    <span className="font-semibold text-[#E8ECE0]">100% Auditada</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Agendamento de Visitas</span>
                    <span className="font-semibold text-[#E8ECE0]">Online & Imediato</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cartão Direito: Azul Acinzentado Suave (Dusty Sky) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col justify-between rounded-[28px] bg-[#A7B8C4] p-8 text-[#1F1F1C] sm:p-11"
            >
              <div>
                <h3 className="font-serif text-3xl leading-[1.12] font-medium tracking-[-0.02em] text-[#1F1F1C] sm:text-4xl">
                  Atendimento consultivo para investidores e famílias
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#222D35] sm:text-base">
                  Acesse oportunidades em condomínios fechados, coberturas e imóveis comerciais selecionados pelos nossos corretores credenciados.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('empresa');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#22221E] text-[#FBFBF9] transition-transform hover:scale-105"
                  title="Conhecer a Imobiliária"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    onSelectTab('venda');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer rounded-2xl bg-white/80 p-4 backdrop-blur-xs transition-transform hover:-translate-y-0.5"
                >
                  <Building2 size={20} className="mb-2 text-[#1F1F1C]" />
                  <div className="font-serif text-lg font-medium text-[#1F1F1C]">Compra & Venda</div>
                  <p className="mt-0.5 text-xs text-[#4C565E]">Patrimônio sólido e valorização</p>
                </div>

                <div
                  onClick={() => {
                    onSelectTab('locacao');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer rounded-2xl bg-white/80 p-4 backdrop-blur-xs transition-transform hover:-translate-y-0.5"
                >
                  <KeyRound size={20} className="mb-2 text-[#1F1F1C]" />
                  <div className="font-serif text-lg font-medium text-[#1F1F1C]">Locação Prime</div>
                  <p className="mt-0.5 text-xs text-[#4C565E]">Contratos ágeis e digitais</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Banner Editorial Final em Verde Sálvia (Inspirado em "Ready to break up with your bank?" da imagem) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[28px] bg-[#E8ECE0] px-6 py-14 text-center sm:px-12 sm:py-16"
          >
            <div className="mx-auto max-w-xl">
              <h2 className="font-serif text-3xl leading-[1.1] font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-5xl">
                Pronto para encontrar o seu próximo imóvel?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#444F39] sm:text-base">
                Fale diretamente com nossos especialistas ou agende uma visita presencial em qualquer propriedade do nosso catálogo.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <OrganicButton
                  href="#contato"
                  label="Falar com a Imobiliária"
                  variantColor="primary"
                  size="md"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab('contato');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                <OrganicButton
                  href="#empresa"
                  label="Sobre a Empresa"
                  variantColor="secondary"
                  size="md"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab('empresa');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </div>
  );
};
