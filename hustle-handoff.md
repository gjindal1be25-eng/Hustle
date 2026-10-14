# Hustle: handoff file

Paste this whole file into a new chat, then say what you want next (see section 9). Everything needed to continue is here, so you do not need to upload the two PDFs or the screenshots again.

---

## 1. What Hustle is (short)

- **Event:** BIOS Hackathon V2, CORE track, PS 2 (financial literacy and personal budgeting assistant).
- **Pitch:** Budgeting that teaches by showing you the life your habits would build.
- **Idea:** A budgeting tool with a story layer. The user logs money in and out (₹ only). A pixel-style character with the user's name lives the results: gets promoted as savings grow, gets stranded when money runs out, falls into a debt spiral under heavy loan load. Every story change shows a plain "why" line (the rule plus the user's real number) and a short lesson. The game never ends.
- **Stack:** Next.js (App Router) + TypeScript + Tailwind. Data in localStorage (one key `hustle_v1`, with a version field). No backend, login, database or AI. Static deploy (Vercel).
- **Coding tool:** Antigravity (AI coding IDE). The spec PDFs are its source of truth.
- **Tone:** light and funny, never shaming.
- **Footer on every page:** "Educational tool. Not financial advice. Your data stays in your browser."

---

## 2. Status

**Done in this chat (art direction):**
- Chose the town art style and drew all 7 buildings plus the full island (code in section 8).

**Decided in an earlier chat (UI), not yet written into the PDFs:**
- Title screen: only the logo and a Start button.
- Inner pages: wood frame with dark stone panels. The character's speech box is always visible at the bottom, so every page feels part of the game.
- Setup: step by step, one question per screen, the character talking. Order: name, then avatar (live preview), then career path, then opening balance. The town grows a little with each step.
- Avatar designer: pick from 6 preset hair colours and 6 outfit colours.
- Career path picker: a dialog choice by the character.
- Summary charts: category split as a pixel donut; income vs expenses by month as block-stack bars (one block = a fixed amount); budget bars with green/amber/red states; needs vs wants as a two-colour stacked bar.

**Not done yet:**
- Fold all of the above and the new town art into the visual spec PDF as v2.
- Next question round: Summary page layout, Loan simulator page, Goals page, Learn page lesson cards (with a picture sketch of each).
- Build the app.

---

## 3. Town art decisions (what we chose in this chat)

Starting point: the visual spec says "Minecraft-style isometric island". We refined it like this. **These choices override the visual spec PDF where they differ.**

- **Style:** isometric (2:1 diamond) made of blocks, drawn as inline SVG. No image files.
- **Soft, not sharp:** block corners are slightly rounded (done with a same-colour stroke and round line joins). **No black outlines.** Faces are separated only by light and shade.
- **Shading:** top = base colour, left face = base darkened 12%, right face = darkened 24%. Light from the upper left.
- **Palette:** pastel and warm. Sky bands `#9AD8FF` / `#B5E3FF` / `#CFEEFF`. Grass `#8FD672` with a subtle checker `#86D068`. Dirt `#A27140` / `#85592F`. Water `#59B9F2`. Stone `#E3E6EB`, `#B4BAC4`, `#DDE0E6`. Cream `#FFF6E0`. Gold `#FFD95A`. Red `#EE6A5E`. Wood `#D9A05E`, `#C98F4E`.
- **Blocky everything:** trees (trunk block plus two stacked leaf blocks), clouds (flat rectangles), lamps (post plus yellow cube), the Bank coin (gold block with a ₹). Round shapes only when there is no way to avoid them.
- **Reduced detail:** no window cross-bars, no pillar bases/caps, no door knobs, no flag stripes.
- **Labels:** small name tags under each building (cream pill, 11px). Text written on the walls was dropped because it became too small once buildings were scaled down.
- **Island:** compact, buildings large, thin grass edge, 2x2 plaza with a small well. Earlier layouts were first too crowded, then too empty, then "okay"; the final one is below.
- **Extras kept few:** edged dirt roads with pebbles, river with sandy bank and ripples, plank bridge with rails, stepped dirt underside (floating island), 7 tiny flower groups, 3 bushes, 2 trees, 2 lamps, 2 short fence pieces at the front entrance.

### The 7 buildings (what each looks like)

| Building | Look |
|---|---|
| Home | Wood walls, red stepped roof, grey chimney, brown door, two windows |
| Market | Open wooden stall, red/cream striped awning with fringe, counter with 3 fruit crates, wooden posts, hanging sign board |
| Work | Tall light-blue glass office with rows of windows, dark door, gold sign block on the roof |
| Vault | Wide stone block, gold-framed vault door with wheel, corner pillars, gold-banded treasure chest on the roof |
| Town hall | Four cream pillars, door, two windows, wood sign board on the roof slab, stepped blue dome, clock, red flag |
| School | Yellow body, porch with red door and book sign, red roof, cream bell tower with a gold bell |
| Bank | Stone block, four cream pillars, door, windows, wood sign board, gold coin block on the roof, two red flags, cream steps |

Growth with level (from the visual spec, still to build): buildings get taller and brighter with each level (L1 to L5). Work by career path changes props only.

### Island layout (top view, grid units)

