/**
 * Supabase connection settings.
 *
 * 1. Create a free project at https://supabase.com
 * 2. In the SQL editor, run schema.sql from the repo root.
 * 3. In Project Settings → API, copy the "Project URL" and the
 *    "anon public" key and paste them below.
 *
 * Until these are filled in, the site still loads and shows the full
 * schedule — you just won't be able to save status/notes yet.
 */
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
