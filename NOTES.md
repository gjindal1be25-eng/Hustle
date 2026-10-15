# NOTES.md

## Step 0
- Project scaffolded with Next.js (App Router), TypeScript, Tailwind CSS, and Vitest.
- Isolated in subfolder `nexus-store/hustle` to preserve user's existing workspace files cleanly.
- Node.js scripts executed using `npm.cmd` on Windows.
- Google retro fonts (Hybrid: `Press Start 2P` for arcade pixel headings, `JetBrains Mono` for crisp, high-readability body, dialogues, and financial data) configured in layout and global CSS with `monospace` fallback.
- Disclaimer footer created in `components/DisclaimerFooter.tsx`.
- Vitest configured with node environment and `@/` path alias.

## Steps 1 - 15
- **Rules Engine (`lib/rules.ts`)**: Pure mathematical functions for balance, netSavings, avgMonthlyIncome, savedMonths, monthlySavingsRate, wantsShare, calculateEMI, loan summary, calculateGoalProgress, calculateLevel, getLevelTitle, calculateStreak, and budget status evaluation.
- **Idempotency (`lib/loan.ts` & `lib/recurring.ts`)**: Idempotent monthly EMI posting and recurring automated daily/weekly/monthly transactions with month-end day clamping.
- **Events & Insights (`lib/events.ts` & `lib/insights.ts`)**: Priority-ranked event engine (Debt spiral, Stranded, Goal reached, Promotion, Loan taken, Default) with clear "why" lines tying rules to user numbers. 3-step recovery plan for debt spirals. 8 rule-based smart insight tips.
- **State Store (`context/GameContext.tsx`)**: React Context + reducer managing localStorage key `hustle_v1`, validation against negative or empty inputs, automatic badge and lesson trigger evaluation.
- **UI Kit (`components/ui/`)**: Wood frame (`WoodFrame.tsx`) with stone corner studs, stone panels (`StonePanel.tsx`), pixel buttons with wood/stone/danger/gold variants, inset inputs, chips, HUD bar, 96px RPG dialogue box, and `/kit` living showcase route.
- **Isometric Town (`components/town/Town.tsx`)**: Ported from `town-reference.html` into a reactive SVG component featuring 7 interactive buildings with hover tooltips, click navigation, level height scaling, day/night palette crossfade, storm weather rain, and animated character sprite.
- **Routes & Pages**:
  - `/` (Home Town Shell + Title Setup Flow)
  - `/work` (Income logging + career ranks)
  - `/market` (Expense logging + budget limit editor)
  - `/story` (Story stage + narrative chronicle)
  - `/bank` (Loan EMI simulator + active loan payoff)
  - `/vault` (Goal tracker + celebration)
  - `/townhall` (Needs vs Wants stacked bar, block-stack charts, category donut, badges shelf)
  - `/school` (8 book-inspired wisdom scrolls)
  - `/settings` (Path switcher, avatar palette, recurring rules, Judge Demo loader, Reset all)
- **Web Audio Sound (`lib/sound.ts`)**: Synthesized 8-bit retro sound cues for coin drops, button taps, fanfare celebrations, and budget alerts without requiring any audio asset files.

