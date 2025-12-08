-- ============================================
-- VERIFICA PROFILI ESISTENTI E CREDENZIALI
-- ============================================
-- Questa query mostra i profili esistenti e le credenziali corrette
-- ============================================

-- 1. MOSTRA TUTTI I PROFILI ESISTENTI
SELECT
    '📋 PROFILI ESISTENTI' AS sezione,
    p.username AS "Nome Utente",
    p.user_id AS "Username Login",
    p.role AS "Ruolo",
    u.email AS "Email Login",
    p.id::text AS "UUID"
FROM user_profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role DESC, p.username;

-- ============================================
-- 2. VERIFICA CORRISPONDENZA
-- ============================================
SELECT
    '🔍 DIAGNOSI LOGIN' AS sezione,
    u.email AS "Email (usa questa per login)",
    p.username AS "Nome Profilo",
    p.user_id AS "Username nel DB",
    CASE
        WHEN p.id IS NULL THEN '❌ PROFILO MANCANTE'
        WHEN p.id IS NOT NULL THEN '✅ Profilo OK'
    END AS "Status"
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.email;

-- ============================================
-- 3. ISTRUZIONI LOGIN
-- ============================================
SELECT
    '📖 COME FARE LOGIN' AS info,
    'Usa queste credenziali:' AS descrizione,
    '👇 Vedi tabella sopra colonna "Email (usa questa per login)"' AS dettaglio
UNION ALL
SELECT
    '📖 COME FARE LOGIN',
    'Password:',
    'Quella che hai impostato quando hai creato l\'utente in Supabase Auth'
UNION ALL
SELECT
    '📖 COME FARE LOGIN',
    'Se non ricordi la password:',
    'Vai su Supabase Dashboard > Authentication > Users > Clicca utente > Send Magic Link'
;

-- ============================================
-- 4. POSSIBILI CAUSE PROBLEMA
-- ============================================
SELECT
    '⚠️ SE IL LOGIN NON FUNZIONA' AS possibile_causa,
    CASE
        WHEN (SELECT COUNT(*) FROM user_profiles) > 0 AND
             (SELECT COUNT(*) FROM auth.users u LEFT JOIN user_profiles p ON u.id = p.id WHERE p.id IS NOT NULL) > 0
        THEN '1. Stai usando EMAIL sbagliata (non username!) - Usa quella nella colonna "Email (usa questa per login)"'
        ELSE ''
    END AS soluzione_1,

    '2. Password sbagliata - Resetta password in Supabase Dashboard' AS soluzione_2,

    '3. Cache del browser - Premi Ctrl+Shift+Del e pulisci tutto' AS soluzione_3,

    '4. Prova in modalità INCOGNITO del browser' AS soluzione_4;

-- ============================================
-- 5. VERIFICA RLS (potrebbe bloccare l'accesso)
-- ============================================
SELECT
    '🔒 VERIFICA RLS' AS controllo,
    relname AS "Tabella",
    CASE
        WHEN relrowsecurity THEN '✅ RLS Abilitato'
        ELSE '❌ RLS Disabilitato - PROBLEMA!'
    END AS "Status RLS"
FROM pg_class
WHERE relname = 'user_profiles';

-- ============================================
-- AZIONE RACCOMANDATA
-- ============================================
SELECT
    '🎯 COSA FARE ORA' AS passo,
    '1' AS numero,
    'Guarda la tabella "PROFILI ESISTENTI" e trova l\'email dell\'utente admin' AS istruzione
UNION ALL
SELECT
    '🎯 COSA FARE ORA',
    '2',
    'Vai su index.html e usa quella EMAIL (non il campo "Username Login"!) per il login'
UNION ALL
SELECT
    '🎯 COSA FARE ORA',
    '3',
    'Se non ricordi la password, resettala in Supabase Dashboard > Authentication > Users'
UNION ALL
SELECT
    '🎯 COSA FARE ORA',
    '4',
    'Se ancora non funziona: Ctrl+Shift+Del > Pulisci cache e cookie > Riprova'
UNION ALL
SELECT
    '🎯 COSA FARE ORA',
    '5',
    'Se ancora non funziona: Prova in finestra INCOGNITO del browser'
;
