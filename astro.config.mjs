import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import supabase from "@astrojs/supabase";

export default defineConfig({
  integrations: [tailwind(), supabase()],
  vite: {
    define: {
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(import.meta.env.PUBLIC_SUPABASE_URL),
      'process.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(import.meta.env.PUBLIC_SUPABASE_ANON_KEY)
    }
  }
});