```
                     back (far)                      river
        +---------------------------------------+ ~~~~~~~
        |  WORK        TOWN HALL        VAULT   | ~~~~~~~
        |  (road across the back)-------------- bridge==>
        |                                        |
        |  HOME      [ plaza + well ]      BANK  |
        |                |                       |
        |  (road across the front)---------------|
        |  MARKET        |  trees         SCHOOL |
        |          fence |  fence                |
        +---------------------------------------+
                     front (near, entrance)
```

Numbers: island is 11.2 x 9.8 grid units plus a 0.8 wide river on the right. Building scale: most buildings 0.8, Bank 0.62. Back row top-left corners at (0.4, 3.7, 7.0) with y = 0.3; middle row y = 3.5; front row y = 6.7.

---

## 4. Build spec (condensed)

Items are P0 (build first) or P1 (after all P0 passes).

### Decisions
- ₹ INR only. Dates stored as ISO `yyyy-mm-dd`; "today" = device date; a month = calendar month.
- Avatar: hair colour + outfit colour only (now 6 presets each).
- Career paths (cosmetic only, can switch anytime, progress never changes): Corporate job, Business owner, Freelancer/creator.
- Level metric: total net savings, measured in months of income.
- Opening balance entered at setup. Any entry date allowed.
- Income entries: any money received. Expense categories: defaults plus custom ones.
- Budgets: monthly limit per category with warnings. Recurring entries (daily/weekly/monthly) in P1.
- One active loan at a time, with an EMI simulator. Savings goals in MVP.
- No death. Running out of money triggers stranded or debt-spiral events with a recovery path.
- Not building: leaderboards, UPI/bank import, login, backend, AI chat, multiple loans, multiple currencies, sound, data export.
- Demo profile plus a reset button for judges.
- No investment recommendations anywhere.

### Priorities
- **P0:** Setup + avatar + path; Log screen; rules engine + levels; category budgets and warnings; Story screen with events and "why" lines; Summary with charts; Loan simulator and active loan; Savings goals; lesson pop-ups; stranded and debt-spiral events; demo data + reset; disclaimer footer.
- **P1 in order:** 1 day/night toggle, 2 per-entry reactions, 3 recurring entries, 4 insight tips, 5 Learn page, 6 monthly recap, 7 guided onboarding, 8 badges.
- **Milestones:** M1 data model + rules + unit tests. M2 Setup, Log, Summary. M3 Story screen, scenes, events. M4 Budgets, Loan, Goals. M5 Lessons, demo data, reset. M6 P1 items. After each milestone the app must run without errors.

### Structure
- All business logic in `lib/` as pure functions (no React, no browser APIs) with unit tests (Vitest or Jest).
- Folders: `lib/` (rules, loan, budgets, recurring, events, badges, insights, lessons data, demo), `components/` (Sprite, Scene, UI kit), `app/` (routes: setup, story, log, summary, loan, goals, learn, recap, settings).
- Handle empty or corrupted storage by showing Setup, never a crash.

### Data model

| Entity | Fields |
|---|---|
| Profile | name, avatar {hairColor, outfitColor}, path (corporate / business / freelancer), openingBalance, createdAt, onboardingDone, theme (system / day / night) |
| Category | id, name, defaultTag (need / want), isCustom, monthlyLimit (optional) |
| Transaction | id, type (income / expense), categoryId (expenses), tag (need / want, expenses only), amount (> 0), date, note, source (manual / recurring / loan) |
| Recurring | id, type, categoryId, tag, amount, frequency (daily / weekly / monthly), startDate, endDate (optional), active, lastPostedDate |
| Loan (max 1 active) | principal, annualRatePct, months, startDate, active |
| Goal | id, name, targetAmount, createdDate, reachedDate (optional) |
| Badge | id, unlockedDate |
| LessonSeen | lessonId, firstShownDate |
| Meta | lastSeenLevel, lastRecapMonth, version |

Default categories: Food (need), Rent (need), Transport (need), Bills (need), Health (need), Shopping (want), Fun (want), Other (want), Loan EMI (need, system, auto-added with a loan), Salary (income label only). Custom categories: user names them and picks need or want. A category with transactions cannot be deleted (rename only).

### Screens

| Screen | Contents | Tier |
|---|---|---|
| Setup | Name; avatar designer (live preview); career path; opening balance; then onboarding | P0 |
| Story (home) | Scene, character, level title, balance, speech box with event line, "why" line, active goal bar, lesson pop-up, budget warning strip | P0 |
| Log | Form: type, date, category, need/want tag, amount, note. Recent list with delete. On save run reactions and events | P0 |
| Summary | Income vs expenses, savings rate, category split, needs vs wants, budget bars, up to 3 insight tips (P1) | P0 |
| Budgets | Monthly limit per category; bars: green under 80%, amber 80-99%, red 100%+ | P0 |
| Loan | Simulator (principal, annual rate, months) showing EMI, total interest, total payable, EMI-to-income. Take loan, schedule summary, close loan | P0 |
| Goals | Add goal (name, target), progress bar, reached celebration | P0 |
| Learn | All 8 lessons by book; unlocked shown, locked greyed with trigger hint | P1 |
| Recap | Monthly recap: income, expenses, savings rate, top category, level change, best moment | P1 |
| Settings | Switch path, edit avatar, theme, recurring manager (P1), replay intro (P1), load demo, reset all (confirm) | P0 |

### Rules engine (pure functions, level is derived on every render, never stored)

