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

### New Feature Systems

#### Cosmetics System
- **5 Categories**: Ball skins, celebration animations, lane effects, avatar accessories, profile themes
- **20+ Items**: Multiple rarity tiers (common, rare, epic, legendary)
- **Unlock Methods**: Achievement rewards, reputation milestones, money purchases, sponsor rewards, legacy bonuses
- **Equip System**: One item per category, purely visual (no gameplay advantages)

#### Expanded Career Statistics
- **23 Fields**: Includes high game, high series, current/best strike streak, frame distribution counts
- **Calculated Percentages**: Strike%, spare%, open frame% derived from frame counts
- **Tournament Records**: Best finishes, podium counts, major championship wins
- **Rival Tracking**: Win/loss record against rivals, rivalry events history

#### Sponsor Negotiation System
- **4 Tiers**: Local, regional, national, elite sponsors
- **Safe vs Negotiated Offers**: Risk/reward choices during negotiation
- **Requirements**: Weekly tournament counts, minimum placements, reputation thresholds
- **Penalty System**: Contract termination warnings/actions integrated into weekly updates
- **Pro-Only**: Sponsorship tab unlocked after achieving professional status

#### Expanded Hall of Fame
- **14 Additional Fields**: Peak stats, achievements earned, cosmetics collected, legacy points
- **Career Summary Cards**: Detailed statistics display for retired bowlers
- **Legacy Points**: Calculated from career accomplishments, unlock prestige bonuses

#### Expanded Competitions Hub
- **League System**: 3 league types (Casual House League, Competitive Sport League, Pro League)
  - Weekly 3-game series vs scheduled opponents
  - Season standings with points, wins, averages
  - 10-14 week seasons with playoffs
  - League championships tracked in profile
- **Tournament System**: 3 tiers (Local Open, Regional Championship, Major Pro)
  - Two formats: Series (total pins) and Bracket (match play)
  - Qualifying rounds with cutline advancement
  - Prize pool distribution by placement
  - Tournament history tracking
- **Oil Patterns**: 6 types with difficulty ratings (House, Short, Sport, Long, Heavy, Dry)
  - Each pattern affects scoring difficulty
  - Displayed in competition details
- **Opponent Generation**: Skill-based NPCs with averages tied to competition tier
  - Varied names and stats per event
  - Consistent scheduling via stable opponent order

#### Career Ladder System
- **8 Tiers**: Amateur, League Regular, Regional Contender, State Champion, National Circuit, Pro Applicant, Professional, Elite Tour
- **Requirements**: Each tier requires minimum bowling average, league weeks completed, tournaments entered/won
- **Tracking**: League weeks and tournament participation tracked via trackLeagueWeekCompleted/trackTournamentEntered/trackTournamentWon functions
- **Auto-Advancement**: Career tier computed each week in advanceWeek based on cumulative progress
- **UI**: CareerLadderPanel.tsx shows current tier, next tier requirements, and all-tier progress list

#### Rankings System
- **150 AI Bowler Pool**: Generated with seeded RNG across 5 regional divisions (Local, Regional, State, National, Pro Tour)
- **Weekly Volatility**: Rankings shuffle each week in advanceWeek with performance-based adjustments
- **Rival Tracking**: Head-to-head records against specific AI bowlers
- **UI**: RankingsPanel.tsx with regional tabs, leaderboard entries, rank movement indicators, and rival cards

#### Seasonal Story Beats
- **Trigger Points**: Pre-season (week 1), mid-season (week 10), post-season (week 52)
- **Player Choices**: Each beat offers 2-3 choices with mechanical effects (energy, money, stat boosts)
- **Types**: pre-season, mid-season, post-season, tier-unlock, rival-encounter, breakout, comeback, headline-win
- **UI**: StoryBeatModal.tsx renders as AlertDialog with choice buttons

### Career Screen Tabs (4 total)
1. Ladder - Career tier display, progress tracking, unlock requirements
2. Compete - Leagues, tournaments, competitions hub
3. Rankings - Leaderboards, rival cards, regional divisions
4. History - Career stats, recent game history

### Profile Screen Tabs (8 total)
1. Overview - Player stats and settings
2. Achievements - Detailed achievement tracking with filters and career records
3. Cosmetics - Equipment and unlock management
4. Sponsors - Negotiation panel (pro-only)
5. Challenges - Weekly challenge system
6. Coach - Training and coaching features
7. Health - Injury and slump management
8. Legacy - Prestige system and Hall of Fame

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

### Monetization System
- **AdMob**: `@capacitor-community/admob@7.2.0` for rewarded and interstitial ads
  - Rewarded ads grant +5 skill points or +50 coins
  - Anti-abuse: 5-minute cooldown, 10 ads/day cap
  - Test/production mode via `ADMOB_CONFIG.useTestIds` in `products.ts`
- **IAP**: Structured for Google Play Billing with graceful fallback
  - Remove Ads ($4.99, non-consumable) - `remove_ads` SKU
  - Support Pack ($2.99, consumable, grants 500 coins) - `support_pack_small` SKU
  - Auto-detects billing plugins at runtime; simulates purchases on web
  - Restore flow checks Play Store first, falls back to localStorage
- **Files**: `client/src/monetization/` - products.ts, monetizationStore.ts, adService.ts, iapService.ts
- **UI**: MonetizationModal.tsx, RemoveAdsBanner.tsx integrated into ShopScreen Store tab

### Mobile Packaging (Capacitor)
- **@capacitor/core**: Capacitor runtime for native mobile apps
- **@capacitor/cli**: Capacitor CLI tooling
- **@capacitor/android**: Android platform support
- **Plugins**: AdMob, App, Haptics, Keyboard, SplashScreen, StatusBar (6 total)
- **Config**: `capacitor.config.ts` - App ID: `com.jarredpride.rpgbowler`, App Name: `RPG Bowler`
- **Static Build**: `vite.config.capacitor.ts` builds frontend-only to `dist/capacitor/` (no server dependencies)
- **Android Project**: `android/` directory contains the native Android project
- **Build Flow**: `npx vite build --config vite.config.capacitor.ts` → `npx cap sync android` → Open in Android Studio
- **AdMob Setup**: Test App ID in `android/app/src/main/res/values/strings.xml`; replace with production ID before release

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator