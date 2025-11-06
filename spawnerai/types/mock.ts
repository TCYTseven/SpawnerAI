// Mock data types for Spawner AI

export interface Player {
  id: string;
  username: string;
  region: string;
  preferredRole?: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  playstyleTags: {
    fortnite?: string[];
    valorant?: string[];
    apex?: string[];
  };
  behaviors: {
    aggression: number; // 0-100
    positioning: number;
    utility: number;
    clutch: number;
    awareness: number;
  };
  roleAffinity: {
    Top: number;
    Jungle: number;
    Mid: number;
    ADC: number;
    Support: number;
  };
}

export interface Champion {
  id: string;
  name: string;
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  tags: string[];
  fitScore: number; // 0-100
  portrait?: string;
}

export interface Squad {
  id: string;
  name: string;
  members: Player[];
  synergyScore: number; // 0-100
  synergyMatrix: number[][]; // NxN matrix
  compSuggestions: CompSuggestion[];
}

export interface CompSuggestion {
  id: string;
  top: Champion;
  jungle: Champion;
  mid: Champion;
  adc: Champion;
  support: Champion;
  rationale: string[];
  teamMeters: {
    engage: number;
    peel: number;
    pick: number;
    scaling: number;
  };
}

export interface SimulationState {
  selectedPlayerId?: string;
  targetRole?: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  biases: {
    moreEngage: boolean;
    morePeel: boolean;
    moreScaling: boolean;
  };
  previewAffinity: {
    Top: number;
    Jungle: number;
    Mid: number;
    ADC: number;
    Support: number;
  };
  previewChampions: Champion[];
}

// Mock data generators
export const mockPlayers: Player[] = [
  {
    id: "1",
    username: "PlayerOne",
    region: "NA",
    preferredRole: "Mid",
    playstyleTags: {
      valorant: ["Duelist", "Aggressive"],
      apex: ["Fragger", "Entry"],
    },
    behaviors: {
      aggression: 85,
      positioning: 70,
      utility: 40,
      clutch: 90,
      awareness: 75,
    },
    roleAffinity: {
      Top: 20,
      Jungle: 30,
      Mid: 95,
      ADC: 60,
      Support: 15,
    },
  },
  {
    id: "2",
    username: "PlayerTwo",
    region: "NA",
    preferredRole: "Support",
    playstyleTags: {
      valorant: ["Controller", "Support"],
      fortnite: ["Builder", "Support"],
    },
    behaviors: {
      aggression: 30,
      positioning: 85,
      utility: 95,
      clutch: 50,
      awareness: 90,
    },
    roleAffinity: {
      Top: 15,
      Jungle: 20,
      Mid: 25,
      ADC: 30,
      Support: 95,
    },
  },
];

export const mockChampions: Champion[] = [
  {
    id: "yasuo",
    name: "Yasuo",
    role: "Mid",
    tags: ["Engage", "Scaling"],
    fitScore: 92,
  },
  {
    id: "thresh",
    name: "Thresh",
    role: "Support",
    tags: ["Peel", "Engage"],
    fitScore: 88,
  },
  {
    id: "jinx",
    name: "Jinx",
    role: "ADC",
    tags: ["Scaling", "Carry"],
    fitScore: 75,
  },
  {
    id: "jax",
    name: "Jax",
    role: "Top",
    tags: ["Scaling", "Split"],
    fitScore: 70,
  },
  {
    id: "lee",
    name: "Lee Sin",
    role: "Jungle",
    tags: ["Engage", "Early"],
    fitScore: 65,
  },
  {
    id: "orianna",
    name: "Orianna",
    role: "Mid",
    tags: ["Utility", "Scaling"],
    fitScore: 60,
  },
  {
    id: "zed",
    name: "Zed",
    role: "Mid",
    tags: ["Engage", "Carry"],
    fitScore: 85,
  },
  {
    id: "darius",
    name: "Darius",
    role: "Top",
    tags: ["Engage", "Carry"],
    fitScore: 80,
  },
  {
    id: "graves",
    name: "Graves",
    role: "Jungle",
    tags: ["Carry", "Early"],
    fitScore: 75,
  },
  {
    id: "caitlyn",
    name: "Caitlyn",
    role: "ADC",
    tags: ["Scaling", "Carry"],
    fitScore: 72,
  },
  {
    id: "leona",
    name: "Leona",
    role: "Support",
    tags: ["Engage", "Peel"],
    fitScore: 68,
  },
  {
    id: "garen",
    name: "Garen",
    role: "Top",
    tags: ["Scaling", "Split"],
    fitScore: 65,
  },
  {
    id: "amumu",
    name: "Amumu",
    role: "Jungle",
    tags: ["Engage", "Utility"],
    fitScore: 62,
  },
  {
    id: "lux",
    name: "Lux",
    role: "Mid",
    tags: ["Utility", "Scaling"],
    fitScore: 58,
  },
  {
    id: "ashe",
    name: "Ashe",
    role: "ADC",
    tags: ["Utility", "Scaling"],
    fitScore: 55,
  },
  {
    id: "soraka",
    name: "Soraka",
    role: "Support",
    tags: ["Peel", "Utility"],
    fitScore: 52,
  },
];

export const mockSquad: Squad = {
  id: "squad-1",
  name: "My Squad",
  members: mockPlayers,
  synergyScore: 78,
  synergyMatrix: [
    [100, 75],
    [75, 100],
  ],
  compSuggestions: [
    {
      id: "comp-1",
      top: mockChampions[3],
      jungle: mockChampions[4],
      mid: mockChampions[0],
      adc: mockChampions[2],
      support: mockChampions[1],
      rationale: [
        "Strong engage potential with Yasuo + Thresh combo",
        "Scaling comp that peaks mid-to-late game",
        "Balanced team with good peel and damage",
      ],
      teamMeters: {
        engage: 85,
        peel: 70,
        pick: 60,
        scaling: 80,
      },
    },
  ],
};

// Helper functions
export function calculateRoleAffinity(
  behaviors: Player["behaviors"],
  tags: string[],
): Player["roleAffinity"] {
  // Deterministic calculation based on behaviors and tags
  const aggression = behaviors.aggression;
  const utility = behaviors.utility;
  const positioning = behaviors.positioning;

  return {
    Top: Math.min(100, Math.round(aggression * 0.4 + positioning * 0.3 + utility * 0.3)),
    Jungle: Math.min(100, Math.round(aggression * 0.5 + positioning * 0.2 + utility * 0.3)),
    Mid: Math.min(100, Math.round(aggression * 0.6 + positioning * 0.2 + utility * 0.2)),
    ADC: Math.min(100, Math.round(aggression * 0.5 + positioning * 0.4 + utility * 0.1)),
    Support: Math.min(100, Math.round(aggression * 0.2 + positioning * 0.3 + utility * 0.5)),
  };
}

export function getChampionsForRole(
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support",
  count: number = 5,
): Champion[] {
  return mockChampions
    .filter((champ) => champ.role === role)
    .slice(0, count)
    .map((champ) => ({
      ...champ,
      fitScore: Math.floor(Math.random() * 30) + 70, // 70-100
    }));
}

