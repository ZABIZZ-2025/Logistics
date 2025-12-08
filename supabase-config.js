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
    url: 'https://lsknnjcgtpxykfrwlwcp.supabase.co',

    // SOSTITUISCI CON LA TUA ANON KEY (esempio: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza25uamNndHB4eWtmcndsd2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjgyNTIsImV4cCI6MjA3ODIwNDI1Mn0._BHsH-2saNGgRTcMABSiw68TOVpnEE7y43zM7jpXfls'
};

// Import Supabase client library (esm.sh è più stabile per ESM)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create Supabase client con gestione errori
let supabase = null;
try {
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    console.log('✅ Supabase client inizializzato');
} catch (error) {
    console.error('❌ Errore inizializzazione Supabase:', error);
}

// Export for use in other modules
export { supabase, SUPABASE_CONFIG };