| Quantity | Definition |
|---|---|
| balance | openingBalance + total income - total expenses, for transactions dated up to today |
| netSavings | total income - total expenses (all time, excludes opening balance) |
| avgMonthlyIncome | total income / number of calendar months that contain income (minimum 1) |
| savedMonths | netSavings / avgMonthlyIncome (0 when no income). Can be negative |
| monthlySavingsRate | (income - expenses) / income for a calendar month (0 if no income) |
| wantsShare | expenses tagged want / total expenses for the month |
| EMI | P·r·(1+r)^n / ((1+r)^n - 1), r = annualRatePct / 12 / 100. If r is 0, EMI = P / n |
| Total interest | EMI·n - P. Total payable = EMI·n |
| EMI-to-income | EMI / avgMonthlyIncome |
| Goal progress | max(0, net savings since goal createdDate), capped at target. Reached when progress >= target; set reachedDate once |
| Loan EMI posting | While a loan is active, auto-post one expense per month on the loan's start day (category Loan EMI, tag need, source loan) for each month up to today. Never post twice for the same month |
| Streak | Consecutive days (ending today or yesterday) with at least one logged entry |

Level thresholds (constants in one file, easy to tune):

| Level | savedMonths | Meaning |
|---|---|---|
| L1 | below 1 (includes negative) | Just starting |
| L2 | 1 to under 3 | One month of income saved |
| L3 | 3 to under 6 | Solid buffer |
| L4 | 6 to under 12 | Strong cushion |
| L5 | 12 or more | Top of the ladder (game continues) |

Validate inputs: amounts must be positive numbers; reject empty categories.

### Budgets
- Spent = this month's expenses in that category. Green below 80%, amber 80-99% ("almost there"), red 100%+ ("over budget").
- Saving an expense that crosses 80% or 100% shows a toast and a story reaction. Summary and Story show a compact strip of amber/red categories.

### Recurring entries (P1)
- Frequencies daily, weekly, monthly. Optional end date; active toggle.
- On app load and date change, generate every due occurrence up to today (source = recurring), update lastPostedDate. Must be idempotent.
- Monthly recurrence on day 29-31 posts on the last day of shorter months.
- Manager in Settings: add, pause, delete (deleting does not remove past entries).

### Events (show the highest priority that applies)

| Pri | Event | Condition | Scene | Effect |
|---|---|---|---|---|
| 1 | Debt spiral | balance below 0, or EMI-to-income above 40% | Bank | Displayed level drops by one (min L1). 3-step recovery plan: cut the top want category, pause new wants, stick to the EMI plan |
| 2 | Stranded | balance 0 or below, no spiral | Bus stop | Character cannot afford the ride home. Show what to fix first |
| 3 | Goal reached | a goal just reached target | Celebration | Confetti, goal marked reached, badge check |
| 4 | Promotion | level higher than lastSeenLevel | Workplace | New title; update lastSeenLevel |
| 5 | Loan taken | loan just created | Bank | Show EMI, total interest, EMI-to-income |
| 6 | Default | none of the above | Home | Current title and a quip |

Event lines: Stranded "The bus driver says ₹0 is not a fare. {name} is now powerwalking home." Debt spiral "The EMI has joined every meal like an uninvited guest. Time for a recovery plan." Goal reached "Goal unlocked! The cart says Pay now and the wallet finally says okay." Promotion "Level up! {name}'s ID card just got a shinier photo." Loan taken "The bank smiled very politely. That was the interest rate talking." Default "{name} is home, snacking responsibly."

"Why" line format: always state the rule and the user's number, e.g. "You have saved 1.2 months of income, and 1 month earns Level 2." or "Food is at 91% of its ₹5,500 limit this month."

Per-entry reactions (P1), priority: budget red, budget amber, low balance, income, want expense, need expense.
- Income: Happy, "Money in! {name} does a tiny victory dance."
- Need expense: Neutral, "Needs paid. Adulting +1."
- Want expense: Side-eye, "Fun purchase! {name} noticed. The wallet noticed too."
- Category 80%+: Worried, "{category} is at {pct}%. Maybe a lighter week?"
- Category over limit: Worried, "{category} is over budget. The piggy bank raised one eyebrow."
- Balance under 10% of avg monthly income: Sad, "Wallet feels light. Easy on the next one."

### Level titles

| Level | Corporate job | Business owner | Freelancer / creator |
|---|---|---|---|
| L1 | Guard | Street vendor | Gig starter |
| L2 | Clerk | Stall owner | Freelancer |
| L3 | Analyst | Shopkeeper | Specialist |
| L4 | Manager | Business owner | Agency owner |
| L5 | CEO | Tycoon | Creative mogul |

Switching path changes titles, props and the workplace scene only. Level and history stay.

### Lessons (8, original wording, credit line "Inspired by <Book>", never copy book text)

