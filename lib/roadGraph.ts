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
  work_door: { id: 'work_door', x: 2.0, y: 3.3, buildingId: 'work', neighbors: { right: 'w_j1' } },
  w_j1: { id: 'w_j1', x: 2.6, y: 3.3, neighbors: { left: 'work_door', right: 'w_j2' } },
  w_j2: { id: 'w_j2', x: 4.0, y: 3.3, neighbors: { left: 'w_j1', right: 'j_back' } },
  j_back: { id: 'j_back', x: 5.3, y: 3.3, neighbors: { left: 'w_j2', right: 'v_j1', up: 'townhall_door', down: 'p_north' } },
  townhall_door: { id: 'townhall_door', x: 5.3, y: 3.0, buildingId: 'townhall', neighbors: { down: 'j_back' } },
  
  v_j1: { id: 'v_j1', x: 7.0, y: 3.3, neighbors: { left: 'j_back', right: 'j_vault' } },
  j_vault: { id: 'j_vault', x: 8.6, y: 3.3, neighbors: { left: 'v_j1', up: 'vault_door', right: 'bridge_j' } },
  vault_door: { id: 'vault_door', x: 8.6, y: 3.0, buildingId: 'vault', neighbors: { down: 'j_vault' } },
  bridge_j: { id: 'bridge_j', x: 10.0, y: 3.3, neighbors: { left: 'j_vault' } },

  // --- Plaza Area (Center) ---
  p_north: { id: 'p_north', x: 5.3, y: 3.7, neighbors: { up: 'j_back', down: 'p_center' } },
  p_center: { id: 'p_center', x: 5.3, y: 5.0, neighbors: { up: 'p_north', down: 'p_south', left: 'p_west', right: 'p_east' } },
  p_south: { id: 'p_south', x: 5.3, y: 6.4, neighbors: { up: 'p_center', down: 'j_front_mid', left: 'p_west', right: 'p_east' } },
  p_west: { id: 'p_west', x: 4.0, y: 6.4, neighbors: { right: 'p_south', left: 'home_j' } },
  p_east: { id: 'p_east', x: 6.8, y: 6.4, neighbors: { left: 'p_south', right: 'bank_j' } },

  // --- Home Spur ---
  home_j: { id: 'home_j', x: 3.0, y: 6.4, neighbors: { right: 'p_west', left: 'home_door' } },
  home_door: { id: 'home_door', x: 2.0, y: 6.4, buildingId: 'home', neighbors: { right: 'home_j' } },

  // --- Bank Spur ---
  bank_j: { id: 'bank_j', x: 7.5, y: 6.4, neighbors: { left: 'p_east', right: 'bank_door' } },
  bank_door: { id: 'bank_door', x: 8.6, y: 6.4, buildingId: 'bank', neighbors: { left: 'bank_j' } },

  // --- Front Road & South Doors ---
  j_front_mid: { id: 'j_front_mid', x: 5.3, y: 7.0, neighbors: { up: 'p_south', down: 'j_front' } },
  j_front: { id: 'j_front', x: 5.3, y: 9.8, neighbors: { up: 'j_front_mid', left: 'm_j1', right: 's_j1' } },
  
  m_j1: { id: 'm_j1', x: 3.5, y: 9.8, neighbors: { right: 'j_front', left: 'market_door' } },
  market_door: { id: 'market_door', x: 2.0, y: 9.7, buildingId: 'market', neighbors: { right: 'm_j1' } },

  s_j1: { id: 's_j1', x: 7.0, y: 9.8, neighbors: { left: 'j_front', right: 'school_door' } },
  school_door: { id: 'school_door', x: 8.6, y: 9.7, buildingId: 'school', neighbors: { left: 's_j1' } },
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
