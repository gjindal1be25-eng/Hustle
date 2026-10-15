import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  isBlocked,
  isRoadOrPlaza,
  findNearestWalkable,
  findAStarPath,
  STAND_POINTS,
} from './townGrid';

describe('Town Grid & Pathfinding Engine (Prompt 2)', () => {
  it('converts world coordinates to screen and back cleanly', () => {
    const testPoints = [
      { x: 5.3, y: 5.0 },
      { x: 2.0, y: 3.3 },
      { x: 11.6, y: 6.2 },
    ];

    testPoints.forEach((p) => {
      const [px, py] = worldToScreen(p.x, p.y, 0);
      const converted = screenToWorld(px, py);
      expect(converted.x).toBeCloseTo(p.x, 2);
      expect(converted.y).toBeCloseTo(p.y, 2);
    });
  });

  it('correctly marks river as blocked except at bridge', () => {
    // River at y = 1.0 (blocked)
    expect(isBlocked(10.8, 1.0)).toBe(true);
    // River at y = 8.0 (blocked)
    expect(isBlocked(10.8, 8.0)).toBe(true);
    // Bridge strip at y = 3.25 (walkable)
    expect(isBlocked(10.8, 3.25)).toBe(false);
  });

  it('correctly marks pond as blocked', () => {
    expect(isBlocked(8.5, 10.6)).toBe(true);
  });

  it('correctly marks building footprints as blocked while keeping stand points walkable', () => {
    // Work building interior
    expect(isBlocked(1.5, 2.0)).toBe(true);
    // All 7 building stand points must be walkable!
    Object.values(STAND_POINTS).forEach((pt) => {
      expect(isBlocked(pt.x, pt.y)).toBe(false);
      expect(isRoadOrPlaza(pt.x, pt.y)).toBe(true);
    });
  });

  it('finds nearest walkable point when clicking inside blocked water or building', () => {
    // Click in deep river
    const walkableFromRiver = findNearestWalkable(10.8, 1.0);
    expect(isBlocked(walkableFromRiver.x, walkableFromRiver.y)).toBe(false);

    // Click inside town hall
    const walkableFromTh = findNearestWalkable(5.5, 1.5);
    expect(isBlocked(walkableFromTh.x, walkableFromTh.y)).toBe(false);
  });

  it('finds an A* path from plaza to east bank across the bridge', () => {
    const start = { x: 5.3, y: 6.0 }; // Plaza south of well
    const destination = { x: 11.6, y: 3.3 }; // East bank across bridge

    const path = findAStarPath(start.x, start.y, destination.x, destination.y);
    expect(path.length).toBeGreaterThan(1);
    expect(path[0].x).toBeCloseTo(start.x, 1);
    expect(path[0].y).toBeCloseTo(start.y, 1);

    const end = path[path.length - 1];
    expect(end.x).toBeCloseTo(destination.x, 1);
    expect(end.y).toBeCloseTo(destination.y, 1);

    // Ensure no step on path is blocked
    path.forEach((pt) => {
      expect(isBlocked(pt.x, pt.y)).toBe(false);
    });
  });

  it('finds an A* path to every building stand point', () => {
    const start = { x: 5.3, y: 6.0 }; // Plaza south of well

    Object.values(STAND_POINTS).forEach((target) => {
      const path = findAStarPath(start.x, start.y, target.x, target.y);
      expect(path.length).toBeGreaterThan(1);
      const end = path[path.length - 1];
      expect(end.x).toBeCloseTo(target.x, 1);
      expect(end.y).toBeCloseTo(target.y, 1);
    });
  });
});
