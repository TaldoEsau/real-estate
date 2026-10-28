// Core Application Types - Multi-tenant SaaS

export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface TenantAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface TenantSocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  customDomain?: string;
  name: string;
  legalName?: string;
  documentNumber?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: TenantAddress;
  planTier: PlanTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutBannerUrl?: string;
  socialLinks: TenantSocialLinks;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'house' | 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'commercial' | 'land';
export type ListingType = 'for_sale' | 'for_rent' | 'both';
export type PropertyStatus = 'draft' | 'active' | 'rented' | 'sold' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';

export interface PropertyCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}

export interface Agent {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  creci?: string;
  avatar: string;
  bio: string;
  socialLinks?: {
    instagram?: string;
    whatsapp?: string;
  };
  isActive?: boolean;
}

export interface PropertyLocation {
  address: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  lat: number;
  lng: number;
  mapQuery?: string;
  useExactCoords?: boolean;
  isLocationConfirmed?: boolean;
}

export interface PropertySpecs {
  bedrooms: number;
  suites?: number;
  bathrooms: number;
  areaSqM?: number;
  areaSqFt: number;
  yearBuilt?: number;
  garageSpaces?: number;
}

export interface PropertyImage {
  id: string;
  tenantId?: string;
  propertyId: string;
  url: string;
  caption?: string;
  displayOrder: number;
}

export interface Property {
  id: string;
  tenantId?: string;
  code?: string;                          // Código de referência do imóvel (ex: AP102)
  title: string;
  slug: string;
  description: string;
  categoryId?: string;
  price: number;                          // Preço de venda
  rentalPrice?: number;                   // Valor de aluguel/mês
  condoFee?: number;                      // Condomínio
  iptuFee?: number;                       // IPTU
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  location: PropertyLocation;
  specs: PropertySpecs;
  amenities: string[];
  featuredImage: string;
  gallery: string[];
  assignedAgentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySchedule {
  id: string;
  tenantId?: string;
  propertyId: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  startHour: number;    // e.g. 9
  endHour: number;      // e.g. 18
  slotDurationMinutes: number; // 45
  bufferMinutes: number;       // 15
  blackoutDates: string[];     // YYYY-MM-DD
}

export interface PropertyBlackoutDate {
  id: string;
  tenantId?: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export type LeadType = 'property_inquiry' | 'general_contact' | 'report_error' | 'schedule_visit';
export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'won' | 'lost';

export interface Lead {
  id: string;
  tenantId: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyCode?: string;
  leadType: LeadType;
  name: string;
  email: string;
  phone: string;
  message?: string;
  details?: Record<string, any>;
  status: LeadStatus;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  tenantId?: string;
  propertyId: string;
  propertyTitle: string;
  date: string;         // YYYY-MM-DD
  timeSlot: string;     // e.g. "14:00 - 14:45"
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: BookingStatus;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  tenantId?: string;
  bookingId?: string;
  leadId?: string;
  recipientRole: 'client' | 'agent' | 'admin';
  recipientEmail: string;
  subject: string;
  type: 'confirmation' | 'reminder' | 'agent_alert' | 'status_change' | 'lead_received';
  contentHtml: string;
  sentAt: string;
  status: 'delivered' | 'opened';
}

export interface PropertyFilterState {
  searchQuery: string;
  code?: string;
  state?: string;
  city: string;
  neighborhood?: string;
  propertyType: string;
  transactionType?: 'all' | 'for_sale' | 'for_rent';
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minSuites?: number;
  minBathrooms?: number;
  minGarageSpaces?: number;
  minAreaSqM?: number;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'area_desc';
}

export interface AdminUser {
  id: string;
  tenantId: string;
  username: string;
  name: string;
  role: 'owner' | 'admin' | 'manager';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
}

