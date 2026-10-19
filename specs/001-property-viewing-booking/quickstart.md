# Quickstart Validation Guide: Real Estate Property Viewing & Booking System

**Feature**: `001-property-viewing-booking`  
**Date**: 2026-10-19  
**Status**: Ready  

---

## 1. Prerequisites & Environment Setup

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (included with Node.js)
- **Modern Browser**: Chrome, Edge, Safari, or Firefox

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Launch the development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 2. End-to-End Validation Scenarios

### Scenario 1: Visitor Property Search & Filtering
1. Open the homepage (`/` or catalog view).
2. Use the search bar to enter `"Downtown"` or select `"Villa"` from the Property Type dropdown.
3. Adjust the Price Range slider or input (e.g., Min: `$500,000`, Max: `$2,000,000`).
4. **Expected Outcome**: The property grid updates instantly without full page reloads, displaying only matching properties. Filter tag chips indicate active filters.

### Scenario 2: Property Inspection & Viewing Booking
1. Click on any property card (e.g., *"The Bel-Air Skyline Villa"*).
2. In the Property Detail view, browse through the photo gallery carousel, inspect specifications (bedrooms, bathrooms, sq ft), and observe the location map pin.
3. Scroll to the **"Book an In-Person Viewing"** panel.
4. Select a future date from the interactive date selector (notice blackout dates are grayed out).
5. Choose an available time slot (e.g., `14:00 - 14:45`).
6. Enter contact details:
   - Name: `Jane Doe`
   - Email: `jane.doe@example.com`
   - Phone: `+1 (555) 234-5678`
7. Click **"Confirm Viewing Request"**.
8. **Expected Outcome**:
   - A success confirmation modal displays with booking reference ID, summary, and "Add to Google Calendar" / "Download .ics" buttons.
   - The selected slot immediately switches to occupied/unavailable if the booking form is reopened.

### Scenario 3: Email Notification Simulation & Verification
1. Click the **"Notifications"** bell icon in the top header.
2. Observe two newly generated notification records:
   - Client notification: *"Viewing Confirmed: The Bel-Air Skyline Villa"* with pre-viewing reminder instructions.
   - Agent notification: *"New Viewing Request from Jane Doe"*.
3. Click on either notification to preview the responsive HTML email template.
4. **Expected Outcome**: Validates that transactional email requirements are completely fulfilled.

### Scenario 4: Admin Portal & Inventory Management
1. Click the **"Admin Portal"** button in the header/navigation bar (or navigate to `/admin`).
2. In the **"Properties"** tab, click **"Add New Listing"**.
3. Fill in title, price, bedrooms, bathrooms, sq ft, city, address, and upload/paste image URLs.
4. Click **"Save Listing"**.
5. **Expected Outcome**: The new property appears in the admin table and is immediately visible on the public catalog.
6. Test archiving: Click **"Archive"** on any property; verify it disappears from public search while remaining visible in the admin archived filter.

### Scenario 5: Booking Management, Slot Blocking & CSV Export
1. In the Admin Portal, switch to the **"Bookings"** tab.
2. Locate the booking made in Scenario 2 (`Jane Doe`).
3. Click the status dropdown and change from `Pending` or `Confirmed` to `Rescheduled` or `Cancelled`.
4. Switch to the **"Availability & Blackouts"** tab:
   - Select a property and pick tomorrow's date to **"Block Date"**.
   - Verify on the public property page that tomorrow is now disabled on the booking calendar.
5. In the Bookings tab, click **"Export Bookings (CSV)"**.
6. **Expected Outcome**: A `.csv` file downloads immediately with all booking records, formatted headers, and accurate customer information.
