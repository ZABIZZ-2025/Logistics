-- ============================================
-- RBS LOGISTICA - SETUP COMPLETO DA ZERO
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- ATTENZIONE: Elimina e ricrea tutte le tabelle!
-- ============================================

-- ============================================
-- STEP 1: ELIMINA TABELLE ESISTENTI
-- ============================================
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS viaggi CASCADE;
DROP TABLE IF EXISTS anagrafica CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- STEP 2: CREA TABELLA ANAGRAFICA
-- ============================================
CREATE TABLE anagrafica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente TEXT NOT NULL,
    indirizzo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREA TABELLA VIAGGI
-- ============================================
CREATE TABLE viaggi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urgente BOOLEAN DEFAULT FALSE,
    azienda TEXT NOT NULL,
    luogo TEXT NOT NULL,
    data DATE NOT NULL,
    orario TIME NOT NULL,
    circuito TEXT,
    merce TEXT,
    peso NUMERIC DEFAULT 0,
    volume INTEGER DEFAULT 0,
    motivo TEXT,
    note TEXT,
    "column" TEXT NOT NULL DEFAULT 'richieste',
    "order" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    status TEXT DEFAULT 'pending',
    created_by_username TEXT DEFAULT 'Utente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: DISABILITA RLS (accesso libero)
-- ============================================
ALTER TABLE anagrafica DISABLE ROW LEVEL SECURITY;
ALTER TABLE viaggi DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: INSERISCI DATI DI ESEMPIO
-- ============================================

-- Anagrafica clienti
INSERT INTO anagrafica (cliente, indirizzo) VALUES
    ('FASHION STORE MILANO', 'Via Montenapoleone 15, Milano'),
    ('BOUTIQUE ROMA', 'Via Condotti 45, Roma'),
    ('NEGOZIO FIRENZE', 'Via de Tornabuoni 8, Firenze'),
    ('OUTLET SERRAVALLE', 'Via della Moda 1, Serravalle Scrivia'),
    ('SHOWROOM TORINO', 'Via Roma 120, Torino'),
    ('MAGAZZINO BOLOGNA', 'Via Emilia 55, Bologna');

-- Viaggi di esempio
INSERT INTO viaggi (urgente, azienda, luogo, data, orario, circuito, merce, peso, volume, motivo, note, "column", "order", status, created_by_username) VALUES
    (false, 'FASHION STORE MILANO', 'Via Montenapoleone 15, Milano', CURRENT_DATE, '09:00', 'nord-ovest', 'Capi primavera', 25, 5, 'consegna', 'Suonare citofono 3', 'pianificato', 1000, 'approved', 'Admin'),
    (true, 'BOUTIQUE ROMA', 'Via Condotti 45, Roma', CURRENT_DATE, '14:00', 'sud', 'Accessori lusso', 10, 3, 'ritiro', 'Urgente - cliente VIP', 'urgenze', 2000, 'pending', 'Utente'),
    (false, 'NEGOZIO FIRENZE', 'Via de Tornabuoni 8, Firenze', CURRENT_DATE + 1, '11:00', 'nord-est', 'Collezione estate', 50, 12, 'entrambi', NULL, 'richieste', 3000, 'pending', 'Utente'),
    (false, 'OUTLET SERRAVALLE', 'Via della Moda 1, Serravalle Scrivia', CURRENT_DATE, '16:00', 'nord-ovest', 'Stock fine serie', 100, 25, 'consegna', 'Consegna al magazzino B', 'in-corso', 4000, 'approved', 'Admin');

-- ============================================
-- STEP 6: ABILITA REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE viaggi;
ALTER PUBLICATION supabase_realtime ADD TABLE anagrafica;

-- ============================================
-- VERIFICA FINALE
-- ============================================
SELECT 'Tabelle create:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('viaggi', 'anagrafica');

SELECT 'Anagrafica:' as info, COUNT(*) as totale FROM anagrafica;
SELECT 'Viaggi:' as info, COUNT(*) as totale FROM viaggi;

SELECT 'RLS Status:' as info;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('viaggi', 'anagrafica');
