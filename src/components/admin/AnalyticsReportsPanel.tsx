import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Flame,
  Search,
  Eye,
  MousePointerClick,
  Download,
  Printer,
  TrendingUp,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  Building2,
  Star,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { Property, BookingRequest, Lead } from '../../types';
import {
  AnalyticsService,
  subscribeToAnalytics,
  SiteAnalyticsStore,
} from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';

interface AnalyticsReportsPanelProps {
  properties: Property[];
  bookings?: BookingRequest[];
  leads?: Lead[];
  onPreviewProperty: (property: Property) => void;
}

type ReportSection = 'overview' | 'heatmap' | 'searches' | 'properties';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: 'Casa em Condomínio',
  penthouse: 'Cobertura',
  house: 'Casa Residencial',
  apartment: 'Apartamento',
  townhouse: 'Casa de Vila / Sobrado',
  commercial: 'Comercial',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Aba Início',
  venda: 'Aba Venda',
  locacao: 'Aba Locação',
  temporada: 'Aba Temporada',
  empresa: 'Aba Empresa',
  contato: 'Aba Contato',
};

const ZONE_LABELS: Record<string, string> = {
  property_cards: 'Cards de Imóveis (Ver Imóvel & Prévia)',
  search_filters: 'Motor de Pesquisa & Filtros',
  property_detail: 'Página de Detalhes & Agendamento',
  hero_video: 'Apresentação em Vídeo & Pilares',
  navbar: 'Menu de Abas Superior & Telefone',
  institutional_footer: 'Seção Institucional & Rodapé',
};

