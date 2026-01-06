# Strike Force - Bowling RPG Simulator

## Overview

Strike Force is a mobile-first RPG bowling simulator web application. Players progress from amateur to professional bowler through training, competitions, and career management. The game features save file management with 3 independent career slots, stat-based progression, bowling simulation mechanics, and an in-game economy with equipment, jobs, and sponsorships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: React Context API for game state (`gameContext.tsx`), React Query for server state
- **Routing**: Single-page application with tab-based navigation (no router library - uses component switching)
- **Theme System**: Dark/light mode support via custom ThemeContext with localStorage persistence

### Component Structure
- **Screens**: Tab-based navigation with 5 main screens (Home, Bowl, Career, Shop, Profile)
- **UI Components**: Full shadcn/ui component library with Radix UI primitives
- **Mobile-First Design**: Fixed bottom navigation, responsive layouts, touch-optimized interactions

### Game State Architecture
- **Local Storage Persistence**: Game state saved to localStorage under `strike-force-game-state` key
- **Save Slot System**: 3 independent save slots with create/load/delete functionality
- **Player Profile**: Contains stats (13 attributes), inventory (balls, equipment), career progress, financials

### Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **API Structure**: RESTful endpoints prefixed with `/api`
- **Storage Layer**: Abstract `IStorage` interface with in-memory implementation (`MemStorage`)
- **Build System**: Custom build script using esbuild for server, Vite for client

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect configured
- **Schema Location**: `shared/schema.ts` contains Zod schemas for type validation
- **Current State**: Schema defines game types (PlayerStats, BowlingBall, Competition, etc.) but database is optional - game currently uses localStorage

### Game Mechanics
- **Stats System**: 13 player attributes (throwPower, accuracy, hookControl, etc.) ranging 20-99
- **Bowling Simulation**: Frame-by-frame bowling with strike/spare probability calculations based on stats, equipment, and lane conditions
- **Progression**: Training costs energy, competitions earn money and reputation, pro status requires threshold achievements
- **Economy**: Money earned through jobs, competitions, sponsorships; spent on equipment and entry fees

## External Dependencies

### UI/Component Libraries
- **shadcn/ui**: Complete component library with Radix UI primitives
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Lucide React**: Icon library

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **Zod**: Runtime type validation and schema definitions
- **drizzle-orm**: SQL ORM (configured but not actively used for game state)
- **drizzle-zod**: Zod integration for Drizzle schemas

### Database
- **PostgreSQL**: Configured via DATABASE_URL environment variable
- **connect-pg-simple**: Session storage (available but not actively used)

### Build Tools
- **Vite**: Frontend bundler with HMR support
- **esbuild**: Server bundling for production
- **TypeScript**: Full type coverage across client, server, and shared code

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator