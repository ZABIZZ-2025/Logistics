-- ============================================
-- RBS LOGISTICA - DIAGNOSTIC CHECK
-- ============================================
-- Esegui questo script per verificare lo stato del database
-- dopo la riattivazione di Supabase
-- ============================================

-- ============================================
-- 1. VERIFICA TABELLE ESISTENTI
-- ============================================
SELECT '========================================' AS "INFO";
SELECT '1. TABELLE ESISTENTI NEL DATABASE' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    tablename AS "Tabella",
    CASE
        WHEN tablename IN ('user_profiles', 'anagrafica', 'viaggi', 'history') THEN '✅ OK'
        ELSE '➖ Extra'
    END AS "Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. VERIFICA UTENTI IN AUTH.USERS
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '2. UTENTI IN AUTH.USERS' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    email AS "Email",
    id AS "UUID",
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "Creato",
    TO_CHAR(last_sign_in_at, 'YYYY-MM-DD HH24:MI') AS "Ultimo Login",
    confirmed_at IS NOT NULL AS "Email Confermata"
FROM auth.users
ORDER BY created_at DESC;

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '❌ NESSUN UTENTE - Crea utenti in Authentication > Users'
        WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*) || ' utenti trovati'
    END AS "Risultato"
FROM auth.users;

-- ============================================
-- 3. VERIFICA PROFILI IN USER_PROFILES
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '3. PROFILI IN USER_PROFILES' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    user_id AS "Username",
    username AS "Nome Completo",
    role AS "Ruolo",
    id AS "UUID",
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "Creato"
FROM user_profiles
ORDER BY created_at DESC;

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '❌ NESSUN PROFILO - Vedi SOLUZIONE 2'
        WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*) || ' profili trovati'
    END AS "Risultato"
FROM user_profiles;

-- ============================================
-- 4. VERIFICA CORRISPONDENZA AUTH <-> PROFILES
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '4. CORRISPONDENZA AUTH.USERS <-> USER_PROFILES' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    u.email AS "Email (auth.users)",
    p.username AS "Nome (user_profiles)",
    p.role AS "Ruolo",
    CASE
        WHEN p.id IS NULL THEN '❌ PROFILO MANCANTE'
        ELSE '✅ OK'
    END AS "Status"
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.email;

-- ============================================
-- 5. VERIFICA RLS ABILITATO
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '5. ROW LEVEL SECURITY (RLS) ABILITATO' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    relname AS "Tabella",
    CASE
        WHEN relrowsecurity THEN '✅ RLS Abilitato'
        ELSE '❌ RLS Disabilitato - Vedi SOLUZIONE 3'
    END AS "Status"
FROM pg_class
WHERE relname IN ('user_profiles', 'anagrafica', 'viaggi', 'history')
ORDER BY relname;

-- ============================================
-- 6. VERIFICA POLICY RLS
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '6. POLICY RLS SU USER_PROFILES' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    policyname AS "Nome Policy",
    cmd AS "Operazione",
    CASE
        WHEN permissive = 'PERMISSIVE' THEN '✅ Permissiva'
        ELSE 'Restrittiva'
    END AS "Tipo"
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '❌ NESSUNA POLICY - Vedi SOLUZIONE 3'
        WHEN COUNT(*) >= 5 THEN '✅ ' || COUNT(*) || ' policy trovate'
        ELSE '⚠️ Solo ' || COUNT(*) || ' policy - Potrebbero mancare alcune'
    END AS "Risultato"
FROM pg_policies
WHERE tablename = 'user_profiles';

-- ============================================
-- 7. VERIFICA POLICY RLS SU VIAGGI
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '7. POLICY RLS SU VIAGGI' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    policyname AS "Nome Policy",
    cmd AS "Operazione"
FROM pg_policies
WHERE tablename = 'viaggi'
ORDER BY cmd, policyname;

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '❌ NESSUNA POLICY - Vedi SOLUZIONE 3'
        WHEN COUNT(*) >= 6 THEN '✅ ' || COUNT(*) || ' policy trovate'
        ELSE '⚠️ Solo ' || COUNT(*) || ' policy - Potrebbero mancare alcune'
    END AS "Risultato"
FROM pg_policies
WHERE tablename = 'viaggi';

-- ============================================
-- 8. VERIFICA TRIGGER
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '8. TRIGGER SU VIAGGI' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    trigger_name AS "Nome Trigger",
    event_manipulation AS "Evento",
    action_timing AS "Timing",
    CASE
        WHEN trigger_name = 'log_viaggi_delete' AND action_timing = 'BEFORE' AND event_manipulation = 'DELETE' THEN '✅ OK'
        WHEN trigger_name = 'log_viaggi_changes' AND action_timing = 'AFTER' AND event_manipulation IN ('INSERT', 'UPDATE') THEN '✅ OK'
        ELSE '⚠️ Verifica'
    END AS "Status"
FROM information_schema.triggers
WHERE event_object_table = 'viaggi'
ORDER BY action_timing, event_manipulation;

SELECT
    CASE
        WHEN COUNT(*) < 2 THEN '❌ TRIGGER MANCANTI - Applica supabase-migration-fix-delete-trigger.sql'
        ELSE '✅ Trigger trovati'
    END AS "Risultato"
