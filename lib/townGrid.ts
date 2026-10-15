// Hustle Town 0.25-unit Walking Grid and Pathfinding Engine (Prompt 2)

export const GRID_STEP = 0.25;
export const ISLAND_MIN_X = 0;
export const ISLAND_MAX_X = 12.6;
export const ISLAND_MIN_Y = 0;
export const ISLAND_MAX_Y = 11.4;

export const W = 28;
export const Hh = 24;
export const ox = 320;
export const oy = 125;

export interface Point2D {
  x: number;
  y: number;
}

export const STAND_POINTS: Record<string, Point2D> = {
  work: { x: 2.0, y: 3.3 },
  townhall: { x: 5.3, y: 3.3 },
  vault: { x: 8.6, y: 3.3 },
  home: { x: 2.0, y: 6.4 },
  bank: { x: 8.6, y: 6.4 },
  market: { x: 2.0, y: 9.7 },
  school: { x: 8.6, y: 9.7 },
};

// Convert screen / SVG user space coords (px, py) to ground grid coords (x, y, z=0)
export function screenToWorld(px: number, py: number): Point2D {
  const a = (px - ox) / W;
  const b = (2 * (py - oy)) / W;
  const X = (a + b) / 2;
  const Y = (b - a) / 2;
  return { x: X, y: Y };
}

// Convert ground grid coords (x, y, z) to screen coords
export function worldToScreen(x: number, y: number, z = 0): [number, number] {
  return [ox + (x - y) * W, oy + ((x + y) * W) / 2 - z * Hh];
}

export interface BuildingDoorDef {
  id: string;
  name: string;
  route: string;
  doorX: number;
  doorY: number;
  trigger: (x: number, y: number) => boolean;
}

export const BUILDING_DOORS: BuildingDoorDef[] = [
  {
    id: 'work',
    name: 'Work',
    route: '/work',
    doorX: 2.0,
    doorY: 2.5,
    trigger: (x, y) => x >= 1.7 && x <= 2.3 && y >= 2.2 && y <= 2.6,
  },
  {
    id: 'townhall',
    name: 'Town Hall',
    route: '/townhall',
    doorX: 5.3,
    doorY: 2.5,
    trigger: (x, y) => x >= 5.0 && x <= 5.6 && y >= 2.2 && y <= 2.6,
  },
  {
    id: 'vault',
    name: 'Vault',
    route: '/vault',
    doorX: 8.6,
    doorY: 2.5,
    trigger: (x, y) => x >= 8.3 && x <= 8.9 && y >= 2.2 && y <= 2.6,
  },
  {
    id: 'home',
    name: 'Home',
    route: '/story',
    doorX: 2.0,
    doorY: 5.6,
    trigger: (x, y) => x >= 1.7 && x <= 2.3 && y >= 5.3 && y <= 5.8,
  },
  {
    id: 'bank',
    name: 'Bank',
    route: '/bank',
    doorX: 8.6,
    doorY: 6.0,
    trigger: (x, y) => x >= 8.3 && x <= 8.9 && y >= 5.7 && y <= 6.1,
  },
  {
    id: 'market',
    name: 'Market',
    route: '/market',
    doorX: 2.0,
    doorY: 9.2,
    trigger: (x, y) => x >= 1.7 && x <= 2.3 && y >= 8.9 && y <= 9.35,
  },
  {
    id: 'school',
    name: 'School',
    route: '/school',
    doorX: 8.6,
    doorY: 9.2,
    trigger: (x, y) => x >= 8.3 && x <= 8.9 && y >= 8.9 && y <= 9.35,
  },
];

export function getBuildingAtDoor(x: number, y: number): BuildingDoorDef | null {
  for (const b of BUILDING_DOORS) {
    if (b.trigger(x, y)) {
      return b;
    }
  }
  return null;
}

// Check if a point is strictly on the walkable road, plaza, or building door entrances
export function isRoadOrPlaza(x: number, y: number): boolean {
  // Main horizontal road & east bank: y in [3.0, 3.5]
  if (y >= 2.95 && y <= 3.55 && ((x >= 0.75 && x <= 10.05) || (x >= 11.4 && x <= 12.35))) {
    return true;
  }
  // Bridge: x in [10.0, 11.45], y in [3.0, 3.5]
  if (x >= 9.95 && x <= 11.5 && y >= 2.95 && y <= 3.55) {
    return true;
  }
  // Lower horizontal road: y in [6.5, 7.0], x in [0.8, 9.9]
  if (y >= 6.45 && y <= 7.05 && x >= 0.75 && x <= 9.95) {
    return true;
  }
  // Vertical spine: x in [5.1, 5.5], y in [7.0, 11.4] & link [3.5, 3.7]
  if (x >= 5.05 && x <= 5.55 && ((y >= 6.95 && y <= 11.45) || (y >= 3.45 && y <= 3.75))) {
    return true;
  }
  // Front road to Market and School: y in [9.6, 10.0], x in [1.8, 8.8]
  if (y >= 9.55 && y <= 10.05 && x >= 1.75 && x <= 8.85) {
    return true;
  }
  // Stubs & Doorway entrances to buildings
  // Work: x in [1.75, 2.25], y from 2.2 to 3.05
  if (x >= 1.75 && x <= 2.25 && y >= 2.2 && y <= 3.05) {
    return true;
  }
  // Town hall: x in [5.05, 5.55], y from 2.2 to 3.05
  if (x >= 5.05 && x <= 5.55 && y >= 2.2 && y <= 3.05) {
    return true;
  }
  // Vault: x in [8.35, 8.85], y from 2.2 to 3.05
  if (x >= 8.35 && x <= 8.85 && y >= 2.2 && y <= 3.05) {
    return true;
  }
  // Home: x in [1.75, 2.25], y from 5.3 && 6.55
  if (x >= 1.75 && x <= 2.25 && y >= 5.3 && y <= 6.55) {
    return true;
  }
  // Bank: x in [8.35, 8.85], y from 5.7 && 6.65
  if (x >= 8.35 && x <= 8.85 && y >= 5.7 && y <= 6.65) {
    return true;
  }
  // Market: x in [1.75, 2.25], y from 8.9 && 9.65
  if (x >= 1.75 && x <= 2.25 && y >= 8.9 && y <= 9.65) {
    return true;
  }
  // School: x in [8.35, 8.85], y from 8.9 && 9.65
  if (x >= 8.35 && x <= 8.85 && y >= 8.9 && y <= 9.65) {
    return true;
  }
  // Cobblestone Plaza: [3.9, 6.7] x [3.6, 6.4] (except well)
  if (x >= 3.85 && x <= 6.75 && y >= 3.55 && y <= 6.45) {
    if (x >= 4.9 && x <= 5.7 && y >= 4.6 && y <= 5.4) {
      return false; // Well
    }
    return true;
  }

  return false;
}

export const isWalkableRoad = isRoadOrPlaza;

