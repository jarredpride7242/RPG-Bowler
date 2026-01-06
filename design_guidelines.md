# Design Guidelines: Mobile-First RPG Bowling Simulator

## Design Approach
**Reference-Based**: Drawing from mobile sports management games (Basketball GM, Football Manager Mobile) and progression-focused mobile games. Clean, data-dense UI optimized for mobile with game-like visual hierarchy.

## Typography System
- **Primary Font**: Inter or Rubik (Google Fonts) - excellent readability at small sizes
- **Display/Headers**: 700 weight, 24-32px
- **Body Text**: 400 weight, 14-16px
- **Stats/Numbers**: 600 weight, 16-20px (tabular figures)
- **Small Labels**: 500 weight, 12-14px

## Layout & Spacing
**Tailwind Units**: Consistently use 4, 6, 8, 12, 16 for spacing
- Component padding: p-4 to p-6
- Section gaps: space-y-6 to space-y-8
- Bottom nav clearance: pb-20 (66px fixed bottom nav)

**Container Strategy**:
- Max width: max-w-2xl (centered on tablet+)
- Mobile: Full width with px-4 side padding
- Cards/panels: Rounded corners (rounded-lg to rounded-xl)

## Component Library

### Bottom Navigation (Fixed)
- 5 tabs: Home, Bowl, Career, Shop, Profile
- Icon + label format
- Active state: Bold text + accent indicator
- Height: 66px with safe area padding

### Save File Management
- 3 large card slots (full-width mobile)
- Each shows: Player name, average, week/season, pro status badge
- Empty slots: Dashed border with "+ New Career" centered
- Actions: Tap to load, long-press menu (delete/overwrite)

### Stats Display
- Grid layout: 2 columns on mobile, 3-4 on tablet
- Each stat: Label above, large number below, small progress bar
- Use subtle backgrounds to group related stats
- Progression indicators: Small +/- badges for recent changes

### Bowling Simulation Screen
- Frame-by-frame display: Horizontal scrollable strip showing all 10 frames
- Active frame: Larger, highlighted
- Pin visualization: Simple geometric representation (SVG circles)
- Score overlay: Running total prominently displayed
- Action buttons: Large touch targets (min 48px height)

### Professional Membership Screen
- Card-based layout with:
  - Current average (large, prominent number)
  - Requirement threshold with progress bar
  - Status badge (Amateur vs Professional)
  - Application button (disabled state clearly communicated)
  - Benefits list with checkmarks

### Modal Confirmations
- Centered overlay with backdrop blur
- Title, description, action buttons stacked
- Destructive actions: Red accent
- Cancel always available

### Shop Interface
- Bowling balls as cards with:
  - Ball name (procedural, stylized)
  - Type badges (Plastic/Reactive/etc.)
  - Attribute bars (hook potential, control, etc.)
  - Price prominent
  - "Owned" badge for purchased items
- Filter tabs at top (Type, Core, Price)

### Tournament/League Cards
- Competition name, prize pool, difficulty indicator
- Entry requirements (average, pro status)
- Date/time display
- Locked state overlay for ineligible events

### Job Listings
- Compact cards showing:
  - Job title, weekly pay (large)
  - Energy cost per week (badge)
  - Requirements (if any)
  - Contract length
- Apply button with loading state

### Relationship/Dating Interface
- Profile-style cards with:
  - Name, relationship level (hearts/progress)
  - Activity options (date types)
  - Cost display (energy + money)
  - Relationship buff indicators

## Visual Hierarchy
**Priority Levels**:
1. **Critical Data**: Bowling average, energy, money - always visible in header
2. **Primary Actions**: Large buttons, 48-56px height, full-width on mobile
3. **Stats/Info**: Organized grids, clear labels, appropriate emphasis
4. **Secondary Actions**: Smaller buttons, outlined style

## Data Visualization
- **Progress Bars**: Rounded, filled portion with gradient
- **Stat Meters**: Horizontal bars with labels, 0-99 scale clearly marked
- **Trends**: Small sparkline charts for bowling average history
- **Badges**: Rounded pills for status indicators (Pro, Amateur, Locked)

## Mobile Optimization
- Touch targets: Minimum 44px (prefer 48-56px)
- Swipe gestures: Horizontal swipe between frames during bowling
- Pull-to-refresh: On main screens
- Tab bar: Fixed bottom, always accessible
- Scrollable content: Clear visual indicators for overflow
- Forms: Large inputs with proper mobile keyboards

## Game Feel Elements
- **Stat Increases**: Brief highlight animation on stat gains
- **Score Updates**: Number count-up animation
- **Achievements**: Toast notifications at top
- **Loading States**: Skeleton screens for data loading
- **Empty States**: Friendly illustrations with clear CTAs

## Screen-Specific Layouts

**Home/Dashboard**: Weekly summary card + quick actions grid + upcoming events list

**Bowl Screen**: Lane visualization + frame display + throw button + current score panel

**Career Screen**: Season summary + average graph + tournament history table + achievements grid

**Shop Screen**: Filter tabs + scrollable ball cards + owned equipment section

**Profile Screen**: Player card (name, style, stats summary) + settings + save management

## Interactions
- Minimal animations (slide transitions between tabs)
- Instant feedback on taps
- Confirmation modals for destructive actions
- Disabled states clearly communicated (reduced opacity + explanatory text)

---

**Key Design Principle**: Information density balanced with clarity - pack meaningful data without overwhelming, prioritize readability and touch-friendly interactions for extended mobile gameplay sessions.