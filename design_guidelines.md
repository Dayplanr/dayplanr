# Design Guidelines: Personalized Productivity App

## Design Approach

**Selected System:** Material Design 3 with Linear-inspired refinements
**Rationale:** Productivity apps require clarity, hierarchy, and efficiency. Material Design provides robust component patterns for data-heavy interfaces, while Linear's aesthetic brings modern polish and focus-oriented design principles.

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - weights 400, 500, 600
- Monospace: JetBrains Mono for timers and numeric data

**Hierarchy:**
- Page Titles: 28px/semibold
- Section Headers: 20px/semibold
- Card Titles: 16px/medium
- Body Text: 15px/regular
- Labels/Metadata: 13px/regular
- Timer/Stats: 32px/semibold (monospace)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (between related items): 2-4
- Component padding: 4-6
- Section spacing: 8-12
- Page margins: 12-16

**Container Strategy:**
- Mobile: Full width with px-4 padding
- Desktop: max-w-6xl centered with side padding

## Core Components

### Navigation
**Bottom Tab Bar (Mobile) / Side Navigation (Desktop):**
- Fixed positioning for constant access
- Icons from Heroicons (outline style)
- Active state: filled icon + theme color accent
- Height: 64px mobile, full-height 240px desktop sidebar
- Include subtle dividers between tabs

### Today Tab
**Calendar Scrubber:**
- Horizontal scrollable date picker (week view)
- Current day highlighted with theme color
- Compact date cards: 56px width showing day/date

**Task Cards:**
- Grouped by time period with collapsible headers (Morning/Afternoon/Evening/Night)
- Each task: checkbox, title, time display, priority indicator (left border accent)
- Timer/reminder icons inline, right-aligned
- Swipe actions for mobile: complete/delete
- Card elevation: subtle shadow (2px)

### Goals Tab
**Progress Dashboard:**
- Category cards in 2-column grid (mobile: 1-col)
- Circular progress indicators (100px diameter)
- Trend arrows with icons: ↗ upward, → stable, ↘ downward
- Projected completion date below progress ring
- Key tasks listed as compact checklist below each goal

### Habits Tab
**Habit Cards:**
- Streak counter prominent (large number + fire icon)
- Mini calendar heatmap: 7x5 grid for current month
- Heatmap using single-color gradients (theme-based opacity levels)
- Success rate: percentage with small bar chart
- Timer/reminder toggle integrated into card header

**Shared Challenges:**
- Separate section with participant avatars
- Days remaining countdown
- Group progress indicator

### Focus Tab
**Pomodoro Timer:**
- Large central circle timer (200px diameter)
- Session type selector: Focus/Short Break/Long Break
- Start/Pause/Reset controls below timer
- Current task name displayed above timer

**Analytics Grid:**
- 4-card stat grid: today/week/month/best time
- Each card: large number (metric) + small label + trend indicator
- Distraction counter with reset option
- Session history: timeline view with duration bars

## Data Visualization

**Charts & Graphs:**
- Line charts for trends (stroke-width: 2px)
- Bar charts for comparisons (rounded corners: 4px)
- Heatmaps: single theme color with opacity variations (20%, 40%, 60%, 80%, 100%)
- No grid lines, minimal axes labels

**Progress Indicators:**
- Circular: 8px stroke width, rounded caps
- Linear: 6px height, rounded ends
- Animate progress changes with smooth transitions

## Theme Customization

**Per-Tab Theming:**
- Allow users to select from preset palettes per tab
- Palettes: Soft Blue, Peach, Mint Green, Lavender, Warm Gray
- Theme affects: active states, progress indicators, accents, heatmap colors
- Maintain high contrast for text readability across all themes

## Interaction Patterns

**Micro-interactions:**
- Checkbox animations: scale + checkmark draw
- Task completion: subtle strikethrough + fade
- Card expansion: smooth height transition
- Swipe gestures: reveal actions with resistance feedback

**State Management:**
- Empty states: friendly illustrations + helpful copy
- Loading states: skeleton screens matching layout
- Error states: inline messages with retry actions

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Bottom tab navigation
- Full-width cards
- Collapsible sections by default

**Desktop (≥ 768px):**
- Side navigation (left)
- Multi-column grids where appropriate
- Expanded views showing more information
- Hover states for interactive elements

## Accessibility

- Minimum touch targets: 44x44px
- ARIA labels for all interactive elements
- Keyboard navigation support throughout
- Focus indicators: 2px offset ring in theme color
- High contrast mode support

## Images

**No hero images needed** - this is a utility application focused on functionality. Use icons (Heroicons) throughout for:
- Empty states: simple line illustrations
- Tab icons: outline style
- Status indicators: check, clock, flame, target icons
- All iconography consistent in stroke-weight and style