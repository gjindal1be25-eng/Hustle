# Hustle — Retro Isometric RPG Financial Manager

> **BIOS Hackathon V2, CORE Track, Problem Statement 2**  
> Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Web Audio API.  
> Complies with **Final Build Specification v14** and **Change Request v15 (CR v15)**.

---

## 🎮 Concept Overview

**Hustle** transforms daily personal finance into an intuitive, responsive pixel RPG. Your financial health directly drives your town's skyline, climate, and personal story:
- **Floating Island Town**: Soft pastel isometric town rendered with zero external game engines (pure SVG).
- **Movement & Roads (CR v15)**: Walk with Arrow keys or WASD exclusively along edged dirt roads. Press `Enter` or `Space` to enter any building at its door, or click any building to automatically walk the shortest path.
- **Calm Stone Panels**: Maximum 720px wide centered panels (`#3A3F47` background, 2px `#4B515A` border), one primary wood/gold button, two plain wood tabs per page, and capped 5-row lists with "Show all".
- **Dynamic Scenery & Weather**:
  - **Level Growth**: Buildings grow in height as your savings cushion increases from 1 to 12+ months.
  - **Weather States**: Sunny skies in safety, dramatic storm rain if in a debt spiral, and twilight dusk if stranded.
  - **Day / Night Crossfade**: Switch between daytime and night palettes in the top HUD.
- **Financial Wisdom**: 8 book-inspired lesson scrolls drawing from *The Psychology of Money*, *Atomic Habits*, *Rich Dad Poor Dad*, and *The Richest Man in Babylon*.

---

## 🏛️ Town Buildings & Features

| Building | Anchor $(x, y)$ | Main Action (Top) | Tab 1 | Tab 2 |
| :--- | :--- | :--- | :--- | :--- |
| **Work** | $(1.6, 3.6)$ | Log Income Form | Log (5 rows) | Recurring (P1) |
| **Market** | $(2.6, 9.5)$ | Log Expense Form | Log (5 rows) | Budgets |
| **Bank** | $(8.1, 6.8)$ | Loan Simulator with live result | Simulator | Active Loan |
| **Vault** | $(8.9, 3.9)$ | Goal Cards with progress | Active Goals | Reached Goals |
| **School** | $(8.2, 9.15)$ | Wisdom Scroll Cards | Unlocked | Locked |
| **Town Hall** | $(5.5, 2.8)$ | 4 KPI Summary Chips | Summary | Recap & Badges |
| **Home (Diary)** | $(2.5, 6.1)$ | Latest Event & "Why" Line | Overview | Lessons |
| **Settings** | Gear in HUD | Career Switcher & Avatar Editor | Profile | Data (Demo & Reset) |

---

## ⌨️ Controls & Navigation

- **Arrow Keys / WASD**: Walk along dirt roads (3 tiles per second).
- **Enter / Space**: Enter a building when standing at its door.
- **Mouse Click on Building**: Finds shortest path via BFS road graph, walks the hero to the door, and opens the page.
- **Tab / Shift+Tab**: Full accessible keyboard focus order across all interactive building hitboxes.
- **Mute / SFX Toggle**: In the top HUD bar (`🔇 MUTE` / `🔊 SFX`).

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npm test
```
*Runs Vitest pure-function test suite covering all 17 financial rule formulas (balance, savings cushion, EMI, goal progress, level thresholds, and streaks).*

Run production build:
```bash
npm run build
```
*Compiles all 12 Next.js App Router static pages with zero TypeScript or lint errors.*

Run local development server:
```bash
npm run dev
```
*Available at [http://localhost:3000](http://localhost:3000).*

---

## 📜 Disclaimer

Educational simulation tool. Not financial advice. All state is stored locally inside your browser's `localStorage` (`hustle_v1`).
