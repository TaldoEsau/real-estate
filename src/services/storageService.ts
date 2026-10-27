import { Property, Agent, AvailabilitySchedule, BookingRequest, NotificationRecord } from '../types';
import { SEED_PROPERTIES, SEED_AGENTS, SEED_SCHEDULES } from '../data/seedProperties';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PROPERTIES: 'aura_properties_v1',
  AGENTS: 'aura_agents_v1',
  SCHEDULES: 'aura_schedules_v1',
  BOOKINGS: 'aura_bookings_v1',
  NOTIFICATIONS: 'aura_notifications_v1',
  SUPABASE_STATUS: 'aura_supabase_status_v1'
};

type Listener = () => void;
const listeners: Listener[] = [];

function notifyListeners() {
  listeners.forEach(l => {
    try { l(); } catch (err) { console.error('Listener error', err); }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

// Local Storage Initializers
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

let currentSupabaseStatus: 'checking' | 'ready' | 'missing_tables' | 'disabled' = isSupabaseConfigured ? 'checking' : 'disabled';

// Ensure initial seed
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    setLocal(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) {
    setLocal(STORAGE_KEYS.AGENTS, SEED_AGENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
    setLocal(STORAGE_KEYS.SCHEDULES, SEED_SCHEDULES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    const sampleBooking: BookingRequest = {
      id: 'book-sample-1',
      propertyId: 'p1111111-1111-1111-1111-111111111111',
      propertyTitle: 'The Bel-Air Skyline Villa',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '14:00 - 14:45',
      clientName: 'Lord Harrison Sterling',
      clientEmail: 'harrison.sterling@sterlingholdings.com',
      clientPhone: '+1 (415) 880-9210',
      notes: 'Interested in primary residence acquisition. Will arrive with family architect.',
      status: 'confirmed',
      agentId: 'a1111111-1111-1111-1111-111111111111',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocal(STORAGE_KEYS.BOOKINGS, [sampleBooking]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  // Check Supabase connectivity and tables
  if (supabase) {
    checkAndSyncSupabase();
  }
}

async function checkAndSyncSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('properties').select('id, title, price, status').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not find')) {
        currentSupabaseStatus = 'missing_tables';
      } else {
        currentSupabaseStatus = 'missing_tables';
      }
    } else {
      currentSupabaseStatus = 'ready';
      // Load cloud properties if any exist in Supabase
      const { data: cloudProps } = await supabase.from('properties').select('*');
      if (cloudProps && cloudProps.length > 0) {
        const mappedProps: Property[] = cloudProps.map((cp: any) => ({
          id: cp.id,
          tenantId: cp.tenant_id,
          code: cp.code || `REF${cp.id.slice(0, 4).toUpperCase()}`,
          title: cp.title,
          slug: cp.slug,
          description: cp.description || '',
          price: Number(cp.price) || 0,
          rentalPrice: Number(cp.rental_price) || 0,
          condoFee: Number(cp.condo_fee) || 0,
          iptuFee: Number(cp.iptu_fee) || 0,
          propertyType: cp.property_type || 'apartment',
          listingType: cp.listing_type || 'for_sale',
          status: cp.status || 'active',
          location: {
            address: cp.address || '',
            number: cp.number,
            neighborhood: cp.neighborhood || '',
            city: cp.city || '',
            state: cp.state || '',
            zipCode: cp.zip_code,
            lat: Number(cp.lat) || -23.55052,
            lng: Number(cp.lng) || -46.633308
          },
          specs: {
            bedrooms: Number(cp.bedrooms) || 1,
            suites: Number(cp.suites) || 0,
            bathrooms: Number(cp.bathrooms) || 1,
            areaSqM: Number(cp.area_sq_m) || Number(cp.area_sq_ft ? Math.round(cp.area_sq_ft / 10.764) : 100),
            areaSqFt: Number(cp.area_sq_ft) || Number(cp.area_sq_m ? Math.round(cp.area_sq_m * 10.764) : 1076),
            yearBuilt: cp.year_built,
            garageSpaces: cp.garage_spaces || 0
          },
          amenities: Array.isArray(cp.amenities) ? cp.amenities : [],
          featuredImage: cp.featured_image || '',
          gallery: Array.isArray(cp.gallery) ? cp.gallery : [cp.featured_image],
          assignedAgentId: cp.assigned_agent_id || 'a1111111-1111-1111-1111-111111111111',
          createdAt: cp.created_at || new Date().toISOString(),
          updatedAt: cp.updated_at || new Date().toISOString()
        }));
        setLocal(STORAGE_KEYS.PROPERTIES, mappedProps);
      }

      // Load cloud bookings if any exist
      const { data: cloudBookings } = await supabase.from('booking_requests').select('*');
      if (cloudBookings && cloudBookings.length > 0) {
        const mappedBookings: BookingRequest[] = cloudBookings.map((cb: any) => ({
          id: cb.id,
          propertyId: cb.property_id,
          propertyTitle: cb.property_title,
          date: cb.date,
          timeSlot: cb.time_slot,
          clientName: cb.client_name,
          clientEmail: cb.client_email,
          clientPhone: cb.client_phone,
          notes: cb.notes,
          status: cb.status,
          agentId: cb.agent_id,
          createdAt: cb.created_at,
          updatedAt: cb.updated_at
        }));
        setLocal(STORAGE_KEYS.BOOKINGS, mappedBookings);
      }
    }
  } catch (err) {
    console.warn('Supabase initialization check:', err);
    currentSupabaseStatus = 'missing_tables';
  }
  notifyListeners();
}

export const StorageService = {
  getSupabaseStatus(): 'checking' | 'ready' | 'missing_tables' | 'disabled' {
    return currentSupabaseStatus;
  },

  async syncAllToSupabase(): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'Supabase client not configured' };

    try {
      // 1. Agents
      const agents = this.getAgents();
      for (const a of agents) {
        await supabase.from('agents').upsert({
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          role: a.role,
          avatar: a.avatar,
          bio: a.bio
        });
      }

      // 2. Properties
      const properties = this.getProperties();
      for (const p of properties) {
        await supabase.from('properties').upsert({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          price: p.price,
          property_type: p.propertyType,
          listing_type: p.listingType,
          status: p.status,
          address: p.location.address,
          city: p.location.city,
          state: p.location.state,
          zip_code: p.location.zipCode,
          lat: p.location.lat,
          lng: p.location.lng,
          bedrooms: p.specs.bedrooms,
          bathrooms: p.specs.bathrooms,
          area_sq_ft: p.specs.areaSqFt,
          amenities: p.amenities,
          featured_image: p.featuredImage,
          gallery: p.gallery,
          assigned_agent_id: p.assignedAgentId
        });
      }

      // 3. Bookings
      const bookings = this.getBookings();
      for (const b of bookings) {
        await supabase.from('booking_requests').upsert({
          id: b.id,
          property_id: b.propertyId,
          property_title: b.propertyTitle,
          date: b.date,
          time_slot: b.timeSlot,
          client_name: b.clientName,
          client_email: b.clientEmail,
          client_phone: b.clientPhone,
          notes: b.notes,
          status: b.status,
          agent_id: b.agentId
        });
      }

      currentSupabaseStatus = 'ready';
      notifyListeners();
      return { success: true, message: `Successfully synchronized ${properties.length} properties and ${bookings.length} bookings to Supabase!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to sync to Supabase' };
    }
  },

  // Properties
  getProperties(): Property[] {
    return getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
  },

  getPropertyById(id: string): Property | undefined {
    return this.getProperties().find(p => p.id === id);
  },

  async saveProperty(property: Property): Promise<void> {
    const properties = this.getProperties();
    const existingIndex = properties.findIndex(p => p.id === property.id);
    if (existingIndex >= 0) {
      properties[existingIndex] = { ...property, updatedAt: new Date().toISOString() };
    } else {
      properties.unshift({
        ...property,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setLocal(STORAGE_KEYS.PROPERTIES, properties);

    // Save directly to Supabase if configured
    if (supabase) {
      try {
        const { error } = await supabase.from('properties').upsert({
          id: property.id,
          title: property.title,
          slug: property.slug,
          description: property.description,
          price: property.price,
          property_type: property.propertyType,
          listing_type: property.listingType,
          status: property.status,
          address: property.location.address,
          city: property.location.city,
          state: property.location.state,
          zip_code: property.location.zipCode,
          lat: property.location.lat,
          lng: property.location.lng,
          bedrooms: property.specs.bedrooms,
          bathrooms: property.specs.bathrooms,
          area_sq_ft: property.specs.areaSqFt,
          amenities: property.amenities,
          featured_image: property.featuredImage,
          gallery: property.gallery,
          assigned_agent_id: property.assignedAgentId
        });
        if (error) {
          console.warn('Supabase property write:', error.message);
        } else {
          currentSupabaseStatus = 'ready';
        }
      } catch (err) {
        console.warn('Supabase property write error:', err);
      }
    }
  },

  archiveProperty(id: string): void {
    const property = this.getPropertyById(id);
    if (property) {
      this.saveProperty({ ...property, status: 'archived' });
    }
  },

  restoreProperty(id: string): void {
    const property = this.getPropertyById(id);
    if (property) {
      this.saveProperty({ ...property, status: 'active' });
    }
  },

  // Agents / Corretores
  getAgents(): Agent[] {
    return getLocal<Agent[]>(STORAGE_KEYS.AGENTS, SEED_AGENTS);
  },

  getAgentById(id: string): Agent | undefined {
    return this.getAgents().find(a => a.id === id);
  },

  async saveAgent(agent: Agent): Promise<void> {
    const agents = this.getAgents();
    const existingIndex = agents.findIndex(a => a.id === agent.id);
    if (existingIndex >= 0) {
      agents[existingIndex] = { ...agent };
    } else {
      agents.unshift({ ...agent });
    }
    setLocal(STORAGE_KEYS.AGENTS, agents);

    if (supabase) {
      try {
        const { error } = await supabase.from('agents').upsert({
          id: agent.id,
          tenant_id: agent.tenantId || 't1111111-1111-1111-1111-111111111111',
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          role: agent.role,
          creci: agent.creci || null,
          avatar: agent.avatar,
          bio: agent.bio || '',
          social_links: agent.socialLinks || {},
          is_active: agent.isActive !== false
        });
        if (error) console.warn('Supabase agent write error:', error.message);
      } catch (err) {
        console.warn('Supabase agent write exception:', err);
      }
    }
  },

  async deleteAgent(id: string): Promise<void> {
    const agents = this.getAgents();
    const filtered = agents.filter(a => a.id !== id);
    setLocal(STORAGE_KEYS.AGENTS, filtered);

    if (supabase) {
      try {
        await supabase.from('agents').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase agent delete error:', err);
      }
    }
  },

  async toggleAgentStatus(id: string): Promise<void> {
    const agent = this.getAgentById(id);
    if (agent) {
      const updated = { ...agent, isActive: agent.isActive === false ? true : false };
      await this.saveAgent(updated);
    }
  },

  // Schedules
  getSchedules(): AvailabilitySchedule[] {
    return getLocal<AvailabilitySchedule[]>(STORAGE_KEYS.SCHEDULES, SEED_SCHEDULES);
  },

  getScheduleForProperty(propertyId: string): AvailabilitySchedule {
    const schedules = this.getSchedules();
    const found = schedules.find(s => s.propertyId === propertyId);
    if (found) return found;

    return {
      id: `sched-${propertyId}`,
      propertyId,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startHour: 9,
      endHour: 18,
      slotDurationMinutes: 45,
      bufferMinutes: 15,
      blackoutDates: []
    };
  },

  saveSchedule(schedule: AvailabilitySchedule): void {
    const schedules = this.getSchedules();
    const idx = schedules.findIndex(s => s.propertyId === schedule.propertyId);
    if (idx >= 0) {
      schedules[idx] = schedule;
    } else {
      schedules.push(schedule);
    }
    setLocal(STORAGE_KEYS.SCHEDULES, schedules);
  },

  toggleBlackoutDate(propertyId: string, date: string): void {
    const sched = this.getScheduleForProperty(propertyId);
    const hasDate = sched.blackoutDates.includes(date);
    const newDates = hasDate 
      ? sched.blackoutDates.filter(d => d !== date)
      : [...sched.blackoutDates, date];
    this.saveSchedule({ ...sched, blackoutDates: newDates });
  },

  // Bookings
  getBookings(): BookingRequest[] {
    return getLocal<BookingRequest[]>(STORAGE_KEYS.BOOKINGS, []);
  },

  async saveBooking(booking: BookingRequest): Promise<void> {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
      bookings[idx] = { ...booking, updatedAt: new Date().toISOString() };
    } else {
      bookings.unshift({
        ...booking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setLocal(STORAGE_KEYS.BOOKINGS, bookings);

    // Write directly to Supabase booking_requests table
    if (supabase) {
      try {
        const { error } = await supabase.from('booking_requests').upsert({
          id: booking.id,
          property_id: booking.propertyId,
          property_title: booking.propertyTitle,
          date: booking.date,
          time_slot: booking.timeSlot,
          client_name: booking.clientName,
          client_email: booking.clientEmail,
          client_phone: booking.clientPhone,
          notes: booking.notes,
          status: booking.status,
          agent_id: booking.agentId
        });
        if (error) {
          console.warn('Supabase booking write:', error.message);
        } else {
          currentSupabaseStatus = 'ready';
        }
      } catch (err) {
        console.warn('Supabase booking write error:', err);
      }
    }
  },

  updateBookingStatus(bookingId: string, status: BookingRequest['status']): void {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      booking.updatedAt = new Date().toISOString();
      this.saveBooking(booking);
    }
  },

  // Notifications
  getNotifications(): NotificationRecord[] {
    return getLocal<NotificationRecord[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  async addNotification(notification: NotificationRecord): Promise<void> {
    const list = this.getNotifications();
    list.unshift(notification);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, list);

    if (supabase) {
      try {
        const { error } = await supabase.from('notification_records').upsert({
          id: notification.id,
          booking_id: notification.bookingId,
          recipient_role: notification.recipientRole,
          recipient_email: notification.recipientEmail,
          subject: notification.subject,
          type: notification.type,
          content_html: notification.contentHtml,
          sent_at: notification.sentAt,
          status: notification.status
        });
        if (error) console.warn('Supabase notification record write:', error.message);
      } catch (err) {
        console.warn('Supabase notification record write error:', err);
      }
    }
  },

  markNotificationOpened(id: string): void {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.status = 'opened';
      setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  // Reset to original clean state
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.AGENTS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    initializeStorage();
    notifyListeners();
  }
};

// Initialize immediately
initializeStorage();