| # | Title (book) | Card text | Trigger |
|---|---|---|---|
| 1 | Pay Yourself First (The Richest Man in Babylon) | Before the rent and before the samosas, move a slice of every income into savings. Treat it like a bill you owe your future self. | First income logged; monthly savings rate under 10% |
| 2 | Assets vs Liabilities (Rich Dad Poor Dad) | An asset puts money in your pocket; a liability takes it out. A loan EMI is a liability, so check what it buys before you sign. | Loan taken |
| 3 | Wants Add Up (Rich Dad Poor Dad) | Small wants feel tiny one by one, but they stack like pancakes. Pay needs and savings first, then enjoy the wants. | Wants above 30% of a month's spending |
| 4 | Know Your Enough (The Psychology of Money) | Chasing more without knowing what is enough is a treadmill with no stop button. Decide what a good month looks like and aim there. | First promotion |
| 5 | Margin of Safety (The Psychology of Money) | Life loves surprises, and not the cake kind. A buffer of about a month of expenses turns emergencies into inconveniences. | Stranded; or balance below one month of average expenses |
| 6 | Tiny Habits (Atomic Habits) | Big change grows from tiny actions repeated often, like logging one expense a day. Make it easy and the streak builds itself. | First goal created; 7-day streak |
| 7 | Systems Beat Goals (Atomic Habits) | A goal says what you want; a system says what you do every week. Automate saving and recurring bills so willpower can nap. | First recurring entry; goal reached |
| 8 | Interest Cuts Both Ways (The Psychology of Money) | Compounding can grow your savings or your debt. On a loan, the longer it runs, the more interest you pay. | Debt spiral |

Each lesson unlocks when its trigger first fires, appears once as a pop-up card, and is always available on the Learn page.

### Badges (P1)
First Step (first entry), First ₹1,000 (net savings reaches ₹1,000), Week Streak (7 days), Habit Builder (30 days), Budget Keeper (completed month with no category over limit, at least one limit set), Need-Want Master (completed month with wants at or below 30%), Goal Getter (first goal reached), Loan Cleared (loan paid off without a debt spiral), Rising Star (Level 3), Summit (Level 5), Comeback Kid (left a debt spiral or stranded state). Show a badge toast on unlock and a badge shelf on Story or Settings.

### Insight tips (P1, Summary page; rule-based, show up to 3, in this order, each states its number)
1. Any category at 100%+ of its limit. 2. EMI-to-income above 40%. 3. Monthly savings rate below 10%. 4. Wants above 30% of spending. 5. One category above 35% of spending. 6. Balance under one month of average expenses. 7. No income logged this month. 8. Savings rate 20% or more (praise).

### Demo data (for judges)
- Profile: Name "Demo", Corporate path, opening balance ₹5,000, default avatar colours.
- Window: the 3 calendar months ending today.
- Income: Salary ₹35,000 on the 1st of each month.
- Monthly expenses: Rent ₹6,000 (2nd); Food ₹5,000 over about 8 entries; Transport ₹1,200; Bills ₹1,000; Shopping ₹1,500; Fun ₹1,500 (small variation allowed).
- Loan: ₹50,000 at 12% for 12 months, started on the 1st of two months ago. EMI about ₹4,442, total interest about ₹3,309. EMIs auto-posted.
- Budgets: Rent ₹6,000; Food ₹5,500; Transport ₹1,500; Bills ₹1,200; Shopping ₹2,000; Fun ₹2,000.
- Goal: Laptop, target ₹70,000, created on the 1st of two months ago (about 60% progress).
- Expected: about ₹14,400 saved per month, about 1.2 months of income saved, so Level 2 (Clerk). Current-month Food near 90% (amber). No stranded or spiral state.

### Guided onboarding (P1)
Five steps, character speaks in a dialog box, skippable, replayable from Settings: 1 Hello ("Hi, I'm {name}. I'm broke-ish but hopeful. Help me out?"), 2 Why log, 3 Opening balance, 4 First income (guided form), 5 First budget (suggest Food, explain colours).

### Done-when checklist
Setup survives refresh; stranded or spiral shows with a correct "why" line; crossing a savedMonths threshold shows promotion and updates title; budget amber at 80% and red at 100% with warning; loan EMI matches the formula and posts monthly without duplicates, EMI above 40% triggers the spiral; a goal at 100% celebrates and is marked reached once; switching path changes titles/props only; demo load and reset both work and demo lands on Level 2; `lib/` has passing unit tests (EMI, levels, budgets, goal progress, recurring idempotency, streaks); all P1 items.

### BIOS statement mapping (for the slides)
Teaches saving: savings-based levels, goals, pay-yourself-first lesson. Teaches budgeting: category limits, warnings, needs vs wants. Teaches loans: EMI simulator, interest shown, debt-spiral recovery. Responsible spending: need/want tags, wants-share rule, reactions. Understand income and expenses: Summary screen. Personalised guidance: "why" lines tied to the user's numbers, insight tips, book-inspired lessons.

---

## 5. Visual spec (condensed, kept parts)

These still apply, unless section 3 above overrides them.

