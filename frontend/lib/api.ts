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
    user_id: string;
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
    user_id: string;
  }>("/getMatchHistory", {
    method: "POST",
  });
}

