# Research & Architecture Decisions: Real Estate Property Viewing & Booking System

**Feature**: `001-property-viewing-booking`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## 1. Application Architecture & Tech Stack

### Decision
Build as a modern, high-performance **React + Vite single-page application (SPA)** with a modular architecture and an encapsulated Storage & Event Service layer, styled with a custom **luxury design system in Vanilla CSS**.

### Rationale
- **Job Posting Match**: The client specified: *"We’re open to your recommendation: a custom build (e.g., React/Next.js + backend) or a CMS like WordPress with a solid booking setup. Tell us what you’d choose and why."* Recommending React provides complete design freedom, zero plugin bloat, instant real-time slot selection, and seamless responsiveness on mobile.
- **Portfolio Demonstration Goal**: The user emphasized this is a showcase/demo project to win the job. Vite + React allows immediate local launch (`npm run dev`), zero complex backend deployment prerequisites, and ultra-smooth, instant transitions.
- **Rich Aesthetics**: Vanilla CSS design system provides complete control over bespoke luxury real estate branding (deep obsidian/navy `#0B132B`, warm champagne gold `#C5A880`, subtle glassmorphism cards, and refined typography like *Plus Jakarta Sans* and *Cinzel*/*Playfair Display*).

### Alternatives Considered
- **WordPress + Booking Plugins (e.g., Amelia / Bookly)**: Rejected due to rigid templating, heavier load times on mobile, brittle plugin updates, and lower visual differentiation for a portfolio showcase.
- **Full-stack Next.js with Node/Postgres Server**: Evaluated; while ideal for production multi-tenant enterprise scale, for this standalone applicant showcase, client-side state with an abstracted service layer delivers identical UI/UX fidelity with zero server setup friction for the interviewer.

---

## 2. Viewing Availability & Slot Allocation Logic

### Decision
Implement a deterministic **Time-Slot Engine** with 45-minute viewing windows, 15-minute cleaning/travel buffers, and rule-based availability:
- **Default Availability Schedule**: Monday–Saturday from 09:00 to 18:00.
- **Capacity**: Strict 1 booking per slot per property (prevents race conditions and double-booking).
- **Blackout System**: Support for per-property date blackouts (e.g., holidays, owner unavailable) and custom time blocks.
- **Dynamic Slot Generation**: Slots are calculated dynamically from property schedule rules and reconciled against active `BookingRequest` records (`status != 'cancelled'`).

### Rationale
- Eliminates manual slot creation overhead for agents while giving fine-grained blackout control.
- Automatically handles date borders, weekends, and buffer periods without backend latency.

### Alternatives Considered
- **Static hardcoded slot lists**: Rejected because editing schedules would require code modifications rather than intuitive admin controls.
- **External Google Calendar OAuth sync directly**: Evaluated; while calendar sync is a nice-to-have, integrating live OAuth credentials in a shared portfolio repo creates auth barrier for reviewers. Instead, we provide immediate `.ics` calendar invite downloads + one-click Google Calendar web links alongside CSV export.

---

## 3. Data Persistence & State Architecture

### Decision
Implement a **Repository Pattern (`StorageService`)** backed by reactive `localStorage` and pre-seeded with realistic, high-end real estate listings, agent profiles, and demo bookings.

### Rationale
- Immediate out-of-the-box readiness: anyone opening the project sees rich luxury properties with complete photo galleries, real specs, and active viewing calendars.
- Any admin actions (creating a listing, blocking dates, confirming bookings) persist across page reloads and browser sessions.
- A "Reset Demo Data" action in the admin footer allows resetting to initial state at any moment.

### Alternatives Considered
- **In-memory only**: Rejected because refreshing the browser would wipe out newly created listings or booking submissions during user testing.
- **External Mock API (JSON-Server / MockAPI)**: Rejected because it requires running a secondary process or depending on external network availability.

---

## 4. Notifications & Confirmation Simulation

### Decision
Implement a dual-layer **Notification & Audit Engine**:
1. **Visual Instant Confirmation Modal**: On booking submission, display a rich reservation summary with booking reference, calendar shortcut (.ics / Google Calendar link), and agent details.
2. **Interactive Notification Drawer & Email Preview**: An in-app Notification Center simulates email dispatches to both the client ("Booking Confirmation & Viewing Reminder") and the assigned agent ("New Viewing Request Alert"). Users can click to open and view the fully formatted responsive HTML email templates.

### Rationale
- Proves end-to-end fulfillment of the job requirements ("Instant confirmation by email, plus reminder before viewing, and email notification to assigned agent") without requiring paid third-party transactional email API keys (SendGrid/Resend) during evaluation.

### Alternatives Considered
- **Real SMTP via backend**: Requires user to supply environment variables and credentials before the demo can function, increasing evaluation drop-off.

---

## 5. CSV Export Architecture

### Decision
Implement a client-side RFC 4180-compliant **CSV Generator & Blob Exporter**.

### Rationale
- Generates and downloads structured `.csv` files directly in the browser with columns: `Booking ID`, `Property Title`, `Client Name`, `Email`, `Phone`, `Date`, `Time Slot`, `Status`, `Agent`, `Created Date`.
- Fully responsive, instant, and works offline without server roundtrips.