- **Frame:** wood plank frame (wood light with dark 3 px edge, stone corner studs) around every page. Inner panels stone-dark `#3A3F47` with a 2 px lighter border; text cream. Charts sit on a slightly lighter stone slab.
- **Buttons:** wood plank with a hard 3 px drop shadow; hover raises 1 px; pressed lowers 2 px. Primary actions gold text on wood. Destructive (Reset) red stone button.
- **Inputs:** dark inset slots, 2 px stone border; focus gold border; errors red border plus a character bubble.
- **Back to town:** pixel arrow button at the top left of every page. **Toasts:** small wooden signs sliding in from the top right for 2.5 s.
- **Tables/lists:** alternating stone rows; need chip green, want chip amber.
- **Fonts:** headings Press Start 2P, body VT323 (or mono fallback).
- **HUD bar (40 px):** name and title, coin + balance, goal bar, heart + savings rate, budget dots, mute and gear. **Text box:** 96 px tall, ink background, gold 3 px border, name tab in gold, blinking arrow, cream VT323 22 px, 2 lines.
- **Character:** blocky person, 8 x 16 px on a 480 x 270 grid (head 4x4, body 4x6, arms 2x6, legs 2x6, hair block on top). Hair and shirt colours from the avatar; skin `#F1C27D`; trousers `#3A4A9A`; shoes ink. Faces: neutral, happy, worried, sad, side-eye, celebrating. Idle bob and blink; walk 4 frames; celebrate jump.
- **Weather:** sunny (saving), neutral, light drizzle (overspending), stranded (dusk-grey, bus stop sign, empty wallet icon, sad face), debt spiral (storm clouds, heavy rain, red cracks on the Bank, soft lightning every 8 s). Reduced motion turns rain and clouds static and removes lightning.
- **Day/night:** two palettes as CSS variables, crossfade 1.5 s. Night: sky `#0B1230` to `#2A3A7A`, water `#1F4F9A`, windows glow `#FFD86B`, moon `#F3F1D8`.
- **Level growth:** same 7 buildings; height grows with level (L1 about 1-2 blocks up to L5 about 5-6) with brighter colours and extras (lamps, flowers, fences, fountain, gold trim). Level-up cutscene stacks new blocks one at a time (under 2.5 s).
- **Animation timings:** slide to building 0.6 s; typewriter 28 chars/s; goal reached jump 0.5 s + Vault glow; page open 0.2 s; day to night 1.5 s.
- **Visual build order:** V1 static island + 7 buildings, V2 character + HUD + text box, V3 live badges, hover signs and idle animations, V4 weather and day/night, V5 level growth + cutscene, V6 wood-and-stone UI kit + block-stack charts + icons. If time is short, cut cutscene first, then rain animation, then slide.
- **Interaction ideas from the spec:** each building is clickable (invisible polygon, 2 px yellow outline on hover/focus); names show on hover in a small wooden sign; live badges float above buildings; building to screen mapping: Home = Summary-ish home, Bank = Loan, Market = Budgets, Work = Log, Vault = Goals, Town hall = Badges, School = Learn.

The earlier spec also mentioned an "Interface v2" and "refinement addendum" PDF. They were not part of this chat's uploads, so only what is written above is known.

---

## 6. How the town code works (so you can edit it)

- One `<svg>` with a `<script>` that builds all shapes as strings.
- `P(x, y, z)` converts grid coordinates to screen coordinates using the global offsets `tx`, `ty` and scale `k`:
  `X = x*k + tx`, `Y = y*k + ty`, screen x = `ox + (X - Y) * W`, screen y = `oy + (X + Y) * W / 2 - z * k * Hh`.
- `box(x, y, z, dx, dy, dz, color)` draws a block with 3 faces. `dl(...)` draws a flat decal on a front-left face, `dr(...)` on a front-right face.
- Each building is its own function (`home`, `work`, `townhall`, `vault`, `market`, `school`, `bank`) written in local coordinates, then placed with `tx`, `ty`, `k`.
- Objects are sorted by `x + y` of their position and drawn back to front, so nearer things cover farther ones.
- To move a building, change its `tx`/`ty` in the `add(...)` lines near the end. To change road or plaza shapes, edit the `road(...)` and `poly(...)` lines in the ground section.
- For the real app, port this to a React component that returns the same SVG (keep colours as CSS variables for day/night and level growth), and grow building heights by level.

---

## 7. Open questions for later

- Which building opens which page (suggested mapping is in section 5).
- Exact sprite style for the character in the new soft-blocky look (needs a drawing at town scale).
- Whether the town should rotate or stay fixed (current choice: fixed).

---

## 8. Final town code (reference)

Save this as `town.html` and open it in a browser to see the final island exactly as shown in the chat.

