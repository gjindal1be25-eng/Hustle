import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  isBlocked,
  isRoadOrPlaza,
  isWalkableRoad,
  getBuildingAtDoor,
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

  it('strictly restricts walkable road to road, plaza and doorways, disallowing grass and water', () => {
    // On roads & plaza:
    expect(isWalkableRoad(5.3, 3.25)).toBe(true); // Main road intersection
    expect(isWalkableRoad(2.0, 3.25)).toBe(true); // Road outside Work
    expect(isWalkableRoad(10.8, 3.25)).toBe(true); // Bridge
    expect(isWalkableRoad(5.3, 6.0)).toBe(true); // Plaza
    expect(isWalkableRoad(5.3, 9.8)).toBe(true); // Front road
    expect(isWalkableRoad(2.0, 2.5)).toBe(true); // Work doorway

    // Off road (grass, water, pond, well):
    expect(isWalkableRoad(0.5, 0.5)).toBe(false); // Grass corner
    expect(isWalkableRoad(5.3, 5.0)).toBe(false); // Well in plaza
    expect(isWalkableRoad(10.8, 1.0)).toBe(false); // River
    expect(isWalkableRoad(8.5, 10.6)).toBe(false); // Lawn pond
    expect(isWalkableRoad(3.0, 8.0)).toBe(false); // Lawn grass between roads

    // Building door triggers:
    expect(getBuildingAtDoor(2.0, 2.5)?.id).toBe('work');
    expect(getBuildingAtDoor(5.3, 2.5)?.id).toBe('townhall');
    expect(getBuildingAtDoor(8.6, 2.5)?.id).toBe('vault');
    expect(getBuildingAtDoor(2.0, 5.6)?.id).toBe('home');
    expect(getBuildingAtDoor(8.6, 6.0)?.id).toBe('bank');
    expect(getBuildingAtDoor(2.0, 9.2)?.id).toBe('market');
    expect(getBuildingAtDoor(8.6, 9.2)?.id).toBe('school');
    expect(getBuildingAtDoor(5.3, 6.0)).toBeNull(); // Plaza is not a doorway
  });
});
