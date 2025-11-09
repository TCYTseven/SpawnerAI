import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  message: string;
  status?: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    // Get the current session token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        data: null,
        error: {
          message: "Not authenticated. Please log in.",
          status: 401,
        },
      };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));

      return {
        data: null,
        error: {
          message: errorData.detail || errorData.message || "An error occurred",
          status: response.status,
        },
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function getAffinity() {
  return apiRequest<{ 
    dota2: {
      affinity: any;
      match_count: number;
    } | null;
    league: {
      affinity: any;
      match_count: number;
    } | null;
    user_email: string;
  }>("/getAffinity", {
    method: "POST",
  });
}

export async function getMatchHistory() {
  return apiRequest<{ 
    dota2: {
      progression: Array<{
        month: string;
        month_key: string;
        affinity: any;
        match_count: number;
      }>;
      total_matches: number;
    } | null;
    league: {
      progression: Array<{
        month: string;
        month_key: string;
        affinity: any;
        match_count: number;
      }>;
      total_matches: number;
    } | null;
    user_email: string;
  }>("/getMatchHistory", {
    method: "POST",
  });
}

export async function getSynergy(otherUserEmail: string) {
  return apiRequest<{
    synergy: {
      dota2?: {
        synergy: number;
        reasoning: string;
      };
      league?: {
        synergy: number;
        reasoning: string;
      };
    };
    other_user_email: string;
    current_user_email: string;
  }>("/getSynergy", {
    method: "POST",
    body: JSON.stringify({
      other_user_email: otherUserEmail,
    }),
  });
}

export async function getSquadMembers() {
  return apiRequest<{
    members: Array<{
      email: string;
      riot_name?: string;
      riot_id?: string;
      is_self: boolean;
    }>;
  }>("/getSquadMembers", {
    method: "POST",
  });
}

export async function addSquadMember(email: string) {
  return apiRequest<{
    message: string;
    email: string;
    riot_name?: string;
    riot_id?: string;
    is_self: boolean;
  }>("/addSquadMember", {
    method: "POST",
    body: JSON.stringify({
      other_user_email: email,
    }),
  });
}

export async function getSuggestedRole(email: string) {
  return apiRequest<{
    email: string;
    suggested_role: string;
    affinity: {
      offense: number;
      tank: number;
      support: number;
      scout: number;
      hybrid: number;
    } | null;
  }>("/getSuggestedRole", {
    method: "POST",
    body: JSON.stringify({
      other_user_email: email,
    }),
  });
}

export async function checkProfileExists() {
  return apiRequest<{
    has_profile: boolean;
    message: string;
  }>("/checkProfileExists", {
    method: "POST",
  });
}

export async function initializeUserProfile(data: {
  riot_name?: string;
  riot_id?: string;
  steam_id?: string;
}) {
  return apiRequest<{
    success: boolean;
    message: string;
    email: string;
  }>("/initializeUserProfile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function saveOnboardingData(data: {
  games?: {
    apex?: string;
    csgo?: string;
    dota2?: string;
  };
  fortnite?: {
    gamemode?: string;
    role?: string;
    years?: string;
    competitive?: boolean;
  };
  valorant?: {
    agent?: string;
    mode?: string;
    role?: string;
    years?: string;
    competitive?: boolean;
  };
  league?: {
    champion?: string;
    mode?: string;
    role?: string;
    years?: string;
    competitive?: boolean;
  };
}) {
  return apiRequest<{
    success: boolean;
    message: string;
    email: string;
  }>("/saveOnboardingData", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRiotUpdates() {
  return apiRequest<{
    success: boolean;
    patches: Array<{
      title: string;
      publishedAt: string;
      description: string;
      media: {
        url: string;
        colors: {
          primary?: string;
          secondary?: string;
        };
      };
      action: {
        type: string;
        url: string;
      };
      analytics: {
        publishDate: string;
        contentId: string;
      };
      category: string;
    }>;
    total: number;
  }>("/getRiotUpdates", {
    method: "GET",
  });
}

export async function analyzePatch(data: {
  patch_title: string;
  patch_description?: string;
  patch_url?: string;
  compare_with_previous?: boolean;
}) {
  return apiRequest<{
    success: boolean;
    patch_title: string;
    top_champions: Array<{
      champion_id: string;
      games: number;
    }>;
    analysis: {
      summary: string;
      champions: Array<{
        champion_id: string;
        impact: string;
        analysis: string;
        recommendations: string;
        suggested_replacements: string[];
      }>;
      meta_shift: string;
      role_impact: {
        top?: string;
        jungle?: string;
        mid?: string;
        adc?: string;
        support?: string;
      };
    };
    user_email: string;
  }>("/analyzePatch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}