```html
<svg id="town" width="100%" viewBox="0 0 680 480" role="img" style="display:block">
<title>Hustle town, polished</title>
<desc>A compact floating grass island with edged dirt roads connecting every door, a cobblestone plaza with a small well in the middle, a river and wooden bridge on the right, a stepped dirt underside, and a few flowers, bushes, trees and a short fence at the front entrance.</desc>
<rect x="0" y="0" width="680" height="160" fill="#9AD8FF"/>
<rect x="0" y="160" width="680" height="160" fill="#B5E3FF"/>
<rect x="0" y="320" width="680" height="160" fill="#CFEEFF"/>
<g fill="#FFFFFF" opacity=".92"><rect x="40" y="36" width="84" height="14"/><rect x="60" y="24" width="44" height="12"/><rect x="540" y="50" width="90" height="14"/><rect x="566" y="38" width="44" height="12"/></g>
<g id="scene"></g>
</svg>
<script>
var W=28,Hh=24,ox=320,oy=125,tx=0,ty=0,k=1,s='',labs=[];
function P(x,y,z){var X=x*k+tx,Y=y*k+ty;return [ox+(X-Y)*W, oy+(X+Y)*W/2-z*k*Hh];}
function pts(a){return a.map(function(p){var q=P(p[0],p[1],p[2]);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');}
function sh(h,f){var n=parseInt(h.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;function d(v){return Math.round(v*(1-f));}return '#'+[d(r),d(g),d(b)].map(function(v){return ('0'+v.toString(16)).slice(-2);}).join('');}
function poly(a,f,w){s+='<polygon points="'+pts(a)+'" fill="'+f+'" stroke="'+f+'" stroke-width="'+(w===undefined?2:w)+'" stroke-linejoin="round"/>';}
function box(x,y,z,dx,dy,dz,c,cs){var x1=x+dx,y1=y+dy,z1=z+dz;var t=c,l=sh(c,.12),r=sh(c,.24);if(cs){t=cs[0];l=cs[1];r=cs[2];}
poly([[x,y1,z],[x1,y1,z],[x1,y1,z1],[x,y1,z1]],l);
poly([[x1,y,z],[x1,y1,z],[x1,y1,z1],[x1,y,z1]],r);
poly([[x,y,z1],[x1,y,z1],[x1,y1,z1],[x,y1,z1]],t);}
function dl(x0,x1,y,z0,z1,f){poly([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],f,1.2);}
function dr(y0,y1,x,z0,z1,f){poly([[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],f,1.2);}
function lab(t,x,y){var q=P(x,y,0);labs.push([q[0],q[1]+12,t]);}
function G(){tx=0;ty=0;k=1;}
function tree(x,y){G();box(x,y,0,.25,.25,.7,'#A27140');box(x-.3,y-.3,.7,.85,.85,.7,'#5DB84A');box(x-.15,y-.15,1.4,.55,.55,.4,'#79CE5E');}
function bush(x,y){G();box(x,y,0,.5,.5,.4,'#5DB84A');box(x+.08,y+.08,.4,.34,.34,.15,'#79CE5E');}
function lamp(x,y){G();box(x,y,0,.1,.1,1.0,'#6E747E');box(x-.05,y-.05,1.0,.2,.2,.22,'#FFE27A');}
function fence(x0,x1){G();for(var x=x0;x<=x1+.01;x+=.45){box(x,9.5,0,.1,.1,.4,'#C98F4E');}box(x0,9.53,.2,x1-x0+.1,.04,.07,'#E0B070');}
function winL(x0,x1,z0,z1,y){dl(x0-.06,x1+.06,y+.01,z0-.08,z1+.08,'#FFF6E0');dl(x0,x1,y+.02,z0,z1,'#A9DCF7');}
function winR(y0,y1,z0,z1,x){dr(y0-.06,y1+.06,x+.01,z0-.08,z1+.08,'#F2E7C9');dr(y0,y1,x+.02,z0,z1,'#8CC6E8');}

function home(){box(1,1,0,2,2,1.4,'#D9A05E');dl(1.7,2.3,3.01,0,1,'#A9763F');dl(1.15,1.55,3.01,.5,1,'#A9DCF7');dl(2.45,2.85,3.01,.5,1,'#A9DCF7');dr(1.5,2.5,3.01,.5,1,'#8CC6E8');box(.8,.8,1.4,2.4,2.4,.4,'#EE6A5E');box(1.2,1.2,1.8,1.6,1.6,.4,'#EE6A5E');box(2.3,1.3,2.2,.35,.35,.6,'#B4BAC4');}
function work(){box(1,1,0,2,2,3.4,'#9ED6F5');[.5,1.3,2.1,2.9].forEach(function(z){dl(1.2,1.75,3.01,z,z+.5,'#E0F4FF');dl(2.25,2.8,3.01,z,z+.5,'#E0F4FF');dr(1.2,1.75,3.01,z,z+.5,'#E0F4FF');dr(2.25,2.8,3.01,z,z+.5,'#E0F4FF');});dl(1.75,2.25,3.01,0,.45,'#6A7078');box(1.2,1.4,3.4,1.6,.25,.5,'#FFD95A');}
function townhall(){box(.3,1.0,0,3.4,2.4,.3,'#F0EAD6');box(1.4,3.4,0,1.2,.4,.15,'#FFF6E0');box(.6,1.3,.3,2.8,1.7,1.6,'#E3E6EB');
dl(1.0,1.45,3.01,.75,1.5,'#A9DCF7');dl(2.55,3.0,3.01,.75,1.5,'#A9DCF7');dl(1.85,2.15,3.01,.3,1.3,'#A9763F');
[.65,1.55,2.2,3.1].forEach(function(x){box(x,3.0,.3,.25,.25,1.6,'#FFF6E0');});
box(.5,1.2,1.9,3.0,2.3,.5,'#B4BAC4');dl(.65,3.35,3.51,1.95,2.35,'#D9A05E');
box(.9,1.6,2.4,2.2,1.5,.25,'#DDE0E6');box(1.3,1.7,2.65,1.4,1.1,.5,'#E3E6EB');dl(1.8,2.2,2.81,2.72,3.08,'#FFF6E0');dl(1.98,2.02,2.82,2.8,3.02,'#6A7078');
box(1.45,1.8,3.15,1.1,.9,.4,'#4C6FFF');box(1.7,1.95,3.55,.6,.6,.3,'#4C6FFF');box(1.96,2.15,3.85,.08,.08,.7,'#8A9099');dl(2.04,2.5,2.19,4.2,4.5,'#EE6A5E');}
function vault(){box(.6,.6,0,2.8,2.8,.5,'#DDE0E6');box(.9,.9,.5,2.2,2.2,2.0,'#B4BAC4');box(.9,3.1,.5,.3,.3,2.0,'#DDE0E6');box(2.8,3.1,.5,.3,.3,2.0,'#DDE0E6');
dl(1.45,2.55,3.11,.6,2.0,'#FFD95A');dl(1.55,2.45,3.12,.7,1.9,'#6A7078');dl(1.9,2.1,3.13,1.15,1.45,'#FFD95A');
box(.8,.8,2.5,2.4,2.4,.3,'#8E949C');box(1.3,1.3,2.8,1.4,1.4,.6,'#A9763F');box(1.25,1.25,3.4,1.5,1.5,.3,'#C98F4E');box(1.75,1.25,2.8,.25,1.5,.95,'#FFD95A');}
function market(){box(.5,.7,0,3.0,2.7,.2,'#E8E2CC');box(.6,.8,.2,2.8,.4,1.8,'#C98F4E');box(.6,.8,.2,.35,2.4,1.8,'#B67F41');
box(1.1,2.2,.2,2.1,.7,.6,'#C98F4E');box(1.05,2.15,.8,2.2,.8,.1,'#E0B070');box(1.25,2.4,.9,.5,.5,.3,'#EE6A5E');box(1.9,2.4,.9,.5,.5,.3,'#F4B63A');box(2.55,2.4,.9,.5,.5,.3,'#79CE5E');
box(.55,3.05,.2,.16,.16,1.8,'#8A5A2B');box(3.3,3.05,.2,.16,.16,1.8,'#8A5A2B');dl(1.1,2.9,3.12,1.2,1.65,'#C98F4E');
for(var i=0;i<6;i++){var c=i%2?'#FFF6E0':'#EE6A5E';box(.45+i*.5,.65,2.0,.5,2.75,.3,c);box(.45+i*.5,3.4,1.75,.5,.15,.25,c);}}
function school(){box(.5,1.2,0,3.0,1.8,1.6,'#F6D84A');dl(.75,1.25,3.01,.5,1.2,'#A9DCF7');dl(2.75,3.25,3.01,.5,1.2,'#A9DCF7');dr(1.5,2.0,3.51,.5,1.2,'#E0B93A');dr(2.2,2.7,3.51,.5,1.2,'#E0B93A');
box(1.4,3.0,0,1.2,.4,1.4,'#F6D84A');box(1.3,2.95,1.4,1.4,.55,.2,'#EE6A5E');dl(1.8,2.2,3.41,0,.9,'#EE6A5E');dl(1.8,2.2,3.42,1.0,1.3,'#FFF6E0');
box(.4,1.1,1.6,3.2,2.0,.3,'#EE6A5E');box(1.5,1.5,1.9,1.0,1.0,1.0,'#E3E6EB');dl(1.75,2.25,2.51,2.15,2.75,'#6A7078');dl(1.9,2.1,2.52,2.3,2.65,'#FFD95A');
box(1.4,1.4,2.9,1.2,1.2,.3,'#EE6A5E');box(1.85,1.85,3.2,.3,.3,.3,'#FFD95A');}
function bank(){box(1.3,.8,0,4.4,3.4,.4,'#F0EAD6');box(2.7,4.2,0,1.6,.6,.2,'#FFF6E0');box(2.7,4.2,.2,1.6,.3,.2,'#FFF6E0');box(1.6,1.1,.4,3.8,2.8,2.6,'#E3E6EB');
winR(1.9,2.7,1.2,2.4,5.4);winL(2.15,2.65,1.2,2.4,3.9);winL(4.35,4.85,1.2,2.4,3.9);dl(3.15,3.85,3.91,.4,1.9,'#A9763F');
[1.65,2.85,3.85,5.05].forEach(function(x){box(x,3.9,.4,.3,.3,2.6,'#FFF6E0');});
box(1.4,.9,3,4.2,3.4,.5,'#B4BAC4');dl(2.3,4.7,4.31,3.05,3.45,'#D9A05E');box(2,1.5,3.5,3,2.4,.4,'#DDE0E6');box(3,2.3,3.9,1,.25,1,'#FFD95A');dl(3.15,3.85,2.56,4.05,4.75,'#EAC24A');dl(3.3,3.7,2.57,4.2,4.6,'#FFD95A');
[1.45,5.45].forEach(function(x){box(x,4,3.5,.09,.09,1.3,'#8A9099');dl(x+.1,x+.9,4.05,4.35,4.8,'#EE6A5E');});}

G();
box(.5,.5,-1.1,9.4,8.6,.6,'#9A6A3A',['#9A6A3A','#85592F','#6B4524']);
box(1.6,1.5,-1.7,6.6,6.0,.6,'#8B5E34',['#8B5E34','#7A5230','#5E3C1F']);
box(0,0,-.5,11.2,9.8,.5,'#8FD672',['#8FD672','#A27140','#85592F']);
for(var i=0;i<10;i++)for(var j=0;j<9;j++){if((i+j)%2){poly([[i,j,0],[i+1,j,0],[i+1,j+1,0],[i,j+1,0]],'#86D068',0);}}
poly([[10.25,0,0],[10.4,0,0],[10.4,9.8,0],[10.25,9.8,0]],'#C9A86A',0);
poly([[10.4,0,0],[11.2,0,0],[11.2,9.8,0],[10.4,9.8,0]],'#59B9F2',0);
poly([[10.4,0,0],[10.7,0,0],[10.7,9.8,0],[10.4,9.8,0]],'#4AA9E8',0);
[1.2,4.4,7.6].forEach(function(y){poly([[10.65,y,0],[11.05,y,0],[11.05,y+.25,0],[10.65,y+.25,0]],'#A8E0FC',0);});
function road(x0,x1,y0,y1){poly([[x0-.05,y0-.05,0],[x1+.05,y0-.05,0],[x1+.05,y1+.05,0],[x0-.05,y1+.05,0]],'#C4A36A',0);poly([[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0]],'#DDBE88',0);}
road(.8,10.4,3.05,3.45);road(.8,9.9,6.55,6.95);road(5.15,5.45,6.3,9.8);road(5.15,5.45,3.45,3.7);
road(1.85,2.15,2.7,3.05);road(5.15,5.45,2.7,3.05);road(8.45,8.75,2.7,3.05);road(1.85,2.15,5.9,6.55);road(8.45,8.75,6.5,6.6);
function peb(x,y){poly([[x,y,0],[x+.12,y,0],[x+.12,y+.1,0],[x,y+.1,0]],'#C8CDD4',0);}
for(var x=1.2;x<10;x+=.9){peb(x,3.15);peb(x+.45,3.3);}
for(var x=1.2;x<9.5;x+=.9){peb(x,6.65);peb(x+.45,6.8);}
poly([[3.9,3.6,0],[6.7,3.6,0],[6.7,6.4,0],[3.9,6.4,0]],'#9AA0A8',0);
for(var i=0;i<2;i++)for(var j=0;j<2;j++){poly([[4.0+1.3*i,3.7+1.3*j,0],[5.3+1.3*i,3.7+1.3*j,0],[5.3+1.3*i,5.0+1.3*j,0],[4.0+1.3*i,5.0+1.3*j,0]],((i+j)%2?'#DCDFE4':'#C2C7CF'),0);}
box(4.95,4.65,0,.7,.7,.3,'#B4BAC4');poly([[5.05,4.75,.3],[5.55,4.75,.3],[5.55,5.25,.3],[5.05,5.25,.3]],'#59B9F2',0);
box(10.0,3.0,0,1.2,.5,.15,'#C98F4E');for(var i=0;i<4;i++){box(10.1+i*.3,3.0,.15,.05,.5,.01,'#A9763F');}
box(10.0,3.0,.15,1.2,.07,.22,'#8A5A2B');box(10.0,3.43,.15,1.2,.07,.22,'#8A5A2B');
function fl(x,y,c){box(x,y,0,.12,.12,.14,c);box(x+.2,y+.12,0,.12,.12,.14,'#FFF6E0');}
fl(3.3,2.2,'#EE6A5E');fl(6.95,1.9,'#F4B63A');fl(3.9,7.6,'#EE6A5E');fl(6.4,7.7,'#F4B63A');fl(4.6,9.0,'#FFF6E0');fl(.3,8.9,'#EE6A5E');fl(9.9,9.2,'#F4B63A');
var items=[];
function add(key,fn){items.push([key,fn]);}
add(.7,function(){tx=.4;ty=.3;k=.8;work();lab('Work',2,3.7);});
add(4.0,function(){tx=3.7;ty=.3;k=.8;townhall();lab('Town hall',2,4.0);});
add(7.3,function(){tx=7.0;ty=.3;k=.8;vault();lab('Vault',2,3.8);});
add(3.9,function(){tx=.4;ty=3.5;k=.8;home();lab('Home',2,3.7);});
add(9.9,function(){tx=6.43;ty=3.5;k=.62;bank();lab('Bank',3.5,5.4);});
add(7.1,function(){tx=.4;ty=6.7;k=.8;market();lab('Market',2,3.9);});
add(13.7,function(){tx=7.0;ty=6.7;k=.8;school();lab('School',2,3.9);});
add(12.9,function(){tree(4.3,8.4);});add(14.4,function(){tree(6.2,8.4);});
add(10.3,function(){lamp(3.9,6.4);});add(13.1,function(){lamp(6.6,6.4);});
add(9.1,function(){bush(3.3,5.8);});add(12.6,function(){bush(3.3,9.0);});add(16,function(){bush(6.6,9.1);});
add(13.5,function(){fence(3.9,4.9);});add(15.4,function(){fence(5.8,6.8);});
items.sort(function(a,b){return a[0]-b[0];});
items.forEach(function(it){it[1]();});
labs.forEach(function(l){var w=l[2].length*6.6+14;s+='<rect x="'+(l[0]-w/2).toFixed(0)+'" y="'+(l[1]-11).toFixed(0)+'" width="'+w.toFixed(0)+'" height="17" rx="3" fill="#FFF6E0" opacity=".9"/><text x="'+l[0].toFixed(0)+'" y="'+(l[1]+1).toFixed(0)+'" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="500" fill="#2B3440">'+l[2]+'</text>';});
document.getElementById('scene').innerHTML=s;
</script>
```

---

## 9. What to say in the new chat

Paste this file, then pick one:

1. "Fold everything into the visual design spec as v2 (PDF), using the town art and UI decisions in this file."
2. "Continue the question round: Summary page layout, Loan simulator page, Goals page, Learn page lesson cards, with a picture sketch of each."
3. "Draw the character sprite in the soft-blocky style, with the 6 faces and the avatar colour presets."
4. "Turn the town code into a Next.js React component, with building height growing by level and a day/night toggle."
