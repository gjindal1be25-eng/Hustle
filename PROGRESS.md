# PROGRESS.md

- [x] Step 0: Scaffold Next.js (App Router) + TypeScript + Tailwind + Vitest. Load fonts, folders, NOTES.md, PROGRESS.md, disclaimer footer.
- [x] Step 1: Rules engine in lib/ (pure functions, unit tests for all formulas: balance, netSavings, avgIncome, savedMonths, EMI, goal progress, levels, streaks, budget statuses).
- [x] Step 2: State store (React context + reducer) saving to hustle_v1 with validation & idempotent EMI posting and recurring processor.
- [x] Step 3: UI kit: wood page frame, stone panels, buttons, inputs, chips, toasts, tables, HUD bar, RPG text box, icons, /kit route.
- [x] Step 4: Port town-reference.html into React SVG component <Town/> with clickable areas, name tags, character sprite, day/night and storm weather.
- [x] Step 5: Setup flow and town shell (40px HUD + town + 96px text box).
- [x] Step 6: Work page (income) and Market page (expenses + category budgets).
- [x] Step 7: Home page (Story) and event engine with "why" lines and debt spiral recovery plan.
- [x] Step 8: Bank page (Loan simulator and active loan) with EMI posting and liability wisdom.
- [x] Step 9: Vault page (Goals) with reached celebration.
- [x] Step 10: Town hall page: Summary tab with pixel charts (donut, block-stack bars, needs vs wants, budget bars) and badges shelf.
- [x] Step 11: School page (Learn) with 8 book-inspired financial wisdom scrolls.
- [x] Step 12: Settings (gear), demo data generator (Level 2 Clerk), recurring manager, reset all.
- [x] Step 13: Town visual effects: weather states (sunny/storm rain/stranded dusk), level growth height scaling, character sprite idle bob.
- [x] Step 14: P1 polish: day/night toggle, recurring entries, insight tips, badges shelf, Web Audio synthesized 8-bit sound effects.
- [x] Step 15: Final QA against acceptance checklist, README.md, and production build verification.

## Change Request v15 (CR v15)
- [x] CR 1: Restore the original road style (#A27140 dirt surface, #85592F edge, pebbles, stone steps) and make roads connect every door.
- [x] CR 2: Move building anchors per Section 2 table and reposition props and name tags (neighbours differ by >= 0.5 tile depth).
- [x] CR 3: Fix misplaced words per Section 5 (cream 11px tags directly under building front-center, live badges float over roof, no overlaps).
- [x] CR 4: Build road graph and arrow-key / WASD movement per Section 3 (walk on roads only, Enter/Space enters building, mouse click walks along path).
- [x] CR 5: Calm panel rules in Section 4.1 on every page (#3A3F47 background, 2px #4B515A border, 16px padding, 720px max width, VT323 at 20px, cream #FFF4D6).
- [x] CR 6: Page layouts in Section 4.2 (one main action on top, two tabs, lists 5 rows with Show all).
- [x] CR 7: Optional bigger island (Section 6) (Roads connect, scaling preserved, zero overlap).
- [x] CR 8: QA against Section 9. Update README.