export const AnalyticsReportsPanel: React.FC<AnalyticsReportsPanelProps> = ({
  properties,
  bookings = [],
  leads = [],
  onPreviewProperty,
}) => {
  const [section, setSection] = useState<ReportSection>('overview');
  const [heatmapTabFilter, setHeatmapTabFilter] = useState<string>('all');
  const [heatmapMode, setHeatmapMode] = useState<'thermal' | 'points'>('thermal');
  const [store, setStore] = useState<SiteAnalyticsStore>(() =>
    AnalyticsService.getStore()
  );

  useEffect(() => {
    setStore(AnalyticsService.getStore());
    const unsub = subscribeToAnalytics(() => {
      setStore(AnalyticsService.getStore());
    });
    return unsub;
  }, [properties, bookings, leads]);

  const totalHeatmapClicks = useMemo(
    () => Object.values(store.zoneClicks).reduce((acc, v) => acc + v, 0),
    [store.zoneClicks]
  );

  const totalSearchesCount = useMemo(
    () => store.recentSearches.length,
    [store.recentSearches]
  );

  const avgSessionSec = useMemo(
    () =>
      store.uniqueSessions > 0
        ? Math.round(store.totalSessionSeconds / store.uniqueSessions)
        : 0,
    [store]
  );

  const deviceBreakdown = useMemo(() => {
    const total =
      store.deviceCounts.desktop +
      store.deviceCounts.mobile +
      store.deviceCounts.tablet;
    if (total === 0) {
      return { desktop: 0, mobile: 0, tablet: 0 };
    }
    return {
      desktop: Math.round((store.deviceCounts.desktop / total) * 100),
      mobile: Math.round((store.deviceCounts.mobile / total) * 100),
      tablet: Math.round((store.deviceCounts.tablet / total) * 100),
    };
  }, [store]);

  const trafficSources = useMemo(() => {
    const entries = Object.entries(store.trafficSourceCounts);
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([source, visits]) => ({
        source,
        visits,
        percentage: total > 0 ? Math.round((visits / total) * 100) : 0,
      }));
  }, [store]);

  const filteredHeatmapPoints = useMemo(() => {
    if (heatmapTabFilter === 'all') return store.heatmapPoints;
    return store.heatmapPoints.filter(p => p.tab === heatmapTabFilter);
  }, [store.heatmapPoints, heatmapTabFilter]);

  const sortedKeywords = useMemo(() => {
    const combined: Record<string, number> = { ...store.searchCounts.keywords };
    return Object.entries(combined).sort((a, b) => b[1] - a[1]);
  }, [store.searchCounts.keywords]);

  const sortedCities = useMemo(() => {
    const combined: Record<string, number> = { ...store.searchCounts.cities };
    properties.forEach(p => {
      if (p.location?.city) {
        combined[p.location.city] = (combined[p.location.city] || 0) + 1;
      }
    });
    return Object.entries(combined).sort((a, b) => b[1] - a[1]);
  }, [store.searchCounts.cities, properties]);

  const sortedPropertyTypes = useMemo(() => {
    const combined: Record<string, number> = { ...store.searchCounts.propertyTypes };
    properties.forEach(p => {
      const label = PROPERTY_TYPE_LABELS[p.propertyType] || p.propertyType;
      combined[label] = (combined[label] || 0) + 1;
    });
    return Object.entries(combined).sort((a, b) => b[1] - a[1]);
  }, [store.searchCounts.propertyTypes, properties]);

  const sortedPropertiesMetrics = useMemo(
    () =>
      AnalyticsService.getRealPropertyMetrics(properties, bookings, leads).sort(
        (a, b) =>
          b.views * 3 + b.leadsAndBookings * 8 + b.favorites * 4 -
          (a.views * 3 + a.leadsAndBookings * 8 + a.favorites * 4)
      ),
    [properties, bookings, leads, store]
  );

  const maxDailyViews = useMemo(
    () => Math.max(...store.dailyHistory.map(d => d.pageViews), 5),
    [store.dailyHistory]
  );

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho Executivo de Relatórios + Botões de Exportação */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#E4E1D7] bg-[#F3F1EB] p-6 sm:p-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8ECE0] px-3 py-1 text-xs font-bold tracking-wider text-[#3E4D32] uppercase">
            <Activity size={13} />
            <span>Telemetria Real • Dados Reais do Sistema</span>
          </div>
          <h2 className="font-serif text-2xl font-medium text-[#1F1F1C] sm:text-3xl">
            Relatórios de Acesso, Sensor de Calor & Buscas
          </h2>
          <p className="mt-1 text-sm text-[#5F5E58]">
            Dados 100% reais capturados das sessões, cliques na interface, pesquisas no catálogo, imóveis, leads e visitas agendadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja zerar os contadores de telemetria e iniciar uma nova medição real?')) {
                AnalyticsService.resetAnalytics();
              }
            }}
            className="btn btn-outline btn-sm"
            title="Zerar contadores de acesso e mapa de calor"
          >
            <RotateCcw size={15} />
            <span>Zerar Contadores</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-outline btn-sm"
          >
            <Printer size={15} />
            <span>Imprimir Relatório</span>
          </button>

          <button
            type="button"
            onClick={() =>
              AnalyticsService.exportAnalyticsReportCsv(properties, bookings, leads)
            }
            className="btn btn-gold btn-sm"
          >
            <Download size={15} />
            <span>Exportar Relatório (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPIs Principais de Acesso e Sensor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-[#E4E1D7] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#5F5E58] uppercase">
            <span>Acessos Reais no Site</span>
            <Eye size={17} className="text-[#4A593D]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-medium text-[#1F1F1C]">
            {store.totalPageViews.toLocaleString('pt-BR')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#2E6F40]">
            <TrendingUp size={13} />
            <span>{store.uniqueSessions.toLocaleString('pt-BR')} sessões únicas registradas</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#E4E1D7] bg-[#E8ECE0]/55 p-5">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#3E4D32] uppercase">
            <span>Interações no Sensor de Calor</span>
            <Flame size={17} className="text-[#B45309]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-medium text-[#1F1F1C]">
            {totalHeatmapClicks.toLocaleString('pt-BR')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#444F39]">
            <MousePointerClick size={13} />
            <span>{store.heatmapPoints.length} coordenadas reais mapeadas</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#E4E1D7] bg-[#E6EEF2]/60 p-5">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#2C3E4A] uppercase">
            <span>Pesquisas & Filtros Reais</span>
            <Search size={17} className="text-[#2C3E4A]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-medium text-[#1F1F1C]">
            {totalSearchesCount.toLocaleString('pt-BR')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#42525C]">
            <Sparkles size={13} />
            <span>{sortedKeywords.length} termos reais buscados</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#E4E1D7] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#5F5E58] uppercase">
            <span>Tempo Médio de Sessão Ativa</span>
            <Clock size={17} className="text-[#4A593D]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-medium text-[#1F1F1C]">
            {formatDuration(avgSessionSec)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#5F5E58]">
            <Smartphone size={13} />
            <span>{deviceBreakdown.mobile}% Celular</span>
            <span>•</span>
            <Monitor size={13} />
            <span>{deviceBreakdown.desktop}% Computador</span>
          </div>
        </div>
      </div>

      {/* Sub-abas dos Relatórios */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E1D7] pb-4">
        <button
          type="button"
          onClick={() => setSection('overview')}
          className={`btn btn-sm ${section === 'overview' ? 'btn-gold' : 'btn-outline'}`}
        >
          <BarChart3 size={15} />
          <span>Visão Geral de Tráfego</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('heatmap')}
          className={`btn btn-sm ${section === 'heatmap' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Flame size={15} />
          <span>Sensor de Calor (Heatmap)</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('searches')}
          className={`btn btn-sm ${section === 'searches' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Search size={15} />
          <span>Dados Mais Pesquisados</span>
        </button>

        <button
          type="button"
          onClick={() => setSection('properties')}
          className={`btn btn-sm ${section === 'properties' ? 'btn-gold' : 'btn-outline'}`}
        >
          <Building2 size={15} />
          <span>Relatório por Imóvel ({properties.length})</span>
        </button>
      </div>

      {/* 1. SEÇÃO: VISÃO GERAL DE TRÁFEGO */}
      {section === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Gráfico de Barras dos Últimos 14 Dias */}
            <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6 lg:col-span-2">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                    Evolução Diária de Acessos e Buscas (Últimos 14 Dias)
                  </h3>
                  <p className="text-xs text-[#5F5E58]">
                    Volume real de páginas visualizadas, sessões únicas e pesquisas no catálogo
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-[#5F5E58]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#22221E]" />
                    Acessos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#98A67C]" />
                    Buscas Reais
                  </span>
                </div>
              </div>

              <div className="grid h-60 grid-cols-14 items-end gap-2 pt-4">
                {store.dailyHistory.map(day => {
                  const viewsHeight = Math.max(
                    8,
                    Math.round((day.pageViews / maxDailyViews) * 100)
                  );
                  const searchHeight = Math.max(
                    4,
                    Math.round((day.searches / maxDailyViews) * 100)
                  );
                  return (
                    <div
                      key={day.date}
                      className="group flex h-full flex-col items-center justify-end gap-1.5"
                      title={`${day.label}: ${day.pageViews} acessos | ${day.uniqueVisitors} visitantes | ${day.searches} buscas`}
                    >
                      <div className="text-[10px] font-bold text-[#5F5E58] opacity-0 transition-opacity group-hover:opacity-100">
                        {day.pageViews}
                      </div>
                      <div className="flex w-full flex-1 items-end justify-center gap-0.5">
                        <div
                          style={{ height: `${viewsHeight}%` }}
                          className="w-2.5 rounded-t-md bg-[#22221E] transition-all group-hover:bg-[#4A593D] sm:w-3.5"
                        />
                        <div
                          style={{ height: `${searchHeight}%` }}
                          className="w-2 rounded-t-md bg-[#98A67C] sm:w-2.5"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#7A7870]">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Origem do Tráfego & Dispositivos Reais */}
            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#E4E1D7] bg-[#F3F1EB] p-6">
                <h3 className="mb-4 font-serif text-xl font-medium text-[#1F1F1C]">
                  Origem dos Acessos Reais
                </h3>
                <div className="space-y-3.5">
                  {trafficSources.map(item => (
                    <div key={item.source}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#1F1F1C]">
                        <span>{item.source}</span>
                        <span>
                          {item.visits.toLocaleString('pt-BR')} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4E1D7]">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className="h-full rounded-full bg-[#22221E]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
                <h3 className="mb-3 font-serif text-lg font-medium text-[#1F1F1C]">
                  Acessos por Aba do Site
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(store.tabViews)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tab, views]) => {
                      const maxTab = Math.max(...Object.values(store.tabViews), 1);
                      const pct = Math.round((views / maxTab) * 100);
                      return (
                        <div key={tab} className="flex items-center justify-between gap-3 text-xs">
                          <span className="w-28 font-semibold text-[#383733]">
                            {TAB_LABELS[tab] || tab}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F3F1EB]">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-[#76875B]"
                            />
                          </div>
                          <span className="w-12 text-right font-bold text-[#1F1F1C]">
                            {views.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEÇÃO: SENSOR DE CALOR (HEATMAP VISUAL) */}
      {section === 'heatmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Simulador Visual de Tela com Mapa Térmico Sobreposto */}
            <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6 lg:col-span-2">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                    Sensor de Calor da Página (Coordenadas Reais de Cliques)
                  </h3>
                  <p className="text-xs text-[#5F5E58]">
                    Cada ponto representa um clique real feito pelos visitantes no site ({filteredHeatmapPoints.length} cliques exibidos).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={heatmapTabFilter}
                    onChange={e => setHeatmapTabFilter(e.target.value)}
                    className="rounded-full border border-[#D8D4C8] bg-[#FBFBF9] px-3 py-1.5 text-xs font-semibold text-[#1F1F1C]"
                  >
                    <option value="all">Todas as Abas ({store.heatmapPoints.length})</option>
                    <option value="home">Aba Início</option>
                    <option value="venda">Aba Venda</option>
                    <option value="locacao">Aba Locação</option>
                    <option value="temporada">Aba Temporada</option>
                    <option value="empresa">Aba Empresa</option>
                    <option value="contato">Aba Contato</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setHeatmapMode(heatmapMode === 'thermal' ? 'points' : 'thermal')
                    }
                    className="btn btn-outline btn-sm"
                  >
                    <Flame size={14} />
                    <span>
                      {heatmapMode === 'thermal' ? 'Modo Térmico' : 'Modo Pontos'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Wireframe Proporcional do Site com Camada Térmica */}
              <div className="relative h-[520px] w-full overflow-hidden rounded-[20px] border border-[#D8D4C8] bg-[#FBFBF9] shadow-inner select-none">
                {/* 1. Representação proporcional do Header (0% - 14%) */}
                <div className="flex h-[13%] flex-col justify-between border-b border-[#E4E1D7] bg-white px-4 py-2">
                  <div className="flex items-center justify-between text-[10px] text-[#7A7870]">
                    <span>CRECI 30699-J</span>
                    <span className="font-serif text-xs font-semibold text-[#1F1F1C]">
                      Aura Residências
                    </span>
                    <span className="rounded-full bg-[#22221E] px-2 py-0.5 text-[9px] text-white">
                      Agendar Visita
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#5F5E58]">
                    <span className="rounded-full bg-[#22221E] px-2 py-0.5 text-white">INÍCIO</span>
                    <span>A IMOBILIÁRIA</span>
                    <span>COMPRAR</span>
                    <span>ALUGAR</span>
                    <span>TEMPORADA</span>
                    <span>CONTATO</span>
                  </div>
                </div>

                {/* 2. Representação proporcional do Hero + Vídeo (14% - 43%) */}
                <div className="flex h-[29%] flex-col items-center justify-center border-b border-[#E4E1D7] bg-[#F3F1EB] px-6 text-center">
                  <div className="font-serif text-sm font-medium text-[#1F1F1C]">
                    Título Editorial & Apresentação em Vídeo (video-casa.mp4)
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-[#22221E] px-3 py-1 text-[9px] text-white">
                      Pesquisar Imóveis ↗
                    </span>
                    <span className="rounded-full bg-[#E8ECE0] px-3 py-1 text-[9px] text-[#1F1F1C]">
                      Conhecer a Imobiliária ↗
                    </span>
                  </div>
                </div>

                {/* 3. Representação proporcional da Barra de Busca e Filtros (43% - 56%) */}
                <div className="flex h-[13%] items-center justify-between border-b border-[#E4E1D7] bg-[#E8ECE0]/50 px-5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#3E4D32]">
                    <Search size={12} />
                    <span>Barra de Pesquisa: Cidade, Bairro, Código, Quartos e Preço</span>
                  </div>
                  <span className="rounded-full bg-[#22221E] px-3 py-1 text-[9px] font-bold text-white">
                    Filtros Avançados
                  </span>
                </div>

                {/* 4. Representação proporcional da Grade de Cards de Imóveis (56% - 86%) */}
                <div className="grid h-[30%] grid-cols-3 gap-3 border-b border-[#E4E1D7] bg-[#FBFBF9] p-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="flex flex-col justify-between rounded-xl border border-[#E4E1D7] bg-[#F3F1EB] p-2.5"
                    >
                      <div className="h-10 rounded-lg bg-[#E4E1D7]/70" />
                      <div className="text-[9px] font-bold text-[#1F1F1C]">
                        Card de Imóvel #{i}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-[#4A593D]">R$ Valor</span>
                        <span className="rounded-full bg-[#22221E] px-2 py-0.5 text-[8px] text-white">
                          Ver Imóvel ↗
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. Representação proporcional da Seção Institucional (86% - 100%) */}
                <div className="flex h-[14%] items-center justify-between bg-[#22221E] px-5 text-[10px] text-[#D8D5CC]">
                  <span>Seção Institucional • Pilares Sage & Sky • Rodapé</span>
                  <span className="text-[#98A67C]">Falar com Consultor Especialista</span>
                </div>

                {/* CAMADA DE MANCHAS DE CALOR REAIS (HEATMAP OVERLAY) */}
                <div className="pointer-events-none absolute inset-0">
                  {filteredHeatmapPoints.map(pt => (
                    <div
                      key={pt.id}
                      style={{
                        left: `${pt.xPercent}%`,
                        top: `${pt.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        background:
                          heatmapMode === 'thermal'
                            ? 'radial-gradient(circle, rgba(220,38,38,0.52) 0%, rgba(245,158,11,0.34) 42%, rgba(152,166,124,0.12) 72%, transparent 100%)'
                            : '#DC2626',
                        width: heatmapMode === 'thermal' ? '54px' : '10px',
                        height: heatmapMode === 'thermal' ? '54px' : '10px',
                      }}
                      className="absolute rounded-full transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Legenda de Intensidade Térmica */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F5E58]">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#1F1F1C]">Intensidade de Cliques:</span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-[#98A67C]" /> Moderada
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-[#F59E0B]" /> Alta
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-[#DC2626]" /> Muito Quente (Foco Principal)
                  </span>
                </div>
                <span>Clique em qualquer área do site público para testar em tempo real</span>
              </div>
            </div>

            {/* Ranking de Zonas Quentes & Últimos Cliques */}
            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#E4E1D7] bg-[#F3F1EB] p-6">
                <h3 className="mb-4 font-serif text-xl font-medium text-[#1F1F1C]">
                  Áreas Mais Clicadas (Zonas de Calor)
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(store.zoneClicks)
                    .sort((a, b) => b[1] - a[1])
                    .map(([zoneKey, clicks]) => {
                      const pct = Math.round(
                        (clicks / Math.max(totalHeatmapClicks, 1)) * 100
                      );
                      return (
                        <div key={zoneKey}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1F1F1C]">
                              {ZONE_LABELS[zoneKey] || zoneKey}
                            </span>
                            <span className="font-bold text-[#B45309]">
                              {clicks.toLocaleString('pt-BR')} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4E1D7]">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[#98A67C] via-[#F59E0B] to-[#DC2626]"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
                <h3 className="mb-3 font-serif text-lg font-medium text-[#1F1F1C]">
                  Últimas Interações Capturadas pelo Sensor
                </h3>
                {store.heatmapPoints.length === 0 ? (
                  <p className="text-xs text-[#5F5E58]">
                    Nenhum clique registrado ainda nesta sessão. Navegue no site para registrar coordenadas reais.
                  </p>
                ) : (
                  <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                    {store.heatmapPoints.slice(0, 12).map(pt => (
                      <div
                        key={pt.id}
                        className="flex items-center justify-between rounded-xl border border-[#EFECE4] bg-[#FBFBF9] px-3 py-2 text-xs"
                      >
                        <div className=" truncate pr-2">
                          <div className="font-semibold text-[#1F1F1C]">
                            {pt.elementLabel}
                          </div>
                          <div className="text-[10px] text-[#7A7870]">
                            {TAB_LABELS[pt.tab] || pt.tab} • Posição ({pt.xPercent}%, {pt.yPercent}%)
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#E8ECE0] px-2 py-0.5 text-[10px] font-bold text-[#3E4D32]">
                          Ativo
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEÇÃO: DADOS MAIS PESQUISADOS (SEARCH INTELLIGENCE) */}
      {section === 'searches' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Termos e Palavras-Chave Mais Buscados */}
            <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                  Termos Mais Pesquisados
                </h3>
                <Search size={18} className="text-[#4A593D]" />
              </div>
              <p className="mb-4 text-xs text-[#5F5E58]">
                O que os clientes digitam na barra de busca do catálogo:
              </p>
              {sortedKeywords.length === 0 ? (
                <p className="text-xs text-[#5F5E58]">
                  Nenhuma palavra-chave pesquisada ainda. Faça uma busca no catálogo para registrar.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {sortedKeywords.slice(0, 10).map(([keyword, count], idx) => (
                    <div
                      key={keyword}
                      className="flex items-center justify-between rounded-xl border border-[#EFECE4] bg-[#FBFBF9] px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22221E] text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#1F1F1C] capitalize">
                          "{keyword}"
                        </span>
                      </div>
                      <span className="rounded-full bg-[#E8ECE0] px-2.5 py-0.5 font-bold text-[#3E4D32]">
                        {count} buscas
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cidades e Bairros Mais Procurados */}
            <div className="rounded-[24px] border border-[#E4E1D7] bg-[#F3F1EB] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                  Cidades & Bairros Mais Buscados
                </h3>
                <MapPin size={18} className="text-[#4A593D]" />
              </div>
              <div className="space-y-3">
                {sortedCities.slice(0, 6).map(([city, count]) => {
                  const maxC = sortedCities[0]?.[1] || 1;
                  const pct = Math.round((count / maxC) * 100);
                  return (
                    <div key={city}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#1F1F1C]">
                        <span>{city}</span>
                        <span>{count} registros</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4E1D7]">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-[#22221E]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-[#E4E1D7] pt-4">
                <div className="mb-2.5 text-xs font-bold tracking-wider text-[#5F5E58] uppercase">
                  Bairros & Condomínios em Destaque
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(store.searchCounts.neighborhoods)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([nb, cnt]) => (
                      <span
                        key={nb}
                        className="rounded-full border border-[#D8D4C8] bg-white px-3 py-1 text-xs font-medium text-[#1F1F1C]"
                      >
                        {nb} <strong className="text-[#4A593D]">({cnt})</strong>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Tipologias, Faixas de Preço e Dormitórios */}
            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
                <h3 className="mb-3 font-serif text-lg font-medium text-[#1F1F1C]">
                  Tipos de Imóvel Mais Procurados
                </h3>
                <div className="space-y-2.5">
                  {sortedPropertyTypes.map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#383733]">
                        {PROPERTY_TYPE_LABELS[type] || type}
                      </span>
                      <span className="font-bold text-[#1F1F1C]">
                        {count} registros
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#E4E1D7] bg-[#E8ECE0]/60 p-6">
                <h3 className="mb-3 font-serif text-lg font-medium text-[#1F1F1C]">
                  Faixas de Valor Pesquisadas
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(store.searchCounts.priceBrackets)
                    .sort((a, b) => b[1] - a[1])
                    .map(([bracket, count]) => (
                      <div
                        key={bracket}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-[#2F3A25]">{bracket}</span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 font-bold text-[#1F1F1C]">
                          {count} buscas
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Histórico em Tempo Real das Últimas Buscas no Catálogo */}
          <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
            <h3 className="mb-4 font-serif text-xl font-medium text-[#1F1F1C]">
              Registro Ao Vivo das Últimas Pesquisas dos Clientes
            </h3>
            {store.recentSearches.length === 0 ? (
              <p className="text-xs text-[#5F5E58]">
                Nenhuma pesquisa registrada até o momento. Quando um visitante filtrar imóveis no catálogo, a busca aparecerá aqui.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E1D7] text-[#5F5E58]">
                      <th className="pb-3 font-semibold">Termo / Código</th>
                      <th className="pb-3 font-semibold">Finalidade</th>
                      <th className="pb-3 font-semibold">Tipo de Imóvel</th>
                      <th className="pb-3 font-semibold">Cidade / Bairro</th>
                      <th className="pb-3 font-semibold">Dormitórios</th>
                      <th className="pb-3 font-semibold">Teto de Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE4]">
                    {store.recentSearches.slice(0, 10).map(entry => (
                      <tr key={entry.id} className="hover:bg-[#FBFBF9]">
                        <td className="py-3 font-semibold text-[#1F1F1C]">
                          {entry.query}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-[#F3F1EB] px-2.5 py-0.5 font-semibold text-[#383733]">
                            {entry.transactionType}
                          </span>
                        </td>
                        <td className="py-3 text-[#383733]">{entry.propertyType}</td>
                        <td className="py-3 text-[#383733]">
                          {entry.city} {entry.neighborhood !== 'Todos' ? `• ${entry.neighborhood}` : ''}
                        </td>
                        <td className="py-3 text-[#383733]">
                          {entry.minBedrooms > 0 ? `${entry.minBedrooms}+ quartos` : 'Qualquer'}
                        </td>
                        <td className="py-3 font-medium text-[#4A593D]">
                          {entry.maxPrice > 0 ? formatCurrency(entry.maxPrice) : 'Sem limite'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SEÇÃO: RELATÓRIO DE DESEMPENHO POR IMÓVEL */}
      {section === 'properties' && (
        <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                Relatório de Audiência e Conversão por Imóvel
              </h3>
              <p className="text-xs text-[#5F5E58]">
                Cruzamento real entre visualizações da página, cliques na prévia rápida, favoritos salvos, leads e visitas agendadas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E1D7] text-[#5F5E58]">
                  <th className="pb-3 font-semibold">Posição & Imóvel</th>
                  <th className="pb-3 font-semibold">Localização</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 text-center font-semibold">Visualizações</th>
                  <th className="pb-3 text-center font-semibold">Prévias Rápidas</th>
                  <th className="pb-3 text-center font-semibold">Salvo em Favoritos</th>
                  <th className="pb-3 text-center font-semibold">Leads & Visitas</th>
                  <th className="pb-3 text-right font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE4]">
                {sortedPropertiesMetrics.map((metric, idx) => {
                  const matchedProp = properties.find(p => p.id === metric.propertyId);
                  const conversionRate =
                    metric.views > 0
                      ? ((metric.leadsAndBookings / metric.views) * 100).toFixed(1)
                      : '0.0';
                  return (
                    <tr key={metric.propertyId} className="hover:bg-[#FBFBF9]">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              idx < 3
                                ? 'bg-[#22221E] text-white'
                                : 'bg-[#F3F1EB] text-[#5F5E58]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-[#1F1F1C]">
                              {metric.propertyTitle}
                            </div>
                            <div className="text-[10px] font-bold text-[#7A7870]">
                              Cód: {metric.propertyCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#5F5E58]">
                        {metric.neighborhood}, {metric.city}
                      </td>
                      <td className="py-3.5 font-serif font-semibold text-[#1F1F1C]">
                        {formatCurrency(metric.price)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F1EB] px-2.5 py-1 font-bold text-[#1F1F1C]">
                          <Eye size={12} className="text-[#4A593D]" />
                          {metric.views.toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-semibold text-[#383733]">
                        {metric.previews.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#B45309]">
                          <Star size={12} fill="#B45309" />
                          {metric.favorites}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8ECE0] px-2.5 py-1 font-bold text-[#2E6F40]">
                          <CheckCircle2 size={12} />
                          {metric.leadsAndBookings} ({conversionRate}%)
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {matchedProp && (
                          <button
                            type="button"
                            onClick={() => onPreviewProperty(matchedProp)}
                            className="btn btn-outline btn-sm"
                          >
                            <ExternalLink size={13} />
                            <span>Ver Imóvel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
