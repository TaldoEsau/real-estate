import { Property, PropertyFilterState, BookingRequest, Lead } from '../types';
import { StorageService } from './storageService';

const STORAGE_ANALYTICS_KEY = 'moliaria_real_analytics_v2';
const SESSION_TRACKED_KEY = 'moliaria_active_session_v2';
const FAVORITES_STORAGE_KEY = 'aura_favorites_v1';

export interface HeatmapPoint {
  id: string;
  xPercent: number; // 0 a 100
  yPercent: number; // 0 a 100
  tab: string;
  zone:
    | 'navbar'
    | 'hero_video'
    | 'search_filters'
    | 'property_cards'
    | 'institutional_footer'
    | 'property_detail';
  elementLabel: string;
  timestamp: string;
}

export interface SearchLogEntry {
  id: string;
  query: string;
  transactionType: string;
  propertyType: string;
  city: string;
  neighborhood: string;
  maxPrice: number;
  minBedrooms: number;
  resultsCount?: number;
  timestamp: string;
}

export interface PropertyEngagementMetric {
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  city: string;
  neighborhood: string;
  price: number;
  views: number;
  previews: number;
  favorites: number;
  leadsCount: number;
  bookingsCount: number;
  leadsAndBookings: number;
  lastViewedAt: string | null;
}

export interface DailyTrafficPoint {
  date: string;
  label: string;
  pageViews: number;
  uniqueVisitors: number;
  searches: number;
  clicks: number;
}

export interface SiteAnalyticsStore {
  totalPageViews: number;
  uniqueSessions: number;
  totalSessionSeconds: number;
  tabViews: Record<string, number>;
  deviceCounts: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSourceCounts: Record<string, number>;
  dailyHistory: DailyTrafficPoint[];
  heatmapPoints: HeatmapPoint[];
  zoneClicks: {
    navbar: number;
    hero_video: number;
    search_filters: number;
    property_cards: number;
    institutional_footer: number;
    property_detail: number;
  };
  searchCounts: {
    keywords: Record<string, number>;
    cities: Record<string, number>;
    neighborhoods: Record<string, number>;
    propertyTypes: Record<string, number>;
    transactionTypes: Record<string, number>;
    priceBrackets: Record<string, number>;
    bedrooms: Record<string, number>;
  };
  recentSearches: SearchLogEntry[];
  propertyTelemetry: Record<
    string,
    {
      views: number;
      previews: number;
      favorites: number;
      lastViewedAt: string | null;
    }
  >;
}

const analyticsListeners = new Set<() => void>();

function notifyAnalyticsListeners() {
  analyticsListeners.forEach(fn => fn());
}

export function subscribeToAnalytics(listener: () => void): () => void {
  analyticsListeners.add(listener);
  return () => {
    analyticsListeners.delete(listener);
  };
}

function buildLast14DaysEmpty(): DailyTrafficPoint[] {
  const now = new Date();
  const list: DailyTrafficPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(d);
    list.push({
      date: dateStr,
      label,
      pageViews: 0,
      uniqueVisitors: 0,
      searches: 0,
      clicks: 0,
    });
  }
  return list;
}

function createEmptyStore(): SiteAnalyticsStore {
  return {
    totalPageViews: 0,
    uniqueSessions: 0,
    totalSessionSeconds: 0,
    tabViews: {
      home: 0,
      venda: 0,
      locacao: 0,
      temporada: 0,
      empresa: 0,
      contato: 0,
    },
    deviceCounts: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    trafficSourceCounts: {
      'Acesso Direto': 0,
      'Busca Orgânica (Google / Bing)': 0,
      'Redes Sociais (Instagram / Facebook)': 0,
      'WhatsApp / Link Compartilhado': 0,
    },
    dailyHistory: buildLast14DaysEmpty(),
    heatmapPoints: [],
    zoneClicks: {
      property_cards: 0,
      search_filters: 0,
      hero_video: 0,
      navbar: 0,
      property_detail: 0,
      institutional_footer: 0,
    },
    searchCounts: {
      keywords: {},
      cities: {},
      neighborhoods: {},
      propertyTypes: {},
      transactionTypes: {},
      priceBrackets: {},
      bedrooms: {},
    },
    recentSearches: [],
    propertyTelemetry: {},
  };
}

function ensureDailyHistoryUpToDate(store: SiteAnalyticsStore): void {
  const expected = buildLast14DaysEmpty();
  const existingByDate = new Map(store.dailyHistory.map(d => [d.date, d]));
  store.dailyHistory = expected.map(day => existingByDate.get(day.date) || day);
}

function detectRealDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectRealTrafficSource(): string {
  if (typeof document === 'undefined') return 'Acesso Direto';
  const ref = (document.referrer || '').toLowerCase();
  const url = (window.location.href || '').toLowerCase();

  if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
    return 'Busca Orgânica (Google / Bing)';
  }
  if (
    ref.includes('instagram') ||
    ref.includes('facebook') ||
    ref.includes('t.co') ||
    url.includes('utm_source=instagram')
  ) {
    return 'Redes Sociais (Instagram / Facebook)';
  }
  if (ref.includes('whatsapp') || ref.includes('wa.me') || url.includes('utm_source=whatsapp')) {
    return 'WhatsApp / Link Compartilhado';
  }
  return 'Acesso Direto';
}

let sessionTimerId: number | null = null;

export class AnalyticsService {
  public static getStore(): SiteAnalyticsStore {
    try {
      const raw = localStorage.getItem(STORAGE_ANALYTICS_KEY);
      if (raw) {
        const parsed: SiteAnalyticsStore = JSON.parse(raw);
        ensureDailyHistoryUpToDate(parsed);
        return parsed;
      }
      const initial = createEmptyStore();
      localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.warn('Erro ao ler telemetria real:', e);
      return createEmptyStore();
    }
  }

  private static saveStore(store: SiteAnalyticsStore): void {
    try {
      ensureDailyHistoryUpToDate(store);
      localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(store));
      notifyAnalyticsListeners();
    } catch (e) {
      console.warn('Erro ao salvar telemetria real:', e);
    }
  }

  /**
   * Inicializa a sessão real do navegador (contabiliza visitante único, dispositivo real, origem real e tempo ativo)
   */
  public static initRealSession(): void {
    if (typeof window === 'undefined') return;

    const store = this.getStore();
    const alreadyTrackedInTab = sessionStorage.getItem(SESSION_TRACKED_KEY);

    if (!alreadyTrackedInTab) {
      sessionStorage.setItem(SESSION_TRACKED_KEY, '1');
      store.uniqueSessions += 1;

      const device = detectRealDevice();
      store.deviceCounts[device] = (store.deviceCounts[device] || 0) + 1;

      const source = detectRealTrafficSource();
      store.trafficSourceCounts[source] = (store.trafficSourceCounts[source] || 0) + 1;

      const todayStr = new Date().toISOString().split('T')[0];
      ensureDailyHistoryUpToDate(store);
      const todayEntry = store.dailyHistory.find(d => d.date === todayStr);
      if (todayEntry) {
        todayEntry.uniqueVisitors += 1;
      }

      // Contabiliza a visualização inicial na aba home
      store.totalPageViews += 1;
      store.tabViews.home = (store.tabViews.home || 0) + 1;
      if (todayEntry) {
        todayEntry.pageViews += 1;
      }

      this.saveStore(store);
    }

    // Inicia cronômetro real de tempo de sessão ativa (atualiza a cada 5 segundos quando a aba está visível)
    if (sessionTimerId === null) {
      sessionTimerId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          const current = this.getStore();
          current.totalSessionSeconds += 5;
          this.saveStore(current);
        }
      }, 5000);
    }
  }

  /**
   * Retorna as métricas reais de cada imóvel cruzando:
   * - Visualizações e Prévias reais (telemetria)
   * - Favoritos reais salvos no sistema (aura_favorites_v1)
   * - Leads reais cadastrados no sistema (LeadService)
   * - Agendamentos de Visita reais no sistema (StorageService.getBookings)
   */
  public static getRealPropertyMetrics(
    properties: Property[],
    bookings: BookingRequest[],
    leads: Lead[]
  ): PropertyEngagementMetric[] {
    const store = this.getStore();

    let savedFavIds: string[] = [];
    try {
      const rawFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (rawFavs) savedFavIds = JSON.parse(rawFavs);
    } catch {
      savedFavIds = [];
    }

    return properties.map((prop, idx) => {
      const telemetry = store.propertyTelemetry[prop.id] || {
        views: 0,
        previews: 0,
        favorites: 0,
        lastViewedAt: null,
      };

      const realBookingsCount = bookings.filter(b => b.propertyId === prop.id).length;
      const realLeadsCount = leads.filter(l => l.propertyId === prop.id).length;
      const isCurrentlyFavorited = savedFavIds.includes(prop.id);
      const realFavoritesCount = Math.max(
        telemetry.favorites,
        isCurrentlyFavorited ? 1 : 0
      );

      return {
        propertyId: prop.id,
        propertyTitle: prop.title,
        propertyCode: prop.code || `IMV-${idx + 101}`,
        city: prop.location.city,
        neighborhood: prop.location.neighborhood || prop.location.city,
        price: prop.price,
        views: telemetry.views,
        previews: telemetry.previews,
        favorites: realFavoritesCount,
        leadsCount: realLeadsCount,
        bookingsCount: realBookingsCount,
        leadsAndBookings: realLeadsCount + realBookingsCount,
        lastViewedAt: telemetry.lastViewedAt,
      };
    });
  }

  /**
   * Registra visualização real de uma aba ou página
   */
  public static trackPageView(tab: string): void {
    const store = this.getStore();
    store.totalPageViews += 1;
    store.tabViews[tab] = (store.tabViews[tab] || 0) + 1;

    const todayStr = new Date().toISOString().split('T')[0];
    ensureDailyHistoryUpToDate(store);
    const todayEntry = store.dailyHistory.find(d => d.date === todayStr);
    if (todayEntry) {
      todayEntry.pageViews += 1;
    }

    this.saveStore(store);
  }

  /**
   * Registra ponto real no Sensor de Calor (Heatmap)
   */
  public static trackHeatmapClick(params: {
    xPercent: number;
    yPercent: number;
    tab: string;
    zone: HeatmapPoint['zone'];
    elementLabel: string;
  }): void {
    const store = this.getStore();
    const point: HeatmapPoint = {
      id: `hp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      xPercent: Math.max(2, Math.min(98, Math.round(params.xPercent))),
      yPercent: Math.max(2, Math.min(98, Math.round(params.yPercent))),
      tab: params.tab,
      zone: params.zone,
      elementLabel: params.elementLabel,
      timestamp: new Date().toISOString(),
    };

    store.heatmapPoints = [point, ...store.heatmapPoints.slice(0, 300)];
    store.zoneClicks[params.zone] = (store.zoneClicks[params.zone] || 0) + 1;

    const todayStr = new Date().toISOString().split('T')[0];
    ensureDailyHistoryUpToDate(store);
    const todayEntry = store.dailyHistory.find(d => d.date === todayStr);
    if (todayEntry) {
      todayEntry.clicks += 1;
    }

    this.saveStore(store);
  }

  /**
   * Registra os filtros e termos realmente pesquisados pelos visitantes no catálogo
   */
  public static trackSearchFilter(
    filters: PropertyFilterState,
    resultsCount?: number
  ): void {
    const hasActiveSearch =
      filters.searchQuery.trim().length >= 2 ||
      (filters.code && filters.code.trim().length >= 2) ||
      (filters.state && filters.state !== 'all') ||
      filters.city !== 'all' ||
      (filters.neighborhood && filters.neighborhood !== 'all') ||
      filters.propertyType !== 'all' ||
      filters.transactionType !== 'all' ||
      filters.minBedrooms > 0 ||
      (filters.minSuites && filters.minSuites > 0) ||
      (filters.minGarageSpaces && filters.minGarageSpaces > 0) ||
      (filters.minAreaSqM && filters.minAreaSqM > 0) ||
      (filters.maxPrice > 0 && filters.maxPrice < 15000000 && filters.maxPrice !== 50000);

    if (!hasActiveSearch) return;

    const store = this.getStore();

    // 1. Termo de busca ou Código
    const queryClean = (filters.searchQuery.trim() || filters.code?.trim() || '').toLowerCase();
    if (queryClean.length >= 2) {
      store.searchCounts.keywords[queryClean] =
        (store.searchCounts.keywords[queryClean] || 0) + 1;
    }

    // 2. Cidade
    if (filters.city && filters.city !== 'all') {
      store.searchCounts.cities[filters.city] =
        (store.searchCounts.cities[filters.city] || 0) + 1;
    }

    // 3. Bairro
    if (filters.neighborhood && filters.neighborhood !== 'all') {
      store.searchCounts.neighborhoods[filters.neighborhood] =
        (store.searchCounts.neighborhoods[filters.neighborhood] || 0) + 1;
    }

    // 4. Tipo de Imóvel
    if (filters.propertyType && filters.propertyType !== 'all') {
      store.searchCounts.propertyTypes[filters.propertyType] =
        (store.searchCounts.propertyTypes[filters.propertyType] || 0) + 1;
    }

    // 5. Tipo de Transação
    if (filters.transactionType && filters.transactionType !== 'all') {
      store.searchCounts.transactionTypes[filters.transactionType] =
        (store.searchCounts.transactionTypes[filters.transactionType] || 0) + 1;
    }

    // 6. Quartos
    if (filters.minBedrooms > 0) {
      const key = `${filters.minBedrooms}+ Quartos`;
      store.searchCounts.bedrooms[key] =
        (store.searchCounts.bedrooms[key] || 0) + 1;
    }

    // 7. Faixa de Preço (apenas quando selecionada ativamente)
    if (filters.transactionType === 'for_rent' && filters.maxPrice < 50000) {
      const key = `Locação até R$ ${filters.maxPrice.toLocaleString('pt-BR')}/mês`;
      store.searchCounts.priceBrackets[key] =
        (store.searchCounts.priceBrackets[key] || 0) + 1;
    } else if (filters.maxPrice < 15000000) {
      if (filters.maxPrice <= 1000000) {
        store.searchCounts.priceBrackets['Até R$ 1.000.000'] =
          (store.searchCounts.priceBrackets['Até R$ 1.000.000'] || 0) + 1;
      } else if (filters.maxPrice <= 3500000) {
        store.searchCounts.priceBrackets['R$ 1M a R$ 3,5M'] =
          (store.searchCounts.priceBrackets['R$ 1M a R$ 3,5M'] || 0) + 1;
      } else {
        store.searchCounts.priceBrackets['Acima de R$ 3,5M'] =
          (store.searchCounts.priceBrackets['Acima de R$ 3,5M'] || 0) + 1;
      }
    }

    const typeLabels: Record<string, string> = {
      all: 'Todos os Tipos',
      apartment: 'Apartamento',
      house: 'Casa',
      villa: 'Casa em Condomínio',
      penthouse: 'Cobertura',
      townhouse: 'Casa de Vila',
      commercial: 'Comercial',
    };

    const newLog: SearchLogEntry = {
      id: `srch_${Date.now()}`,
      query:
        filters.searchQuery.trim() ||
        (filters.code ? `Cód: ${filters.code}` : 'Filtro por Características'),
      transactionType:
        filters.transactionType === 'for_sale'
          ? 'Venda'
          : filters.transactionType === 'for_rent'
          ? 'Locação'
          : 'Todos',
      propertyType: typeLabels[filters.propertyType] || filters.propertyType,
      city: filters.city === 'all' ? 'Todas' : filters.city,
      neighborhood:
        !filters.neighborhood || filters.neighborhood === 'all'
          ? 'Todos'
          : filters.neighborhood,
      maxPrice: filters.maxPrice || 15000000,
      minBedrooms: filters.minBedrooms || 0,
      resultsCount,
      timestamp: new Date().toISOString(),
    };

    store.recentSearches = [newLog, ...store.recentSearches.slice(0, 49)];

    const todayStr = new Date().toISOString().split('T')[0];
    ensureDailyHistoryUpToDate(store);
    const todayEntry = store.dailyHistory.find(d => d.date === todayStr);
    if (todayEntry) {
      todayEntry.searches += 1;
    }

    this.saveStore(store);
  }

  /**
   * Registra abertura real da página de detalhes de um imóvel
   */
  public static trackPropertyView(property: Property): void {
    const store = this.getStore();
    if (!store.propertyTelemetry[property.id]) {
      store.propertyTelemetry[property.id] = {
        views: 1,
        previews: 0,
        favorites: 0,
        lastViewedAt: new Date().toISOString(),
      };
    } else {
      store.propertyTelemetry[property.id].views += 1;
      store.propertyTelemetry[property.id].lastViewedAt = new Date().toISOString();
    }

    if (property.location.city) {
      store.searchCounts.cities[property.location.city] =
        (store.searchCounts.cities[property.location.city] || 0) + 1;
    }
    if (property.location.neighborhood) {
      store.searchCounts.neighborhoods[property.location.neighborhood] =
        (store.searchCounts.neighborhoods[property.location.neighborhood] || 0) + 1;
    }
    if (property.propertyType) {
      store.searchCounts.propertyTypes[property.propertyType] =
        (store.searchCounts.propertyTypes[property.propertyType] || 0) + 1;
    }

    this.saveStore(store);
  }

  /**
   * Registra clique real no botão "Prévia" (IntroDisclosure) do card
   */
  public static trackPropertyPreview(property: Property): void {
    const store = this.getStore();
    if (!store.propertyTelemetry[property.id]) {
      store.propertyTelemetry[property.id] = {
        views: 0,
        previews: 1,
        favorites: 0,
        lastViewedAt: new Date().toISOString(),
      };
    } else {
      store.propertyTelemetry[property.id].previews += 1;
      store.propertyTelemetry[property.id].lastViewedAt = new Date().toISOString();
    }
    this.saveStore(store);
  }

  /**
   * Registra quando um visitante favorita um imóvel
   */
  public static trackPropertyFavorite(property: Property): void {
    const store = this.getStore();
    if (!store.propertyTelemetry[property.id]) {
      store.propertyTelemetry[property.id] = {
        views: 0,
        previews: 0,
        favorites: 1,
        lastViewedAt: new Date().toISOString(),
      };
    } else {
      store.propertyTelemetry[property.id].favorites += 1;
    }
    this.saveStore(store);
  }

  /**
   * Limpa o histórico de telemetria caso o administrador queira reiniciar a contagem
   */
  public static resetAnalytics(): void {
    const fresh = createEmptyStore();
    sessionStorage.removeItem(SESSION_TRACKED_KEY);
    this.saveStore(fresh);
    this.initRealSession();
  }

  /**
   * Exporta o relatório com 100% dos dados reais do sistema em CSV
   */
  public static exportAnalyticsReportCsv(
    properties: Property[],
    bookings: BookingRequest[],
    leads: Lead[]
  ): void {
    const store = this.getStore();
    const propMetrics = this.getRealPropertyMetrics(properties, bookings, leads);
    const avgSec = Math.round(
      store.totalSessionSeconds / Math.max(store.uniqueSessions, 1)
    );

    const lines: string[] = [];
    lines.push('RELATORIO OFICIAL DO SISTEMA - ACESSOS, SENSOR DE CALOR, BUSCAS, LEADS E VISITAS');
    lines.push(`Gerado em,${new Date().toLocaleString('pt-BR')}`);
    lines.push('');

    lines.push('1. INDICADORES REAIS DO SISTEMA');
    lines.push('Indicador,Valor');
    lines.push(`Total de Imoveis Cadastrados,${properties.length}`);
    lines.push(`Imoveis Ativos no Catalogo,${properties.filter(p => p.status === 'active').length}`);
    lines.push(`Total de Leads Recebidos (CRM),${leads.length}`);
    lines.push(`Total de Visitas Agendadas,${bookings.length}`);
    lines.push(`Visualizacoes de Pagina Registradas,${store.totalPageViews}`);
    lines.push(`Sessoes Unicas Registradas,${store.uniqueSessions}`);
    lines.push(`Tempo Medio de Sessao (segundos),${avgSec}`);
    lines.push(`Total de Cliques Capturados pelo Sensor de Calor,${Object.values(store.zoneClicks).reduce((a, b) => a + b, 0)}`);
    lines.push('');

    lines.push('2. CLIQUES REAIS POR ZONA DO MAPA DE CALOR');
    lines.push('Zona da Pagina,Total de Cliques');
    lines.push(`Grade de Cards de Imoveis,${store.zoneClicks.property_cards}`);
    lines.push(`Motor de Busca e Filtros,${store.zoneClicks.search_filters}`);
    lines.push(`Pagina de Detalhes e Agendamento,${store.zoneClicks.property_detail}`);
    lines.push(`Apresentacao em Video e Destaques,${store.zoneClicks.hero_video}`);
    lines.push(`Barra de Navegacao e Abas,${store.zoneClicks.navbar}`);
    lines.push(`Secao Institucional e Rodape,${store.zoneClicks.institutional_footer}`);
    lines.push('');

    lines.push('3. TERMOS E PALAVRAS-CHAVE PESQUISADOS');
    lines.push('Palavra-Chave,Quantidade de Buscas');
    Object.entries(store.searchCounts.keywords)
      .sort((a, b) => b[1] - a[1])
      .forEach(([kw, count]) => {
        lines.push(`"${kw}",${count}`);
      });
    lines.push('');

    lines.push('4. CIDADES INTERAGIDAS E PESQUISADAS');
    lines.push('Cidade,Volume de Buscas e Acessos');
    Object.entries(store.searchCounts.cities)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        lines.push(`"${city}",${count}`);
      });
    lines.push('');

    lines.push('5. DESEMPENHO REAL POR IMOVEL DO SISTEMA');
    lines.push('Codigo,Imovel,Cidade,Bairro,Valor,Visualizacoes,Previas,Favoritos,Leads (CRM),Visitas Agendadas,Total Contatos');
    propMetrics
      .sort((a, b) => b.leadsAndBookings - a.leadsAndBookings || b.views - a.views)
      .forEach(m => {
        lines.push(
          `"${m.propertyCode}","${m.propertyTitle}","${m.city}","${m.neighborhood}",${m.price},${m.views},${m.previews},${m.favorites},${m.leadsCount},${m.bookingsCount},${m.leadsAndBookings}`
        );
      });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-sistema-imobiliaria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
