import { Property, Agent, AvailabilitySchedule } from '../types';

export const SEED_AGENTS: Agent[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Alexandra Vance',
    email: 'alexandra.vance@auraestates.com',
    phone: '+1 (310) 849-2201',
    role: 'Senior Luxury Specialist & Partner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'With over 12 years of luxury residential expertise across Bel-Air and Beverly Hills, Alexandra pairs high discretion with curated bespoke advisory.'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Julian Montgomery',
    email: 'julian.m@auraestates.com',
    phone: '+1 (212) 650-8840',
    role: 'Principal Architectural Advisor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    bio: 'Former architectural designer specializing in Manhattan penthouses, historic brownstones, and waterfront modern estates.'
  }
];

export const SEED_PROPERTIES: Property[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    title: 'The Bel-Air Skyline Villa',
    slug: 'the-bel-air-skyline-villa',
    description: 'An architectural tour de force commanding uncompromised panoramic ocean and city views. Designed with seamless indoor-outdoor flow, a 60-foot zero-edge infinity pool, temperature-regulated wine gallery, and state-of-the-art Lutron smart automation.',
    price: 4250000,
    propertyType: 'villa',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: '10842 Bellagio Road',
      city: 'Bel-Air',
      state: 'CA',
      zipCode: '90077',
      lat: 34.0837,
      lng: -118.4447
    },
    specs: {
      bedrooms: 5,
      bathrooms: 6,
      areaSqFt: 6850,
      yearBuilt: 2023,
      garageSpaces: 3
    },
    amenities: [
      'Infinity Pool',
      'Wine Cellar',
      'Smart Home Automation',
      'Private Cinema',
      'Panoramic Ocean View',
      'Chef Kitchen',
      'Spa & Sauna'
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
    title: 'Tribeca Light Duplex Penthouse',
    slug: 'tribeca-light-duplex-penthouse',
    description: 'Suspended high above Tribeca cobblestone streets, this dramatic duplex penthouse features 22-foot double-height ceilings, private keyed elevator access, custom Boffi kitchen, and a private 1,200 sq ft wrap-around rooftop terrace.',
    price: 3800000,
    propertyType: 'penthouse',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: '68 Franklin Street',
      city: 'Tribeca',
      state: 'NY',
      zipCode: '10013',
      lat: 40.7183,
      lng: -74.0048
    },
    specs: {
      bedrooms: 3,
      bathrooms: 3.5,
      areaSqFt: 4100,
      yearBuilt: 2022,
      garageSpaces: 1
    },
    amenities: [
      'Private Rooftop Terrace',
      'Doorman 24/7',
      'Fireplace',
      'Private Keyed Elevator',
      'Boffi Italian Kitchen',
      'Wine Display'
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
    title: 'The Modernist Beverly Hills Residence',
    slug: 'the-modernist-beverly-hills-residence',
    description: 'A serene architectural sanctuary with Japanese-inspired courtyard gardens, floor-to-ceiling sliding glass, limestone flooring, and an ultra-private primary wing with an outdoor terrazzo soaking tub.',
    price: 2950000,
    propertyType: 'house',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: '9410 Loma Vista Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      lat: 34.0736,
      lng: -118.4004
    },
    specs: {
      bedrooms: 4,
      bathrooms: 4.5,
      areaSqFt: 5200,
      yearBuilt: 2021,
      garageSpaces: 2
    },
    amenities: [
      'Zen Courtyard',
      'Outdoor Soaking Tub',
      'Guest House',
      'Solar Energy System',
      'Gourmet Island Kitchen',
      'Security System'
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
    title: 'Downtown Miami Glass Waterfront Residence',
    slug: 'downtown-miami-waterfront-residence',
    description: 'Immerse in azure Biscayne Bay views from this elevated modern condo featuring a wide cantilevered terrace, marble island, subzero appliances, private marina slip access, and 5-star concierge amenities.',
    price: 1850000,
    propertyType: 'apartment',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: '1000 Brickell Plaza',
      city: 'Miami',
      state: 'FL',
      zipCode: '33131',
      lat: 25.7617,
      lng: -80.1918
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2.5,
      areaSqFt: 2250,
      yearBuilt: 2023,
      garageSpaces: 2
    },
    amenities: [
      'Marina Access',
      'Bay Views',
      'Rooftop Lap Pool',
      'Valet Parking',
      'Fitness & Wellness Center'
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
    title: 'West Village Historic Brick Townhouse',
    slug: 'west-village-historic-townhouse',
    description: 'A landmark four-story red brick townhouse meticulously reconstructed with herringbone white oak floors, wood-burning fireplaces, custom steel casement garden doors, and a lush private landscaped garden.',
    price: 5400000,
    propertyType: 'townhouse',
    listingType: 'for_sale',
    status: 'active',
    location: {
      address: '28 Perry Street',
      city: 'West Village',
      state: 'NY',
      zipCode: '10014',
      lat: 40.7359,
      lng: -74.0028
    },
    specs: {
      bedrooms: 4,
      bathrooms: 4,
      areaSqFt: 4600,
      yearBuilt: 2020,
      garageSpaces: 0
    },
    amenities: [
      'Private Landscaped Garden',
      'Wood-Burning Fireplaces',
      'Wine Cellar',
      'Custom Millwork',
      'Primary Suite Terrace'
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
  daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
  startHour: 9,
  endHour: 18,
  slotDurationMinutes: 45,
  bufferMinutes: 15,
  blackoutDates: []
}));
