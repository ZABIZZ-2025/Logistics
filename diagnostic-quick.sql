-- ============================================
-- DIAGNOSTIC RAPIDO - Per Login Loop
-- ============================================
-- Esegui questa query per una diagnosi immediata
-- ============================================

-- 1. CONTA UTENTI E PROFILI
SELECT
    'Utenti in auth.users' AS descrizione,
    COUNT(*)::text AS valore,
    CASE
        WHEN COUNT(*) = 0 THEN '❌ PROBLEMA: Crea utenti in Supabase Auth'
        ELSE '✅ OK'
    END AS status
FROM auth.users

UNION ALL

SELECT
    'Profili in user_profiles',
    COUNT(*)::text,
    CASE
        WHEN COUNT(*) = 0 THEN '❌ QUESTO È IL PROBLEMA! → Vedi sotto'
        ELSE '✅ OK'
    END
FROM user_profiles

UNION ALL

-- 2. VERIFICA CORRISPONDENZA
SELECT
    'Utenti SENZA profilo',
    COUNT(*)::text,
    CASE
        WHEN COUNT(*) > 0 THEN '❌ Alcuni utenti senza profilo'
        ELSE '✅ Tutti gli utenti hanno profilo'
    END
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- MOSTRA UTENTI CHE NECESSITANO PROFILO
-- ============================================
SELECT
    '🔍 DETTAGLIO UTENTI' AS info,
    u.email,
    u.id::text AS uuid,
    CASE
        WHEN p.id IS NULL THEN '❌ MANCA PROFILO'
        ELSE '✅ Ha profilo: ' || p.username
    END AS stato
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY (p.id IS NULL) DESC, u.email;

-- ============================================
-- DIAGNOSI E SOLUZIONE
-- ============================================
SELECT
    '🎯 DIAGNOSI' AS tipo,
    CASE
        WHEN (SELECT COUNT(*) FROM user_profiles) = 0
        THEN '❌ PROBLEMA TROVATO: La tabella user_profiles è VUOTA!'
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            LEFT JOIN user_profiles p ON u.id = p.id
            WHERE p.id IS NULL
        )
        THEN '⚠️ PROBLEMA: Alcuni utenti non hanno profilo'
        ELSE '✅ TUTTO OK con utenti e profili'
    END AS risultato,

    CASE
        WHEN (SELECT COUNT(*) FROM user_profiles) = 0
        THEN 'SOLUZIONE: Esegui la query qui sotto per creare i profili'
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            LEFT JOIN user_profiles p ON u.id = p.id
            WHERE p.id IS NULL
        )
        THEN 'SOLUZIONE: Crea profili per gli utenti mancanti (vedi query sotto)'
        ELSE 'Se il login non funziona, pulisci la cache del browser'
    END AS azione;

-- ============================================
-- QUERY SOLUZIONE
-- ============================================
-- Se la diagnosi dice "user_profiles è VUOTA", esegui questa query
-- per ogni utente (sostituisci i valori tra apici):


INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '062d3406-7c7f-4b95-9b89-513a8550614f',  -- UUID dell'utente da auth.users
    'admin',                         -- Username per il login (es: admin, mario.rossi)
    'Amministratore',               -- Nome completo da visualizzare
    'admin'                         -- Ruolo: 'admin' o 'user'
);

-- Esempio per secondo utente:
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'ab67df2e-5610-4ad4-8a55-3bc7b684b412',
    'user',
    'utente',
    'user'
);


-- ============================================
-- Dopo aver inserito i profili, riprova il login!
-- ============================================
