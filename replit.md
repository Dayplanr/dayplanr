# Replit.md - Personalized Productivity App

## Overview

This is a personalized productivity application built as a full-stack TypeScript project. The app features four main tabs: Today (dashboard), Goals, Habits, and Focus. Each tab integrates its own analytics, eliminating the need for a separate insights section. The application supports task management with timers and reminders, goal tracking with progress visualization, habit tracking with streaks and heatmaps, and focus sessions using Pomodoro and deep work techniques.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Charts**: Recharts for data visualization
- **Design System**: Material Design 3 with Linear-inspired refinements

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- shadcn/ui primitives in `client/src/components/ui/`
- Example usage patterns in `client/src/components/examples/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful routes prefixed with `/api`
- **Build Tool**: Vite for frontend, esbuild for server bundling

The server implements a storage interface pattern (`IStorage`) that abstracts data operations, currently using in-memory storage (`MemStorage`) but designed for easy database migration.

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Drizzle Kit for schema migrations (output to `./migrations`)

The shared schema pattern allows type-safe data access across both client and server.

### Build and Development
- **Development**: `npm run dev` runs Vite dev server with HMR
- **Production Build**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.js`
- **Database Push**: `npm run db:push` syncs schema to database

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Neon Serverless**: PostgreSQL client (`@neondatabase/serverless`) for serverless-compatible connections
- **Session Storage**: `connect-pg-simple` for Express session storage in PostgreSQL

### UI Dependencies
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, popover, tabs, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities
- **embla-carousel-react**: Carousel component
- **vaul**: Drawer component
- **cmdk**: Command palette component
- **recharts**: Charting library for analytics visualizations

### Development Tools
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` for enhanced Replit development experience

### Fonts
- **Google Fonts**: Inter (primary), DM Sans, Geist Mono, Fira Code, Architects Daughter loaded via CDN in `client/index.html`