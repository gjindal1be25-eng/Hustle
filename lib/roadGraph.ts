// Road Graph and Pathfinding for Hustle Town (CR v15 Section 1 & Section 3)

export interface RoadNode {
  id: string;
  x: number;
  y: number;
  buildingId?: 'work' | 'townhall' | 'vault' | 'home' | 'bank' | 'market' | 'school';
  neighbors: { [direction in 'up' | 'down' | 'left' | 'right']?: string };
}

// Direction definitions matching CR v15 Section 3.2:
// Up arrow / W: y minus 1 (screens up and right)
// Down arrow / S: y plus 1 (screens down and left)
// Left arrow / A: x minus 1 (screens up and left)
// Right arrow / D: x plus 1 (screens down and right)
export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export const ROAD_NODES: Record<string, RoadNode> = {
  // --- Back Road & North Doors ---
  work_door: { id: 'work_door', x: 1.6, y: 3.6, buildingId: 'work', neighbors: { right: 'w_j1' } },
  w_j1: { id: 'w_j1', x: 2.6, y: 3.6, neighbors: { left: 'work_door', right: 'w_j2' } },
  w_j2: { id: 'w_j2', x: 4.0, y: 3.6, neighbors: { left: 'w_j1', right: 'j_back' } },
  j_back: { id: 'j_back', x: 5.5, y: 3.6, neighbors: { left: 'w_j2', right: 'v_j1', up: 'townhall_door', down: 'p_north' } },
  townhall_door: { id: 'townhall_door', x: 5.5, y: 2.8, buildingId: 'townhall', neighbors: { down: 'j_back' } },
  
  v_j1: { id: 'v_j1', x: 7.0, y: 3.6, neighbors: { left: 'j_back', right: 'j_vault' } },
  j_vault: { id: 'j_vault', x: 8.9, y: 3.6, neighbors: { left: 'v_j1', down: 'vault_door', right: 'bridge_j' } },
  vault_door: { id: 'vault_door', x: 8.9, y: 3.9, buildingId: 'vault', neighbors: { up: 'j_vault' } },
  bridge_j: { id: 'bridge_j', x: 10.2, y: 3.6, neighbors: { left: 'j_vault' } },

  // --- Plaza Area (Center) ---
  p_north: { id: 'p_north', x: 5.5, y: 4.4, neighbors: { up: 'j_back', down: 'p_center' } },
  p_center: { id: 'p_center', x: 5.5, y: 5.2, neighbors: { up: 'p_north', down: 'p_south', left: 'p_west', right: 'p_east' } },
  p_south: { id: 'p_south', x: 5.5, y: 6.1, neighbors: { up: 'p_center', down: 'j_front_mid', left: 'p_west', right: 'p_east' } },
  p_west: { id: 'p_west', x: 4.0, y: 6.1, neighbors: { right: 'p_south', left: 'home_j' } },
  p_east: { id: 'p_east', x: 6.8, y: 6.1, neighbors: { left: 'p_south', right: 'bank_j' } },

  // --- Home Spur ---
  home_j: { id: 'home_j', x: 3.2, y: 6.1, neighbors: { right: 'p_west', left: 'home_door' } },
  home_door: { id: 'home_door', x: 2.5, y: 6.1, buildingId: 'home', neighbors: { right: 'home_j' } },

  // --- Bank Spur ---
  bank_j: { id: 'bank_j', x: 8.1, y: 6.1, neighbors: { left: 'p_east', down: 'bank_door' } },
  bank_door: { id: 'bank_door', x: 8.1, y: 6.8, buildingId: 'bank', neighbors: { up: 'bank_j' } },

  // --- Front Road & South Doors ---
  j_front_mid: { id: 'j_front_mid', x: 5.5, y: 7.2, neighbors: { up: 'p_south', down: 'j_front' } },
  j_front: { id: 'j_front', x: 5.5, y: 8.2, neighbors: { up: 'j_front_mid', left: 'm_j1', right: 's_j1' } },
  
  m_j1: { id: 'm_j1', x: 4.0, y: 8.2, neighbors: { right: 'j_front', left: 'j_market' } },
  j_market: { id: 'j_market', x: 2.6, y: 8.2, neighbors: { right: 'm_j1', down: 'market_door' } },
  market_door: { id: 'market_door', x: 2.6, y: 9.5, buildingId: 'market', neighbors: { up: 'j_market' } },

  s_j1: { id: 's_j1', x: 7.0, y: 8.2, neighbors: { left: 'j_front', right: 'j_school' } },
  j_school: { id: 'j_school', x: 8.2, y: 8.2, neighbors: { left: 's_j1', down: 'school_door' } },
  school_door: { id: 'school_door', x: 8.2, y: 9.15, buildingId: 'school', neighbors: { up: 'j_school' } },
};

export const BUILDING_DOOR_NODES: Record<string, string> = {
  work: 'work_door',
  townhall: 'townhall_door',
  vault: 'vault_door',
  home: 'home_door',
  bank: 'bank_door',
  market: 'market_door',
  school: 'school_door',
};

// Shortest path along road graph using BFS
export function findShortestPath(startNodeId: string, targetNodeId: string): string[] {
  if (!ROAD_NODES[startNodeId] || !ROAD_NODES[targetNodeId]) return [];
  if (startNodeId === targetNodeId) return [startNodeId];

  const queue: string[][] = [[startNodeId]];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];

    if (currentId === targetNodeId) {
      return path;
    }

    const node = ROAD_NODES[currentId];
    if (!node) continue;

    for (const nextId of Object.values(node.neighbors)) {
      if (nextId && !visited.has(nextId)) {
        visited.add(nextId);
        queue.push([...path, nextId]);
      }
    }
  }

  return [];
}
