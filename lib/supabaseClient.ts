import { createClient } from "@supabase/supabase-js";

// Normalize URL: strip trailing /rest/v1/ or any path so Storage SDK works correctly
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
