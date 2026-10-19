# Implementation Plan: Real Estate Property Viewing & Booking System

**Branch**: `001-property-viewing-booking` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-property-viewing-booking/spec.md`

## Summary

Deliver a production-grade, aesthetically stunning real estate web platform with an integrated viewing booking system tailored to the client's job requirements. The application features a high-conversion visitor journey (reactive search/filters, immersive property pages, photo galleries, map location, and a live viewing slot scheduler with instant confirmation and calendar integration) paired with a comprehensive admin management portal (listing CRUD/archive, availability scheduling, date blackouts, booking status workflow, simulated email notification center, and CSV export).

The implementation uses **React + Vite** with a bespoke **Vanilla CSS design system** evoking modern luxury architecture, backed by a robust client-side **Storage & Event Repository** pre-seeded with rich real estate inventory for instantaneous offline-ready reviewer evaluation.

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2022  
**Primary Dependencies**: React 18/19, `@supabase/supabase-js`, Lucide Icons (for clean architectural UI iconography), Canvas-Confetti (for booking confirmation delight)  
**Storage**: Supabase (PostgreSQL with real-time capabilities) with seamless LocalStorage resilience fallback for offline or pre-migration testing  
**Testing**: Unit and contract scenario testing with Vitest / browser interaction tests  
**Target Platform**: Modern Evergreen Browsers (Chrome, Firefox, Safari, Edge) across mobile, tablet, and desktop viewports  
**Project Type**: Modern Web Application (Single-Page Application with Visitor & Admin routing)  
**Performance Goals**: First Contentful Paint < 0.8s, Filter updates < 16ms (60 FPS), Instant booking slot conflict verification  
**Constraints**: Fully responsive down to 320px mobile width; zero mandatory external backend or paid third-party API dependencies for reviewer evaluation; 100% English UI  
**Scale/Scope**: 12+ pre-configured luxury listings across major property types, interactive calendar engine with dynamic 45-min slots, complete admin portal with booking registry  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicity & YAGNI**: Pass. A consolidated React application eliminates brittle multi-server overhead while delivering 100% of the visitor and administrative user stories requested in the job description.
- **Contract & Spec Alignment**: Pass. Interface contracts ([`visitor-api.md`](contracts/visitor-api.md) and [`admin-api.md`](contracts/admin-api.md)) and Data Model ([`data-model.md`](data-model.md)) directly mirror all functional requirements (`FR-001` through `FR-015`).
- **User Delight & Aesthetic Quality**: Pass. Adheres to rich luxury aesthetics (deep navy/slate palette, gold accents, glassmorphic floating filter bars, smooth micro-transitions, clean typography).

## Project Structure

### Documentation (this feature)

```text
specs/001-property-viewing-booking/
├── spec.md              # Requirements and user scenarios
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Architecture decisions & trade-offs
├── data-model.md        # Entities, validation rules, state transitions
├── quickstart.md        # Step-by-step evaluation & verification guide
├── contracts/           # API and data exchange schemas
│   ├── visitor-api.md   # Catalog filtering, details, booking submission
│   └── admin-api.md     # Inventory CRUD, schedule blackouts, CSV export
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── assets/              # Static media and brand graphics
├── components/          # Reusable UI component library
│   ├── common/          # Button, Modal, Badge, Input, Toast, Tabs
│   ├── visitor/         # PropertyCard, FilterBar, PhotoGallery, PropertyMap, SavedPropertiesDrawer
│   ├── booking/         # SlotPickerCalendar, BookingModal, ConfirmationReceipt
│   ├── admin/           # PropertyFormModal, BookingTable, AvailabilityManager, CsvExportButton
│   └── notifications/   # NotificationDrawer, EmailTemplateViewer
├── context/             # AppState, FavoritesContext, NotificationContext
├── data/                # Seed luxury properties, agents, initial schedule rules
├── services/            # Core business logic layer
│   ├── storageService.ts    # Repository pattern for LocalStorage persistence
│   ├── bookingService.ts    # Slot generation, blackout checks, conflict prevention
│   ├── notificationService.ts # Email simulation & audit trail
│   └── exportService.ts     # RFC 4180 CSV generation & download
├── types/               # TypeScript interfaces matching data-model.md
├── styles/              # Vanilla CSS Design System
│   ├── index.css        # CSS variables, typography, resets, animations
│   ├── components.css   # Atomic component classes (cards, buttons, inputs)
│   └── admin.css        # Dashboard grid, tables, and management controls
├── App.tsx              # Root component with Visitor / Admin navigation
└── main.tsx             # Application bootstrap
```

**Structure Decision**: A clean modular React structure separating presentation components, business services, and reactive persistence. This allows seamless evolution into an external API client (e.g. Next.js / Express backend) if deployed to multi-tenant production, while fulfilling the immediate portfolio demonstration goal.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| Client-Side Storage Service Repository | Enables instant offline-ready reviewer evaluation without requiring local database or backend servers to be spun up | In-memory state would lose newly added properties or bookings upon page refresh |
| Dual-layer Notification Center | Fulfills email confirmation & agent notification requirements transparently in a demo setting | Mandating third-party SMTP API keys (e.g., SendGrid) creates setup barriers for portfolio reviewers |