FROM information_schema.triggers
WHERE event_object_table = 'viaggi';

-- ============================================
-- 9. VERIFICA CAMPI TABELLA VIAGGI
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '9. CAMPI TABELLA VIAGGI' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    column_name AS "Campo",
    data_type AS "Tipo",
    CASE
        WHEN column_name IN ('circuito', 'merce', 'peso', 'volume', 'motivo') THEN '✅ Campo nuovo (fix creazione viaggi)'
        ELSE '➖ Campo standard'
    END AS "Status"
FROM information_schema.columns
WHERE table_name = 'viaggi'
AND column_name IN ('id', 'azienda', 'luogo', 'data', 'orario', 'circuito', 'merce', 'peso', 'volume', 'motivo', 'note', 'urgente', 'column', 'status')
ORDER BY
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'azienda' THEN 2
        WHEN 'luogo' THEN 3
        WHEN 'data' THEN 4
        WHEN 'orario' THEN 5
        WHEN 'circuito' THEN 6
        WHEN 'merce' THEN 7
        WHEN 'peso' THEN 8
        WHEN 'volume' THEN 9
        WHEN 'motivo' THEN 10
        ELSE 20
    END;

SELECT
    CASE
        WHEN COUNT(*) < 13 THEN '❌ CAMPI MANCANTI - Applica supabase-migration-add-missing-fields.sql'
        ELSE '✅ Tutti i campi presenti'
    END AS "Risultato"
FROM information_schema.columns
WHERE table_name = 'viaggi';

-- ============================================
-- 10. CONTEGGIO DATI
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT '10. CONTEGGIO DATI NELLE TABELLE' AS "CHECK";
SELECT '========================================' AS "INFO";

SELECT
    'auth.users' AS "Tabella",
    COUNT(*) AS "Record",
    CASE
        WHEN COUNT(*) = 0 THEN '❌ Nessun utente'
        ELSE '✅ ' || COUNT(*) || ' utenti'
    END AS "Status"
FROM auth.users
UNION ALL
SELECT
    'user_profiles' AS "Tabella",
    COUNT(*) AS "Record",
    CASE
        WHEN COUNT(*) = 0 THEN '❌ Nessun profilo - QUESTO CAUSA IL LOOP'
        ELSE '✅ ' || COUNT(*) || ' profili'
    END AS "Status"
FROM user_profiles
UNION ALL
SELECT
    'viaggi' AS "Tabella",
    COUNT(*) AS "Record",
    CASE
        WHEN COUNT(*) = 0 THEN '➖ Nessun viaggio'
        ELSE '✅ ' || COUNT(*) || ' viaggi'
    END AS "Status"
FROM viaggi
UNION ALL
SELECT
    'anagrafica' AS "Tabella",
    COUNT(*) AS "Record",
    CASE
        WHEN COUNT(*) = 0 THEN '➖ Nessun cliente'
        ELSE '✅ ' || COUNT(*) || ' clienti'
    END AS "Status"
FROM anagrafica;

-- ============================================
-- RIEPILOGO FINALE
-- ============================================
SELECT '';
SELECT '========================================' AS "INFO";
SELECT 'RIEPILOGO DIAGNOSTICA' AS "INFO";
SELECT '========================================' AS "INFO";

SELECT
    CASE
        -- Check 1: Tabelle esistono?
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles')
        THEN '❌ PROBLEMA CRITICO: Tabella user_profiles non esiste → Applica SOLUZIONE 1'

        -- Check 2: Ci sono utenti in auth.users?
        WHEN (SELECT COUNT(*) FROM auth.users) = 0
        THEN '❌ PROBLEMA CRITICO: Nessun utente in auth.users → Crea utenti in Supabase Dashboard'

        -- Check 3: Ci sono profili in user_profiles?
        WHEN (SELECT COUNT(*) FROM user_profiles) = 0
        THEN '❌ PROBLEMA TROVATO: Nessun profilo in user_profiles → Applica SOLUZIONE 2'

        -- Check 4: RLS è abilitato?
        WHEN NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_profiles' AND relrowsecurity)
        THEN '⚠️ PROBLEMA: RLS disabilitato su user_profiles → Applica SOLUZIONE 3'

        -- Check 5: Ci sono policy?
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles') < 5
        THEN '⚠️ PROBLEMA: Policy RLS mancanti → Applica SOLUZIONE 3'

        -- Check 6: Corrispondenza auth <-> profiles?
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            LEFT JOIN user_profiles p ON u.id = p.id
            WHERE p.id IS NULL
        )
        THEN '⚠️ PROBLEMA: Alcuni utenti non hanno profilo → Applica SOLUZIONE 2'

        -- Tutto OK
        ELSE '✅ TUTTO OK: Database configurato correttamente. Se il login non funziona, prova SOLUZIONE 4 (cache browser)'
    END AS "DIAGNOSI FINALE";

SELECT '';
SELECT '========================================' AS "INFO";
SELECT 'Leggi FIX-LOGIN-LOOP-AFTER-DB-RESTART.md per le soluzioni dettagliate' AS "INFO";
SELECT '========================================' AS "INFO";
