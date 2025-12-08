-- ============================================
-- RBS LOGISTICA - DIAGNOSTIC CHECK SEMPLIFICATO
-- ============================================
-- Query semplificata per Supabase SQL Editor
-- ============================================

-- VERIFICA COMPLETA STATO DATABASE
SELECT
    '1. TABELLE' AS check_categoria,
    tablename AS nome,
    CASE
        WHEN tablename IN ('user_profiles', 'anagrafica', 'viaggi', 'history')
        THEN '✅ OK'
        ELSE '➖'
    END AS status,
    '' AS dettaglio
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

-- VERIFICA UTENTI AUTH
SELECT
    '2. UTENTI AUTH' AS check_categoria,
    email AS nome,
    '✅ Trovato' AS status,
    'Creato: ' || TO_CHAR(created_at, 'YYYY-MM-DD') AS dettaglio
FROM auth.users

UNION ALL

-- VERIFICA PROFILI
SELECT
    '3. PROFILI USER' AS check_categoria,
    username AS nome,
    CASE
        WHEN role = 'admin' THEN '👑 Admin'
        ELSE '👤 User'
    END AS status,
    'Username: ' || user_id AS dettaglio
FROM user_profiles

UNION ALL

-- VERIFICA RLS
SELECT
    '4. RLS ABILITATO' AS check_categoria,
    relname AS nome,
    CASE
        WHEN relrowsecurity THEN '✅ Abilitato'
        ELSE '❌ Disabilitato'
    END AS status,
    '' AS dettaglio
FROM pg_class
WHERE relname IN ('user_profiles', 'anagrafica', 'viaggi', 'history')

UNION ALL

-- VERIFICA POLICY
SELECT
    '5. POLICY RLS' AS check_categoria,
    tablename || ': ' || policyname AS nome,
    '✅ OK' AS status,
    'Cmd: ' || cmd AS dettaglio
FROM pg_policies
WHERE tablename IN ('user_profiles', 'viaggi')

UNION ALL

-- VERIFICA TRIGGER
SELECT
    '6. TRIGGER' AS check_categoria,
    trigger_name AS nome,
    event_manipulation || ' ' || action_timing AS status,
    '' AS dettaglio
FROM information_schema.triggers
WHERE event_object_table = 'viaggi'

UNION ALL

-- VERIFICA CAMPI VIAGGI
SELECT
    '7. CAMPI VIAGGI' AS check_categoria,
    column_name AS nome,
    data_type AS status,
    CASE
        WHEN column_name IN ('circuito', 'merce', 'peso', 'volume', 'motivo')
        THEN '✅ Campo fix'
        ELSE ''
    END AS dettaglio
FROM information_schema.columns
WHERE table_name = 'viaggi'
AND column_name IN ('circuito', 'merce', 'peso', 'volume', 'motivo', 'azienda', 'luogo', 'data')

ORDER BY check_categoria, nome;

-- ============================================
-- CONTEGGIO TOTALI
-- ============================================
SELECT
    '📊 CONTEGGIO TOTALI' AS categoria,
    'auth.users' AS tabella,
    COUNT(*)::text AS totale
FROM auth.users
UNION ALL
SELECT
    '📊 CONTEGGIO TOTALI',
    'user_profiles',
    COUNT(*)::text
FROM user_profiles
UNION ALL
SELECT
    '📊 CONTEGGIO TOTALI',
    'viaggi',
    COUNT(*)::text
FROM viaggi
UNION ALL
SELECT
    '📊 CONTEGGIO TOTALI',
    'anagrafica',
    COUNT(*)::text
FROM anagrafica;

-- ============================================
-- DIAGNOSI FINALE
-- ============================================
SELECT
    '🎯 DIAGNOSI FINALE' AS tipo,
    CASE
        -- Check 1: Tabella user_profiles esiste?
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'user_profiles'
        )
        THEN '❌ CRITICO: Tabella user_profiles non esiste → SOLUZIONE 1'

        -- Check 2: Ci sono utenti in auth.users?
        WHEN (SELECT COUNT(*) FROM auth.users) = 0
        THEN '❌ CRITICO: Nessun utente in auth.users → Crea utenti in Supabase Auth'

        -- Check 3: Ci sono profili in user_profiles?
        WHEN (SELECT COUNT(*) FROM user_profiles) = 0
        THEN '❌ PROBLEMA: Nessun profilo in user_profiles → SOLUZIONE 2'

        -- Check 4: RLS è abilitato?
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_class
            WHERE relname = 'user_profiles' AND relrowsecurity
        )
        THEN '⚠️ PROBLEMA: RLS disabilitato → SOLUZIONE 3'

        -- Check 5: Ci sono policy?
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles') < 5
        THEN '⚠️ PROBLEMA: Policy RLS mancanti → SOLUZIONE 3'

        -- Check 6: Utenti senza profilo?
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            LEFT JOIN user_profiles p ON u.id = p.id
            WHERE p.id IS NULL
        )
        THEN '⚠️ PROBLEMA: Alcuni utenti senza profilo → SOLUZIONE 2'

        -- Check 7: Campi mancanti in viaggi?
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'viaggi' AND column_name = 'circuito'
        )
        THEN '❌ PROBLEMA: Campi mancanti in viaggi → Applica migrazione campi'

        -- Tutto OK
        ELSE '✅ TUTTO OK: Database configurato correttamente'
    END AS diagnosi,
    CASE
        WHEN (SELECT COUNT(*) FROM user_profiles) = 0
        THEN 'Leggi FIX-LOGIN-LOOP-AFTER-DB-RESTART.md SOLUZIONE 2'
        WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles')
        THEN 'Leggi FIX-LOGIN-LOOP-AFTER-DB-RESTART.md SOLUZIONE 1'
        ELSE 'Se login non funziona: pulisci cache browser (SOLUZIONE 4)'
    END AS azione_consigliata;
