import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only throw error in production or if explicitly set
// In development, we'll allow missing env vars to prevent crashes during setup
if ((!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

