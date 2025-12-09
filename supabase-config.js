// ==========================================
// SUPABASE CONFIGURATION - VERSIONE FUNZIONANTE
// ==========================================

const SUPABASE_URL = 'https://lsknnjcgtpxykfrwlwcp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza25uamNndHB4eWtmcndsd2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjgyNTIsImV4cCI6MjA3ODIwNDI1Mn0._BHsH-2saNGgRTcMABSiw68TOVpnEE7y43zM7jpXfls';

let supabase = null;

// Inizializza Supabase con import dinamico (stesso metodo del test che funziona)
async function initSupabase() {
    if (supabase) return supabase;

    try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase inizializzato');
        return supabase;
    } catch (error) {
        console.error('❌ Errore inizializzazione Supabase:', error);
        return null;
    }
}

// Esporta la funzione e la promise
export { initSupabase, SUPABASE_URL, SUPABASE_KEY };
