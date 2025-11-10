-- ============================================
-- RBS 1979 LOGISTICS - MIGRAZIONE DATABASE
-- Aggiunge campi mancanti alla tabella viaggi
-- ============================================
-- Data: 2025-11-10
-- Descrizione: Aggiunge i campi circuito, merce, peso, volume e motivo
--              necessari per il funzionamento dell'applicazione
-- ============================================

-- Aggiungi campo circuito (circuito geografico)
ALTER TABLE viaggi
ADD COLUMN IF NOT EXISTS circuito TEXT
CHECK (circuito IN ('nord-est', 'nord-ovest', 'sud', 'corriere'));

-- Aggiungi campo merce (descrizione merce)
ALTER TABLE viaggi
ADD COLUMN IF NOT EXISTS merce TEXT;

-- Aggiungi campo peso (peso in kg)
ALTER TABLE viaggi
ADD COLUMN IF NOT EXISTS peso DECIMAL(10,2) DEFAULT 0;

-- Aggiungi campo volume (numero pacchi)
ALTER TABLE viaggi
ADD COLUMN IF NOT EXISTS volume INTEGER DEFAULT 0;

-- Aggiungi campo motivo (motivo del viaggio)
ALTER TABLE viaggi
ADD COLUMN IF NOT EXISTS motivo TEXT
CHECK (motivo IN ('ritiro', 'consegna', 'entrambi'));

-- ============================================
-- Verifica i campi aggiunti
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'viaggi'
AND column_name IN ('circuito', 'merce', 'peso', 'volume', 'motivo')
ORDER BY column_name;

-- ============================================
-- ISTRUZIONI PER L'APPLICAZIONE
-- ============================================
-- 1. Vai su Supabase Dashboard
-- 2. Seleziona il tuo progetto
-- 3. Vai su "SQL Editor"
-- 4. Crea una nuova query
-- 5. Copia e incolla questo contenuto
-- 6. Clicca su "Run" per eseguire la migrazione
-- 7. Verifica che i campi siano stati aggiunti correttamente
-- ============================================