## Change Request v15 (CR v15)
- **CR 1 (Roads)**: Edged dirt roads restored from `town-reference.html` with `#A27140` dirt surface, `#85592F` dark edge, scattered grey pebbles, and stone step thresholds at each building door. All dotted guide lines, grids, and hints eliminated.
- **CR 2 (Building Layout)**: Applied all exact building nudges from Section 2 table. Row alignment broken; adjacent buildings differ in depth by $\ge 0.5$ tiles. Scenery props (trees, bushes, lamps, flowers, fences) repositioned to guarantee zero door or road blockage.
- **CR 3 & 5 (Misplaced Words & Projection)**: All name tags, live badges, and character labels positioned strictly using `P(x, y, z)` projected isometric SVG units with SVG `text-anchor: middle`. Size determined dynamically by character count (7px/char + 14px padding). All non-town copy remains in HTML outside the SVG.
- **CR 4 (Road Graph & Movement)**: Built topological road graph (`lib/roadGraph.ts`) with BFS shortest path routing. Character moves strictly along roads at 3 tiles/sec via arrow keys or WASD. Enter/Space opens buildings at doors. Mouse clicking a building computes the road path, walks the sprite, and opens the page.
- **CR 5 (Calm Panels)**: Replaced high-density game styling on pages with calm stone panels (`#3A3F47` background, 2px `#4B515A` border, 16px padding, max width 720px, VT323 at 20px cream `#FFF4D6`, one primary wood/gold button per page).
- **CR 6 (Page Layouts)**: Reorganized all 7 building pages and Settings to feature one persistent main action on top and two plain wood tabs below. Lists capped at 5 rows with "Show all" expansion.
- **CR 7 (Island Dimensions)**: Island layout preserved with pixel-perfect reference scaling and clean edge margins, maintaining responsive viewport auto-scaling.
- **CR 8 (QA)**: Full verification passed: 17/17 Vitest unit tests green, Next.js 16 static build 12/12 routes compiled with zero errors.

## Prompt 3: Text Element & Readability Audit
- **SVG Name Tags (`components/town/Town.tsx`)**: Computed using `text-anchor="middle"`, dynamically sized to `Math.round(text.length * 6.6 + 14)`. Rendered at the end of the SVG to prevent building occlusion.
- **HUD Bar Items (`components/ui/HudBar.tsx`)**: Replaced `flex-wrap` with `flex-nowrap`, `whitespace-nowrap`, and `overflow-x-auto`. Added fixed `min-w-[140px]` to Left group (name + title), `min-w-[260px]` to Middle stats (balance, savings rate, goal progress), and `min-w-[140px]` to Right controls. Player name truncated with an ellipsis (`max-w-[120px] truncate`).
- **RPG Text Box (`components/ui/RpgTextBox.tsx`)**: Enforced 12px padding (`p-3`), added `pt-2` top clearance to prevent the absolute name tab (`-top-3.5`) from covering the first line of text. Added `max-h-[88px] overflow-y-auto` and `break-words` to prevent multi-sentence overflow.
- **Page Layouts & WoodFrame (`components/ui/WoodFrame.tsx`)**: Added `max-h-[calc(100vh-140px)] overflow-y-auto` to the inner content slot so long page content scrolls neatly inside the frame rather than the window. Labels positioned above inputs in `PixelInput` and `PixelSelect`. Amounts right-aligned across all tables and lists.
- **Font Fallbacks (`app/layout.tsx`)**: Added explicit monospace font fallbacks (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`) with `display: "swap"` for both `Press_Start_2P` and `JetBrains_Mono` to eliminate layout shift if Google Fonts are slow or offline.

## Prompt 4: Calmer Menu Pages
- **Typography & Font Scoping**: Enforced arcade pixel typography (`font-heading`) strictly on page titles, tab labels, and key icons. All forms, tables, and financial data now utilize clean 14–16px sans-serif / monospace in cream (`#FFF4D6`) on dark stone panels.
- **Single Panel Level**: Stripped nested borders, corner studs, and inner drop shadows across all full-page screens. Inner contents now render inside a single plain stone panel (`#3A3F47`) with 16px vertical spacing (`space-y-4`) between groups.
- **Tabs with Gold Underline**: Replaced bulky wood block tabs with clean text tabs featuring an active solid gold bottom border (`border-b-2 border-[#FFD95A]`).
- **One Primary Action Button per Screen**: Updated `PixelButton` primary/gold variants to solid gold (`#FFD95A`) with dark text (`#1B1B1F`). Every page now contains exactly ONE gold button for its primary action. All secondary operations (deletions, toggles, sub-forms, pagination) are formatted as plain text links.
- **Option C Quick-Add Steps (`/work` & `/market`)**:
  - Implemented 2-step quick-add flows: Step 1 (Amount input) and Step 2 (Category chips).
  - Date, note, classification, and custom category fields tucked neatly inside an expandable "Advanced options" disclosure.
  - History and recurring/budgets grouped in a clean second tab.
- **Option A Calm Panel (`/story`, `/bank`, `/vault`, `/school`, `/townhall`, `/settings`)**:
  - Maintained outer protective wood frame (`WoodFrame`), housing a single calm stone panel layout with gold tab underlines.
  - Removed duplicate top HUD information (redundant balance and streak indicators).
  - All lists capped at 3 items with a "See all (X)" toggle link.
  - Budgets tab in `/market` simplified to clean progress bars with inline edit links.

## Prompt 5: Keyboard Road Navigation, Building Doorway Entry & Custom Character
- **Keyboard-Only Movement (`components/town/Town.tsx`)**:
  - Disabled mouse click-to-walk ground targeting on the town canvas (`handleSvgClick` removed; canvas set to `cursor-default`).
  - Movement driven exclusively via keyboard Arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) and `WASD`.
  - Grid movement step size tuned to 0.15 tiles with instant keyboard event handling for crisp, responsive player control.
