import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: {
      // 🔥 C'EST ÇA LA MAGIE : On force Next.js à ne jamais cacher les requêtes Supabase
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
    },
  }
);