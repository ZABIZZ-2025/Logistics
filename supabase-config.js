// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

// ISTRUZIONI:
// 1. Vai su https://supabase.com e crea un account
// 2. Crea un nuovo progetto chiamato "RBS Logistica"
// 3. Vai in Settings > API
// 4. Copia il "Project URL" e sostituisci qui sotto
// 5. Copia la "anon public" key e sostituisci qui sotto

const SUPABASE_CONFIG = {
    // SOSTITUISCI CON IL TUO PROJECT URL (esempio: https://xyzabcd.supabase.co)
    url: 'YOUR_SUPABASE_URL',

    // SOSTITUISCI CON LA TUA ANON KEY (esempio: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Import Supabase client library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Create Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Export for use in other modules
export { supabase, SUPABASE_CONFIG };
