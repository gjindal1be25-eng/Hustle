# NOTES.md

## Step 0
- Project scaffolded with Next.js (App Router), TypeScript, Tailwind CSS, and Vitest.
- Isolated in subfolder `nexus-store/hustle` to preserve user's existing workspace files cleanly.
- Node.js scripts executed using `npm.cmd` on Windows.
- Google retro fonts (`Press Start 2P` for pixel headings, `VT323` for body and dialogue) configured in layout and global CSS with `monospace` fallback.
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