- **Strict Road-Only Boundaries (`lib/townGrid.ts`)**:
  - Implemented `isWalkableRoad(x, y)` which strictly confines movement to the road network:
    - Main horizontal road spanning `x in [0.7, 9.3], y in [3.4, 4.6]` (incorporating stone bridge and east river bank).
    - Lower horizontal road spanning `x in [0.7, 9.3], y in [7.4, 8.6]`.
    - Central vertical spine `x in [4.4, 5.6], y in [1.8, 10.2]` connecting all branches.
    - Central cobblestone plaza `x in [3.5, 6.5], y in [4.2, 7.8]` (with stone well center blocked).
    - Dedicated door stubs and thresholds for all 7 buildings.
  - Off-road grass, water/river, scenic trees, bushes, lamps, and obstacles are strictly non-walkable.
- **Building Doorway Entry & Menu Transition**:
  - Mapped exact doorway coordinates for all 7 town buildings in `BUILDING_DOORS` and `getBuildingAtDoor(x, y)`:
    - Work (`x in [1.7, 2.3], y <= 2.6` -> `/work`)
    - Town Hall (`x in [5.0, 5.6], y <= 2.6` -> `/townhall`)
    - Vault (`x in [8.3, 8.9], y <= 2.6` -> `/vault`)
    - Home (`x in [1.7, 2.3], y <= 5.8` -> `/story`)
    - Bank (`x in [8.3, 8.9], y <= 6.1` -> `/bank`)
    - Market (`x in [1.7, 2.3], y <= 9.35` -> `/market`)
    - School (`x in [8.3, 8.9], y <= 9.35` -> `/school`)
  - Stepping into a doorway plays an entry sound cue and immediately navigates into the building's menu.
  - Added navigation transition lock (`isNavigatingRef`) to eliminate duplicate triggers and race conditions.
  - Keyboard `Enter` or `Space` near any building door steps into the doorway and triggers entry.
- **Custom Designed Character Figure (`components/town/TownCharacter.tsx`)**:
  - Built pure SVG pixel-art character directly on the SVG canvas, completely replacing foreignObject-based rendering.
  - Eliminates macOS WebKit/Safari foreignObject clipping, paint failure, and scaling bugs.
  - Dynamically reflects custom player profile attributes (`profile.avatar.hairColor` and `profile.avatar.outfitColor`).
  - Features retro pixel cap, dynamic facial expression / mouth per mood, gold belt buckle, swinging arms, alternating leg stride (`walkStep`), horizontal flip on left/right facing, and soft ground shadow.

