# Tasks: Real Estate Property Viewing & Booking System

**Input**: Design documents from `specs/001-property-viewing-booking/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/visitor-api.md`, `contracts/admin-api.md`  

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier (`[US1]` through `[US6]`)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain, and design tokens

- [X] T001 Initialize React + Vite project with TypeScript configuration in `package.json` and `tsconfig.json`
- [X] T002 [P] Install core runtime dependencies (`@supabase/supabase-js`, Lucide icons, Canvas-confetti) in `package.json`
- [X] T003 [P] Implement core luxury design system tokens, typography, CSS reset, and color themes in `src/styles/index.css`
- [X] T004 [P] Implement reusable atomic UI component styles (buttons, inputs, cards, badges, modals) in `src/styles/components.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, repositories, persistence, and seed luxury inventory

**⚠️ CRITICAL**: Must complete before user story feature development begins

- [X] T005 [P] Define core TypeScript interfaces (`Property`, `Agent`, `AvailabilitySchedule`, `BookingRequest`, `NotificationRecord`) in `src/types/index.ts`
- [X] T006 [P] Create seed dataset of realistic luxury properties, agent profiles, and initial schedules in `src/data/seedProperties.ts`
- [X] T007 Implement Supabase client with reactive LocalStorage fallback in `src/services/supabaseClient.ts` and `src/services/storageService.ts`
- [X] T008 [P] Implement date/time and currency utility functions in `src/utils/formatters.ts`
- [X] T009 Build global application shell layout with responsive navigation header and footer in `src/components/common/Navbar.tsx`

**Checkpoint**: Foundation ready - visitor and admin features can now be implemented.

---

## Phase 3: User Story 1 - Property Discovery and Detailed Inspection (Priority: P1) 🎯 MVP

**Goal**: Visitors can search, filter, and inspect luxury properties with photo galleries, specifications, and map views.  
**Independent Test**: Filter properties by city, price range, and bedrooms; open any property page; verify photos, specs, and map location render correctly.

- [X] T010 [P] [US1] Build reactive filter bar component with location, price range, property type, and bedroom controls in `src/components/visitor/FilterBar.tsx`
- [X] T011 [P] [US1] Build luxury property preview card component with key badges and specifications in `src/components/visitor/PropertyCard.tsx`
- [X] T012 [US1] Build property catalog grid with active filter chips, sort controls, and empty-state messaging in `src/components/visitor/PropertyCatalog.tsx`
- [X] T013 [P] [US1] Build interactive photo gallery carousel with thumbnail navigation and full-screen lightbox in `src/components/visitor/PhotoGallery.tsx`
- [X] T014 [P] [US1] Build property location map view component with coordinate pin and neighborhood context in `src/components/visitor/PropertyMap.tsx`
- [X] T015 [US1] Build full property detail page view integrating overview, specifications, gallery, agent bio, and map in `src/pages/PropertyDetailPage.tsx`

**Checkpoint**: User Story 1 delivers an independent, viable MVP for browsing and inspecting properties.

---

## Phase 4: User Story 2 - Self-Service Viewing Slot Booking (Priority: P1)

**Goal**: Visitors can select open viewing dates and 45-minute time slots, submit contact info, and get instant visual confirmation.  
**Independent Test**: Navigate to a property detail page, pick an available slot, submit the booking form, and verify instant confirmation and slot locking.

- [X] T016 [US2] Implement viewing slot calculation engine and availability validation in `src/services/bookingService.ts`
- [X] T017 [P] [US2] Build interactive date picker and viewing slot selector with disabled past/blackout dates in `src/components/booking/SlotPickerCalendar.tsx`
- [X] T018 [P] [US2] Build visitor contact submission form with input validation (name, email, phone) in `src/components/booking/BookingForm.tsx`
- [X] T019 [US2] Build booking confirmation receipt modal with reference ID, summary, and "Add to Calendar" links in `src/components/booking/ConfirmationReceipt.tsx`
- [X] T020 [US2] Implement notification simulation service creating client confirmation and agent alert records in `src/services/notificationService.ts`
- [X] T021 [US2] Integrate the complete viewing booking workflow into `src/pages/PropertyDetailPage.tsx`

**Checkpoint**: Visitors can book viewings end-to-end with immediate visual feedback and zero double-booking risk.

---

## Phase 5: User Story 3 - Admin Listing Lifecycle Management (Priority: P2)

**Goal**: Agency staff can create new listings, edit existing properties, and archive sold/inactive listings.  
**Independent Test**: Open admin portal, create a new property listing with images and specs, verify it appears on the public catalog, edit price, and archive it.

- [X] T022 [P] [US3] Build admin dashboard layout with navigation tabs and stats summary in `src/pages/AdminDashboardPage.tsx`
- [X] T023 [P] [US3] Build property inventory management table with status filtering and action menus in `src/components/admin/PropertyInventoryTable.tsx`
- [X] T024 [US3] Build property creation and editing modal form with validation and image URL inputs in `src/components/admin/PropertyFormModal.tsx`
- [X] T025 [US3] Implement listing archiving and restoration actions with status toggle logic in `src/components/admin/PropertyInventoryTable.tsx`

**Checkpoint**: Administrators can manage the full lifecycle of real estate inventory without developer assistance.

---

## Phase 6: User Story 4 - Agent Schedule & Booking Request Management (Priority: P2)

**Goal**: Agents can view all booking requests, change appointment status (confirm/reschedule/cancel), and configure viewing availability/blackouts.  
**Independent Test**: Open the booking management tab, change a booking status, block an upcoming date, and verify the public booking calendar updates instantly.

- [X] T026 [P] [US4] Build centralized booking requests management table with status filters and search in `src/components/admin/BookingTable.tsx`
- [X] T027 [US4] Implement booking status transition handlers (confirm, reschedule, cancel) with automated notification triggers in `src/components/admin/BookingTable.tsx`
- [X] T028 [P] [US4] Build availability and blackout schedule manager for blocking specific dates per property in `src/components/admin/AvailabilityManager.tsx`
- [X] T029 [US4] Build in-app Notification Center drawer and simulated HTML email template previewer in `src/components/notifications/NotificationDrawer.tsx`

**Checkpoint**: Agents have complete control over appointments, blackout schedules, and client communication logs.

---

## Phase 7: User Story 5 - Booking Export and Calendar Sync (Priority: P3)

**Goal**: Administrators can export booking records to RFC 4180 CSV and download `.ics` calendar events.  
**Independent Test**: Click "Export Bookings (CSV)" in the admin portal and verify a structured `.csv` file downloads immediately with all booking records.

- [X] T030 [P] [US5] Implement RFC 4180 CSV export generator and browser download trigger in `src/services/exportService.ts`
- [X] T031 [P] [US5] Implement iCalendar (`.ics`) file generation and Google Calendar URL builder in `src/services/calendarService.ts`
- [X] T032 [US5] Add CSV Export button and date-range filter trigger to `src/components/admin/BookingTable.tsx`

**Checkpoint**: Booking data can be exported to external spreadsheets and synchronized with agent calendars.

---

## Phase 8: User Story 6 - Saved Favorite Properties (Priority: P3)

**Goal**: Visitors can bookmark favorite listings and review their shortlisted properties anytime.  
**Independent Test**: Click the bookmark icon on multiple listings, open the saved properties drawer, and verify saved listings persist.

- [X] T033 [P] [US6] Implement favorites state context and persistence in `src/context/FavoritesContext.tsx`
- [X] T034 [P] [US6] Add favorite toggle button with animation to `src/components/visitor/PropertyCard.tsx`
- [X] T035 [US6] Build slide-over saved properties drawer with quick-navigation and remove actions in `src/components/visitor/SavedPropertiesDrawer.tsx`

**Checkpoint**: Prospective buyers can easily shortlist and compare favorite properties across sessions.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: High-fidelity visual polish, mobile responsiveness audit, SEO tags, and demo data reset

- [X] T036 [P] Implement responsive mobile navigation drawer and touch-friendly controls in `src/components/common/Navbar.tsx`
- [X] T037 [P] Add page meta tags, OpenGraph previews, and clean page titles in `index.html` and `src/App.tsx`
- [X] T038 Add "Reset Demo Data" action and quick admin mode toggle in `src/components/common/DemoControls.tsx`
- [X] T039 [P] Polish subtle hover micro-animations, glassmorphism shadows, and smooth transitions in `src/styles/index.css`
- [X] T040 Execute end-to-end quickstart scenarios per `specs/001-property-viewing-booking/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup (Phase 1)**: Can start immediately.
2. **Foundational (Phase 2)**: Depends on Setup (Phase 1) — **BLOCKS all user stories**.
3. **User Story 1 & 2 (Phases 3 & 4)**: Can proceed in sequence or parallel once Foundation is complete.
4. **Admin Stories 3 & 4 (Phases 5 & 6)**: Depend on Foundation and core Booking Service.
5. **Export & Favorites (Phases 7 & 8)**: Depend on Booking and Property models.
6. **Polish (Phase 9)**: Applied across all implemented features.

