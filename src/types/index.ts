// Core Application Types

export type PropertyType = 'house' | 'apartment' | 'villa' | 'penthouse' | 'townhouse';
export type ListingType = 'for_sale' | 'for_rent';
export type PropertyStatus = 'active' | 'archived' | 'sold';
export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  lat: number;
  lng: number;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  yearBuilt?: number;
  garageSpaces?: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
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
  propertyId: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  startHour: number;    // e.g. 9
  endHour: number;      // e.g. 18
  slotDurationMinutes: number; // 45
  bufferMinutes: number;       // 15
  blackoutDates: string[];     // YYYY-MM-DD
}

export interface BookingRequest {
  id: string;
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
  bookingId: string;
  recipientRole: 'client' | 'agent';
  recipientEmail: string;
  subject: string;
  type: 'confirmation' | 'reminder' | 'agent_alert' | 'status_change';
  contentHtml: string;
  sentAt: string;
  status: 'delivered' | 'opened';
}

export interface PropertyFilterState {
  searchQuery: string;
  city: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'area_desc';
}
