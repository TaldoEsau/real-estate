# Interface Contract: Visitor Client Interface

**Feature**: `001-property-viewing-booking`  
**Date**: 2026-10-19  
**Status**: Ready  

---

## 1. Property Catalog Search & Filter Contract

### Function / Endpoint: `getProperties(filters)`

#### Input Parameters
```typescript
interface PropertyCatalogFilters {
  searchQuery?: string;         // Keyword matching title, description, city, address
  city?: string;                // Specific city/neighborhood
  propertyType?: string;        // 'all' | 'house' | 'apartment' | 'villa' | 'penthouse' | 'townhouse'
  minPrice?: number;            // Minimum USD price filter
  maxPrice?: number;            // Maximum USD price filter
  minBedrooms?: number;         // Minimum bedroom count
  minAreaSqFt?: number;         // Minimum interior square footage
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'area_desc';
}
```

#### Output
```typescript
interface PropertyCatalogResult {
  total: number;
  properties: PropertySummary[];
}

interface PropertySummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  propertyType: string;
  listingType: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  featuredImage: string;
  status: 'active' | 'archived' | 'sold';
}
```

---

## 2. Property Detail Query Contract

### Function / Endpoint: `getPropertyById(id)`

#### Input
`id: string`

#### Output
Complete `Property` entity object including full `gallery`, `amenities`, assigned `Agent` details, and interactive `location` coordinates.

---

## 3. Available Viewing Slots Contract

### Function / Endpoint: `getAvailableViewingSlots(propertyId, date)`

#### Input
- `propertyId: string`
- `date: string` (`YYYY-MM-DD`)

#### Output
```typescript
interface DailyViewingAvailability {
  date: string;
  isBlackedOut: boolean;
  slots: ViewingTimeSlot[];
}

interface ViewingTimeSlot {
  timeSlot: string;         // e.g. "10:00 - 10:45"
  isAvailable: boolean;     // False if booked or blocked
  bookedBookingId?: string; // Internal reference if occupied
}
```

---

## 4. Booking Submission Contract

### Function / Endpoint: `submitViewingBooking(payload)`

#### Input
```typescript
interface BookingSubmissionPayload {
  propertyId: string;
  date: string;             // "YYYY-MM-DD"
  timeSlot: string;         // "14:00 - 14:45"
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}
```

#### Validation & Logic
1. Re-validates that `(propertyId, date, timeSlot)` has zero existing active bookings.
2. Creates `BookingRequest` record with status `'confirmed'`.
3. Creates customer `NotificationRecord` (Booking Confirmation & Viewing Reminder).
4. Creates agent `NotificationRecord` (New Appointment Alert).

#### Output (Success)
```typescript
interface BookingConfirmationResult {
  success: true;
  booking: BookingRequest;
  confirmationCode: string;
  calendarLinks: {
    googleCalendarUrl: string;
    icsDataUrl: string;
  };
}
```

#### Output (Error)
```typescript
interface BookingErrorResult {
  success: false;
  errorCode: 'SLOT_ALREADY_BOOKED' | 'INVALID_INPUT' | 'DATE_IN_PAST';
  message: string;
}
```