### Parallel Opportunities per Phase
- **Setup**: `T002`, `T003`, `T004` can execute in parallel.
- **Foundational**: `T005`, `T006`, `T008` can execute in parallel.
- **User Story 1**: `T010`, `T011`, `T013`, `T014` can execute in parallel.
- **User Story 2**: `T017`, `T018` can execute in parallel.
- **Admin Stories**: `T022`, `T023`, `T026`, `T028`, `T029` can execute in parallel.
- **Export & Favorites**: `T030`, `T031`, `T033`, `T034` can execute in parallel.

---

## Implementation Strategy: Incremental Delivery

1. **Step 1: Core Skeleton (Phases 1 & 2)** → Build theme tokens, seed inventory, and storage repository.
2. **Step 2: MVP Visitor Catalog (Phase 3 - US1)** → Filterable luxury property catalog and detail pages.
3. **Step 3: Booking Engine (Phase 4 - US2)** → Live 45-min slot booking, validation, and confirmation modal.
4. **Step 4: Admin Management (Phases 5 & 6 - US3 & US4)** → Inventory CRUD, booking registry, and schedule blackouts.
5. **Step 5: Enhancements (Phases 7 & 8 - US5 & US6)** → CSV export, calendar links, and favorite bookmarks.
6. **Step 6: Visual Excellence (Phase 9)** → Mobile touch testing, micro-interactions, and quickstart validation.
