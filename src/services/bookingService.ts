import { StorageService } from './storageService';
import { BookingRequest } from '../types';
import { generateUUID } from '../utils/formatters';

export interface CalculatedTimeSlot {
  timeSlot: string;     // e.g. "10:00 - 10:45"
  isAvailable: boolean; // false if already booked or passed
  bookedByClient?: string;
}

export const BookingService = {
  /**
   * Generates calculated time slots for a specific property on a given date.
   */
  getTimeSlotsForDate(propertyId: string, dateStr: string): {
    isBlackedOut: boolean;
    isPastDate: boolean;
    slots: CalculatedTimeSlot[];
  } {
    const today = new Date().toISOString().split('T')[0];
    const isPastDate = dateStr < today;

    const schedule = StorageService.getScheduleForProperty(propertyId);
    const isBlackedOut = schedule.blackoutDates.includes(dateStr);

    if (isPastDate || isBlackedOut) {
      return { isBlackedOut, isPastDate, slots: [] };
    }

    // Check day of week
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    if (!schedule.daysOfWeek.includes(dayOfWeek)) {
      return { isBlackedOut: false, isPastDate: false, slots: [] };
    }

    // Fetch existing active bookings for this property on this date
    const existingBookings = StorageService.getBookings().filter(
      b => b.propertyId === propertyId && b.date === dateStr && b.status !== 'cancelled'
    );

    const slots: CalculatedTimeSlot[] = [];
    const durationMin = schedule.slotDurationMinutes || 45;
    const bufferMin = schedule.bufferMinutes || 15;
    const stepMin = durationMin + bufferMin;

    let currentHour = schedule.startHour || 9;
    let currentMin = 0;

    while (currentHour < (schedule.endHour || 18)) {
      const slotStartH = String(currentHour).padStart(2, '0');
      const slotStartM = String(currentMin).padStart(2, '0');

      let endTotalMin = currentMin + durationMin;
      let endHour = currentHour + Math.floor(endTotalMin / 60);
      let endMin = endTotalMin % 60;

      const slotEndH = String(endHour).padStart(2, '0');
      const slotEndM = String(endMin).padStart(2, '0');

      const timeSlotString = `${slotStartH}:${slotStartM} - ${slotEndH}:${slotEndM}`;

      // Check if occupied
      const existingMatch = existingBookings.find(b => b.timeSlot === timeSlotString);

      // Check if slot has already passed if today
      let isPassedToday = false;
      if (dateStr === today) {
        const now = new Date();
        const currentSlotTime = new Date();
        currentSlotTime.setHours(currentHour, currentMin, 0, 0);
        if (currentSlotTime <= now) {
          isPassedToday = true;
        }
      }

      slots.push({
        timeSlot: timeSlotString,
        isAvailable: !existingMatch && !isPassedToday,
        bookedByClient: existingMatch ? existingMatch.clientName : undefined
      });

      // Advance
      let nextTotalMin = currentMin + stepMin;
      currentHour += Math.floor(nextTotalMin / 60);
      currentMin = nextTotalMin % 60;
    }

    return { isBlackedOut: false, isPastDate: false, slots };
  },

  /**
   * Submits a viewing booking and persists it
   */
  async createBooking(params: {
    propertyId: string;
    propertyTitle: string;
    date: string;
    timeSlot: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
    agentId: string;
  }): Promise<{ success: boolean; booking?: BookingRequest; error?: string }> {
    // Re-verify slot availability to prevent duplicate / race bookings
    const { slots } = this.getTimeSlotsForDate(params.propertyId, params.date);
    const targetSlot = slots.find(s => s.timeSlot === params.timeSlot);

    if (!targetSlot || !targetSlot.isAvailable) {
      return { success: false, error: 'Este horário acabou de ser reservado ou está indisponível. Por favor, escolha outro horário.' };
    }

    const newBooking: BookingRequest = {
      id: generateUUID(),
      propertyId: params.propertyId,
      propertyTitle: params.propertyTitle,
      date: params.date,
      timeSlot: params.timeSlot,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      clientPhone: params.clientPhone,
      notes: params.notes,
      status: 'confirmed',
      agentId: params.agentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await StorageService.saveBooking(newBooking);

    return { success: true, booking: newBooking };
  }
};
