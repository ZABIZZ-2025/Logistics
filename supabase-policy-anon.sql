-- ============================================
-- RBS LOGISTICA - POLICY PER ACCESSO ANONIMO
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- per permettere l'accesso senza autenticazione
-- ============================================

-- ============================================
-- RIMUOVI LE VECCHIE POLICY (se esistono)
-- ============================================

-- Viaggi
DROP POLICY IF EXISTS "Authenticated users can view viaggi" ON viaggi;
DROP POLICY IF EXISTS "Authenticated users can insert viaggi" ON viaggi;
DROP POLICY IF EXISTS "Users can update own pending viaggi" ON viaggi;
DROP POLICY IF EXISTS "Admins can update any viaggio" ON viaggi;
DROP POLICY IF EXISTS "Users can delete own pending viaggi" ON viaggi;
DROP POLICY IF EXISTS "Admins can delete any viaggio" ON viaggi;
DROP POLICY IF EXISTS "Anon can view viaggi" ON viaggi;
DROP POLICY IF EXISTS "Anon can insert viaggi" ON viaggi;
DROP POLICY IF EXISTS "Anon can update viaggi" ON viaggi;
DROP POLICY IF EXISTS "Anon can delete viaggi" ON viaggi;

-- Anagrafica
DROP POLICY IF EXISTS "Authenticated users can view anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Authenticated users can insert anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Admins can update anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Admins can delete anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Anon can view anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Anon can insert anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Anon can update anagrafica" ON anagrafica;
DROP POLICY IF EXISTS "Anon can delete anagrafica" ON anagrafica;

-- ============================================
-- NUOVE POLICY: ACCESSO ANONIMO COMPLETO
-- ============================================

-- VIAGGI: Tutti possono vedere
CREATE POLICY "Anon can view viaggi" ON viaggi
    FOR SELECT
    USING (true);

-- VIAGGI: Tutti possono inserire
CREATE POLICY "Anon can insert viaggi" ON viaggi
    FOR INSERT
    WITH CHECK (true);

-- VIAGGI: Tutti possono modificare
CREATE POLICY "Anon can update viaggi" ON viaggi
    FOR UPDATE
    USING (true);

-- VIAGGI: Tutti possono eliminare
CREATE POLICY "Anon can delete viaggi" ON viaggi
    FOR DELETE
    USING (true);

-- ANAGRAFICA: Tutti possono vedere
CREATE POLICY "Anon can view anagrafica" ON anagrafica
    FOR SELECT
    USING (true);

-- ANAGRAFICA: Tutti possono inserire
CREATE POLICY "Anon can insert anagrafica" ON anagrafica
    FOR INSERT
    WITH CHECK (true);

-- ANAGRAFICA: Tutti possono modificare
CREATE POLICY "Anon can update anagrafica" ON anagrafica
    FOR UPDATE
    USING (true);

-- ANAGRAFICA: Tutti possono eliminare
CREATE POLICY "Anon can delete anagrafica" ON anagrafica
    FOR DELETE
    USING (true);

-- ============================================
-- VERIFICA
-- ============================================
-- Esegui questa query per verificare le policy attive:

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('viaggi', 'anagrafica')
ORDER BY tablename, policyname;