// Check if a point is blocked by buildings, water, scenery, fences, etc.
export function isBlocked(x: number, y: number): boolean {
  // Island boundaries
  if (x < ISLAND_MIN_X || x > ISLAND_MAX_X || y < ISLAND_MIN_Y || y > ISLAND_MAX_Y) {
    return true;
  }

  // 1. Building Footprints (doorway entrances carved out so sprite can walk in)
  // Work: [1.15, 2.8] x [1.2, 2.85] (doorway at [1.75, 2.25] x [2.2, 2.85])
  if (x >= 1.15 && x <= 2.8 && y >= 1.2 && y <= 2.85) {
    if (x >= 1.75 && x <= 2.25 && y >= 2.2) return false;
    return true;
  }
  // Town hall: [4.14, 6.86] x [0.8, 2.72] (doorway at [5.05, 5.55] x [2.2, 2.72])
  if (x >= 4.14 && x <= 6.86 && y >= 0.8 && y <= 2.72) {
    if (x >= 5.05 && x <= 5.55 && y >= 2.2) return false;
    return true;
  }
  // Vault: [7.78, 10.02] x [1.38, 3.1] (doorway at [8.35, 8.85] x [2.2, 3.1])
  if (x >= 7.78 && x <= 10.02 && y >= 1.38 && y <= 3.1) {
    if (x >= 8.35 && x <= 8.85 && y >= 2.2) return false;
    return true;
  }
  // Home: [1.7, 3.3] x [4.0, 5.8] (doorway at [1.75, 2.25] x [5.3, 5.8])
  if (x >= 1.7 && x <= 3.3 && y >= 4.0 && y <= 5.8) {
    if (x >= 1.75 && x <= 2.25 && y >= 5.3) return false;
    return true;
  }
  // Bank: [6.74, 9.46] x [4.4, 6.25] (doorway at [8.35, 8.85] x [5.7, 6.25])
  if (x >= 6.74 && x <= 9.46 && y >= 4.4 && y <= 6.25) {
    if (x >= 8.35 && x <= 8.85 && y >= 5.7) return false;
    return true;
  }
  // Market: [1.4, 3.8] x [7.16, 9.35] (doorway at [1.75, 2.25] x [8.9, 9.35])
  if (x >= 1.4 && x <= 3.8 && y >= 7.16 && y <= 9.35) {
    if (x >= 1.75 && x <= 2.25 && y >= 8.9) return false;
    return true;
  }
  // School: [7.25, 9.65] x [7.6, 9.35] (doorway at [8.35, 8.85] x [8.9, 9.35])
  if (x >= 7.25 && x <= 9.65 && y >= 7.6 && y <= 9.35) {
    if (x >= 8.35 && x <= 8.85 && y >= 8.9) return false;
    return true;
  }

  // 2. Plaza Well: [4.95, 5.65] x [4.65, 5.35]
  if (x >= 4.9 && x <= 5.7 && y >= 4.6 && y <= 5.4) return true;

  // 3. River: x in [10.4, 11.2], except bridge strip [3.0, 3.5]
  if (x >= 10.35 && x <= 11.25 && !(y >= 2.95 && y <= 3.55)) {
    return true;
  }

  // 4. Front Lawn Pond: [7.45, 9.95] x [10.15, 11.15]
  if (x >= 7.4 && x <= 10.0 && y >= 10.1 && y <= 11.2) return true;

  // 5. Trees (trunk radius 0.22)
  const trees: Point2D[] = [
    { x: 11.7, y: 1.3 },
    { x: 11.8, y: 5.0 },
    { x: 11.6, y: 8.0 },
    { x: 1.2, y: 10.3 },
    { x: 2.3, y: 10.6 },
    { x: 6.2, y: 10.5 },
  ];
  for (const t of trees) {
    if (Math.hypot(x - t.x, y - t.y) < 0.28) return true;
  }

  // 6. Bushes
  const bushes: Point2D[] = [
    { x: 0.6, y: 4.8 },
    { x: 7.3, y: 4.8 },
  ];
  for (const b of bushes) {
    if (Math.hypot(x - b.x, y - b.y) < 0.35) return true;
  }

  // 7. Lamps
  const lamps: Point2D[] = [
    { x: 3.7, y: 5.9 },
    { x: 6.9, y: 5.9 },
    { x: 12.2, y: 3.6 },
    { x: 4.8, y: 11.05 },
    { x: 5.65, y: 11.05 },
  ];
  for (const l of lamps) {
    if (Math.hypot(x - l.x, y - l.y) < 0.22) return true;
  }

  // 8. Fences at y = 11.1 (x in [0.5, 4.6] and [6.0, 10.1])
  if (Math.abs(y - 11.1) < 0.18) {
    if ((x >= 0.45 && x <= 4.65) || (x >= 5.95 && x <= 10.15)) {
      return true;
    }
  }

  // 9. East Bank Bench: [11.6, 12.3] x [6.2, 6.45]
  if (x >= 11.55 && x <= 12.35 && y >= 6.15 && y <= 6.5) return true;

  return false;
}

// Find nearest walkable point if clicked point is blocked
export function findNearestWalkable(targetX: number, targetY: number): Point2D {
  // Clamp inside island bounds
  const clampedX = Math.max(ISLAND_MIN_X + 0.1, Math.min(ISLAND_MAX_X - 0.1, targetX));
  const clampedY = Math.max(ISLAND_MIN_Y + 0.1, Math.min(ISLAND_MAX_Y - 0.1, targetY));

  if (!isBlocked(clampedX, clampedY)) {
    return { x: clampedX, y: clampedY };
  }

  // Search in expanding concentric rings
  for (let r = GRID_STEP; r <= 3.5; r += GRID_STEP) {
    const steps = Math.max(8, Math.round(2 * Math.PI * r / GRID_STEP));
    for (let s = 0; s < steps; s++) {
      const angle = (2 * Math.PI * s) / steps;
      const qx = Math.round((clampedX + r * Math.cos(angle)) / GRID_STEP) * GRID_STEP;
      const qy = Math.round((clampedY + r * Math.sin(angle)) / GRID_STEP) * GRID_STEP;
      if (!isBlocked(qx, qy)) {
        return { x: qx, y: qy };
      }
    }
  }

  // Fallback to central plaza
  return { x: 5.3, y: 5.0 };
}

