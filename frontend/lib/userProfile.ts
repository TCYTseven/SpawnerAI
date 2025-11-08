import { supabase } from "./supabase";

export interface UserProfile {
  riot_name?: string;
  riot_id?: string;
  steam_id?: string;
}

export async function saveUserProfile(profile: UserProfile): Promise<{ error: Error | null; success?: boolean }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return { error: new Error("User not authenticated") };
    }

    console.log("Saving user profile:", { user_id: user.id, profile });

    // Only include fields that are actually provided (not undefined or empty)
    const profileData: any = {
      user_id: user.id,
    };

    // Only add fields that have actual values (not empty strings)
    if (profile.riot_name !== undefined && profile.riot_name.trim() !== "") {
      profileData.riot_name = profile.riot_name.trim();
    }
    if (profile.riot_id !== undefined && profile.riot_id.trim() !== "") {
      profileData.riot_id = profile.riot_id.trim();
    }
    if (profile.steam_id !== undefined && profile.steam_id.trim() !== "") {
      profileData.steam_id = profile.steam_id.trim();
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        profileData,
        {
          onConflict: "user_id",
        }
      )
      .select();

    if (error) {
      console.error("Error saving user profile to Supabase:", error);
      return { error: new Error(error.message || "Failed to save profile") };
    }

    console.log("Successfully saved user profile:", data);
    return { error: null, success: true };
  } catch (err) {
    console.error("Exception in saveUserProfile:", err);
    return { error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

export async function getUserProfile(): Promise<{
  profile: UserProfile | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { profile: null, error: new Error("User not authenticated") };
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return { profile: data, error: null };
  } catch (err) {
    return {
      profile: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

