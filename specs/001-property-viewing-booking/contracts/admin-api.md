# Interface Contract: Administrative Management Interface

**Feature**: `001-property-viewing-booking`  
**Date**: 2026-10-19  
**Status**: Ready  

---

## 1. Property Inventory Management Contracts

### `createProperty(data)`
- **Input**: Omit `id`, `createdAt`, `updatedAt` from `Property`.
- **Validation**: Title required, price > 0, at least 1 image URL provided.
- **Output**: Newly created `Property` with assigned ID and active status.

### `updateProperty(id, partialData)`
- **Input**: `id: string`, `partialData: Partial<Property>`.
- **Output**: Updated `Property` entity.

### `archiveProperty(id)`
- **Input**: `id: string`.
- **Output**: `Property` entity with `status = 'archived'`. (Preserves all related past and upcoming bookings).

---

## 2. Viewing Availability & Blackout Configuration

### `updatePropertySchedule(propertyId, scheduleConfig)`
- **Input**:
  ```typescript
  interface UpdateSchedulePayload {
    propertyId: string;
    daysOfWeek: number[];       // e.g. [1, 2, 3, 4, 5, 6]
    startHour: number;          // e.g. 9
    endHour: number;            // e.g. 18
    slotDurationMinutes: number;// 45
    bufferMinutes: number;      // 15
    blackoutDates: string[];    // ['2026-11-26', '2026-12-25']
  }
  ```
- **Output**: Updated `AvailabilitySchedule` entity.

---

## 3. Booking Request Management

### `getAllBookings(filters)`
- **Input**:
  ```typescript
  interface AdminBookingFilters {
    status?: 'all' | 'confirmed' | 'pending' | 'rescheduled' | 'cancelled';
    propertyId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;       // Matches client name, email, or property title
  }
  ```
- **Output**: `BookingRequest[]` ordered by appointment date/time descending.

### `updateBookingStatus(bookingId, newStatus, reason?)`
- **Input**:
  - `bookingId: string`
  - `newStatus: 'confirmed' | 'rescheduled' | 'cancelled'`
  - `reason?: string`
- **Side Effect**: Generates automated client and agent status change notifications.
- **Output**: Updated `BookingRequest` entity.

---

## 4. CSV Export Contract

### `exportBookingsCsv(filters)`
- **Input**: `AdminBookingFilters`
- **Output**: RFC 4180 CSV blob with UTF-8 encoding.
- **Header Structure**:
  ```csv
  Booking ID,Property Title,Client Name,Client Email,Client Phone,Appointment Date,Time Slot,Status,Assigned Agent,Booking Created At
  ```
- **Output Format**: Browser download trigger with filename format `viewing-bookings-YYYY-MM-DD.csv`.
