import { Property, Agent, AvailabilitySchedule } from '../types';

export const SEED_AGENTS: Agent[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Alexandra Vance',
    email: 'alexandra.vance@auraimoveis.com.br',
    phone: '+55 (11) 98849-2201',
    role: 'Especialista Sênior em Alto Padrão & Sócia',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Mais de 12 anos de experiência em intermediação de propriedades de alto padrão e condomínios fechados.'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Julian Montgomery',
    email: 'julian.m@auraimoveis.com.br',
    phone: '+55 (11) 99650-8840',
    role: 'Consultor Principal de Arquitetura & Investimentos',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    bio: 'Especialista em coberturas, lofts contemporâneos e consultoria de investimentos imobiliários.'
  }
];

export const SEED_PROPERTIES: Property[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    code: 'CS1042',
    title: 'Mansão Panorâmica Morumbi & Spa Privativo',
    slug: 'mansao-panoramica-morumbi-spa-privativo',
    description: 'Mansão contemporânea com vista panorâmica definitiva. Integração total entre os ambientes, piscina com borda infinita de 18 metros, adega climatizada e automação residencial completa.',
    price: 4250000,
    rentalPrice: 18000,
    condoFee: 2400,
    iptuFee: 950,
    propertyType: 'villa',
    listingType: 'both',
    status: 'active',
    location: {
      address: 'Rua das Magnólias, 108',
      number: '108',
      neighborhood: 'Morumbi Nobre',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05678-000',
      lat: -23.5987,
      lng: -46.7147
    },
    specs: {
      bedrooms: 5,
      suites: 4,
      bathrooms: 6,
      areaSqM: 636,
      areaSqFt: 6850,
      yearBuilt: 2023,
      garageSpaces: 4
    },
    amenities: [
      'Piscina com Borda Infinita',
      'Adega Climatizada',
      'Automação Residencial',
      'Cinema Privativo',
      'Vista Panorâmica',
      'Espaço Gourmet',
      'Sauna Úmida'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
    ],
    assignedAgentId: 'a1111111-1111-1111-1111-111111111111',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    code: 'CB2088',
    title: 'Cobertura Duplex com Terraço Panorâmico',
    slug: 'cobertura-duplex-terraco-panoramico',
    description: 'Espetacular cobertura duplex com pé-direito duplo de 6 metros, elevador privativo com biometria, cozinha italiana Boffi planejada e amplo terraço gourmet com jacuzzi.',
    price: 3800000,
    rentalPrice: 22000,
    condoFee: 3100,
    iptuFee: 1200,
    propertyType: 'penthouse',
    listingType: 'both',
    status: 'active',
    location: {
      address: 'Rua Haddock Lobo, 1400',
      number: '1400',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01414-002',
      lat: -23.5615,
      lng: -46.6631
    },
    specs: {
      bedrooms: 3,
      suites: 3,
      bathrooms: 4,
      areaSqM: 380,
      areaSqFt: 4100,
      yearBuilt: 2022,
      garageSpaces: 3
    },
    amenities: [
      'Terraço Gourmet com Jacuzzi',
      'Portaria 24h Blindada',
      'Lareira Ecológica',
      'Elevador com Biometria',
      'Cozinha Italiana Boffi',
      'Adega para 180 Garrafas'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'
    ],
    assignedAgentId: 'a2222222-2222-2222-2222-222222222222',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-15T16:20:00Z'
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    code: 'CS3050',
    title: 'Casa Minimalista Contemporânea',
    slug: 'casa-minimalista-contemporanea',
    description: 'Projeto arquitetônico premiado com pátio zen central, portas de correr piso-teto em alumínio minimalista, pisos em travertino e suíte master com banheira externa esculpida.',
    price: 2950000,
    rentalPrice: 0,
    condoFee: 1600,
    iptuFee: 780,
    propertyType: 'house',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: 'Alameda dos Ipês, 450',
      number: '450',
      neighborhood: 'Granja Viana',
      city: 'Cotia',
      state: 'SP',
      zipCode: '06700-150',
      lat: -23.5855,
      lng: -46.8402
    },
    specs: {
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      areaSqM: 483,
      areaSqFt: 5200,
      yearBuilt: 2021,
      garageSpaces: 4
    },
    amenities: [
      'Pátio Zen Central',
      'Banheira Esculpida',
      'Casa de Hóspedes',
      'Energia Solar Fotovoltaica',
      'Cozinha com Ilha em Quartzo',
      'Sistema de Monitoramento 4K'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600573472591-ee6c8e695394?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80'
    ],
    assignedAgentId: 'a1111111-1111-1111-1111-111111111111',
    createdAt: '2026-09-20T11:45:00Z',
    updatedAt: '2026-10-12T08:15:00Z'
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    code: 'AP4010',
    title: 'Apartamento de Alto Padrão no Itaim Bibi',
    slug: 'apartamento-alto-padrao-itaim-bibi',
    description: 'Imóvel mobiliado e decorado por arquiteto de renome. Living integrado para 3 ambientes, varanda envidraçada com churrasqueira gourmet e acabamento impecável em mármore.',
    price: 1850000,
    rentalPrice: 9500,
    condoFee: 1450,
    iptuFee: 420,
    propertyType: 'apartment',
    listingType: 'for_rent',
    status: 'active',
    location: {
      address: 'Rua Joaquim Floriano, 800',
      number: '800',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04534-003',
      lat: -23.5842,
      lng: -46.6781
    },
    specs: {
      bedrooms: 2,
      suites: 2,
      bathrooms: 3,
      areaSqM: 130,
      areaSqFt: 2250,
      yearBuilt: 2023,
      garageSpaces: 2
    },
    amenities: [
      'Piscina Aquecida com Raia de 25m',
      'Varanda com Churrasqueira',
      'Academia Completa Equipada',
      'Estacionamento com Manobrista',
      'Fechadura Biométrica'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80'
    ],
    assignedAgentId: 'a2222222-2222-2222-2222-222222222222',
    createdAt: '2026-10-01T15:30:00Z',
    updatedAt: '2026-10-17T12:00:00Z'
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    code: 'TH5020',
    title: 'Casa de Vila Exclusiva em Condomínio Fechado',
    slug: 'casa-de-vila-exclusiva-condominio-fechado',
    description: 'Residência sofisticada em vila fechada com segurança privada. Quatro pavimentos com piso em peroba-do-campo, lareiras a lenha e jardim privativo de inverno.',
    price: 5400000,
    rentalPrice: 28000,
    condoFee: 850,
    iptuFee: 1100,
    propertyType: 'townhouse',
    listingType: 'both',
    status: 'active',
    location: {
      address: 'Rua Bela Cintra, 2100',
      number: '2100',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01415-002',
      lat: -23.5594,
      lng: -46.6645
    },
    specs: {
      bedrooms: 4,
      suites: 3,
      bathrooms: 4,
      areaSqM: 427,
      areaSqFt: 4600,
      yearBuilt: 2020,
      garageSpaces: 3
    },
    amenities: [
      'Jardim de Inverno Privativo',
      'Lareira a Lenha',
      'Adega Subterrânea',
      'Marcenaria Artesanal',
      'Terraço Panorâmico com Vista Urbana'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6c8e695394?auto=format&fit=crop&w=1000&q=80'
    ],
    assignedAgentId: 'a2222222-2222-2222-2222-222222222222',
    createdAt: '2026-09-28T16:00:00Z',
    updatedAt: '2026-10-18T14:40:00Z'
  }
];

export const SEED_SCHEDULES: AvailabilitySchedule[] = SEED_PROPERTIES.map(p => ({
  id: `sched-${p.id}`,
  propertyId: p.id,
  daysOfWeek: [1, 2, 3, 4, 5, 6], // Seg - Sáb
  startHour: 9,
  endHour: 18,
  slotDurationMinutes: 45,
  bufferMinutes: 15,
  blackoutDates: []
}));