// 8-Directional A* Pathfinding over 0.25-unit grid
export function findAStarPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number
): Point2D[] {
  const start = findNearestWalkable(startX, startY);
  const target = findNearestWalkable(targetX, targetY);

  if (Math.hypot(start.x - target.x, start.y - target.y) < 0.1) {
    return [target];
  }

  const toKey = (gx: number, gy: number) => `${gx}_${gy}`;
  const startGx = Math.round(start.x / GRID_STEP);
  const startGy = Math.round(start.y / GRID_STEP);
  const targetGx = Math.round(target.x / GRID_STEP);
  const targetGy = Math.round(target.y / GRID_STEP);

  const openSet = new Set<string>();
  const startKey = toKey(startGx, startGy);
  openSet.add(startKey);

  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const heuristic = (gx: number, gy: number) => {
    const dx = Math.abs(gx - targetGx);
    const dy = Math.abs(gy - targetGy);
    // Octile distance
    return ((dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy)) * GRID_STEP * 0.6;
  };

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startGx, startGy));

  const directions = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];

  let iterations = 0;
  const maxIterations = 3000;

  while (openSet.size > 0 && iterations++ < maxIterations) {
    // Find node in openSet with lowest fScore
    let currentKey = '';
    let minF = Infinity;
    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < minF) {
        minF = f;
        currentKey = key;
      }
    }

    if (!currentKey) break;

    const [cgx, cgy] = currentKey.split('_').map(Number);
    if (cgx === targetGx && cgy === targetGy) {
      // Reconstruct path
      const path: Point2D[] = [];
      let curr: string | undefined = currentKey;
      while (curr) {
        const [px, py] = curr.split('_').map(Number);
        path.push({ x: px * GRID_STEP, y: py * GRID_STEP });
        curr = cameFrom.get(curr);
      }
      path.reverse();
      // Snap exact start and target coordinates
      if (!isBlocked(startX, startY)) {
        path[0] = { x: startX, y: startY };
      }
      if (!isBlocked(targetX, targetY)) {
        path[path.length - 1] = { x: targetX, y: targetY };
      }
      return smoothPath(path);
    }

    openSet.delete(currentKey);
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const [dx, dy] of directions) {
      const ngx = cgx + dx;
      const ngy = cgy + dy;
      const wx = ngx * GRID_STEP;
      const wy = ngy * GRID_STEP;

      if (isBlocked(wx, wy)) continue;

      // Diagonal corner-cutting check
      if (dx !== 0 && dy !== 0) {
        if (isBlocked(cgx * GRID_STEP, (cgy + dy) * GRID_STEP) || isBlocked((cgx + dx) * GRID_STEP, cgy * GRID_STEP)) {
          continue;
        }
      }

      const isDiag = dx !== 0 && dy !== 0;
      const baseDist = (isDiag ? Math.SQRT2 : 1.0) * GRID_STEP;
      const cellCost = isRoadOrPlaza(wx, wy) ? 0.6 : 1.0;
      const tentativeG = currentG + baseDist * cellCost;

      const neighborKey = toKey(ngx, ngy);
      const neighborG = gScore.get(neighborKey) ?? Infinity;

      if (tentativeG < neighborG) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(ngx, ngy));
        openSet.add(neighborKey);
      }
    }
  }

  // Fallback direct path to target if A* fails
  return [start, target];
}

// Check line-of-sight between two points for path smoothing
export function hasLineOfSight(p1: Point2D, p2: Point2D): boolean {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (dist < 0.05) return true;
  const steps = Math.ceil(dist / 0.1);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    if (isBlocked(x, y)) return false;
  }
  return true;
}

// Smooth path by skipping nodes with clear line of sight
export function smoothPath(path: Point2D[]): Point2D[] {
  if (path.length <= 2) return path;

  const smoothed: Point2D[] = [path[0]];
  let currentIdx = 0;

  while (currentIdx < path.length - 1) {
    let furthestIdx = currentIdx + 1;
    for (let testIdx = path.length - 1; testIdx > currentIdx + 1; testIdx--) {
      if (hasLineOfSight(path[currentIdx], path[testIdx])) {
        furthestIdx = testIdx;
        break;
      }
    }
    smoothed.push(path[furthestIdx]);
    currentIdx = furthestIdx;
  }

  return smoothed;
}
