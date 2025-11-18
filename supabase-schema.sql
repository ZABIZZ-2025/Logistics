-- ============================================
-- RBS 1979 LOGISTICS - SUPABASE DATABASE SCHEMA
-- ============================================
-- Questo file contiene lo schema completo del database
-- Da eseguire nel SQL Editor di Supabase
-- ============================================

-- Abilita l'estensione UUID (se non già abilitata)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELLA: user_profiles
-- Estende auth.users con informazioni aggiuntive
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA: anagrafica
-- Clienti e fornitori con indirizzi
-- ============================================
CREATE TABLE IF NOT EXISTS anagrafica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente TEXT NOT NULL,
    indirizzo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per ricerca rapida cliente
CREATE INDEX IF NOT EXISTS idx_anagrafica_cliente ON anagrafica(cliente);

-- ============================================
-- TABELLA: viaggi
-- Post-it del Kanban con tutti i dati viaggio
-- ============================================
CREATE TABLE IF NOT EXISTS viaggi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Dati richiesta
    urgente BOOLEAN DEFAULT FALSE,
    azienda TEXT NOT NULL,
    luogo TEXT NOT NULL,
    data DATE NOT NULL,
    orario TIME NOT NULL,
    circuito TEXT CHECK (circuito IN ('nord-est', 'nord-ovest', 'sud', 'corriere')),
    merce TEXT,
    peso DECIMAL(10,2) DEFAULT 0,
    volume INTEGER DEFAULT 0,
    motivo TEXT CHECK (motivo IN ('ritiro', 'consegna', 'entrambi')),
    note TEXT,

    -- Posizione Kanban
    "column" TEXT NOT NULL CHECK ("column" IN ('richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato')),
    "order" BIGINT NOT NULL,

    -- Stato approvazione
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),

    -- Tracking utenti
    created_by UUID REFERENCES auth.users(id),
    created_by_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    approved_by UUID REFERENCES auth.users(id),
    approved_by_username TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,

    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_viaggi_column ON viaggi("column");
CREATE INDEX IF NOT EXISTS idx_viaggi_order ON viaggi("order");
CREATE INDEX IF NOT EXISTS idx_viaggi_created_by ON viaggi(created_by);
CREATE INDEX IF NOT EXISTS idx_viaggi_data ON viaggi(data);

-- ============================================
-- TABELLA: history
-- Storico movimenti per statistiche
-- ============================================
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaggio_id UUID REFERENCES viaggi(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'moved', 'approved', 'completed', 'edited', 'deleted')),
    from_column TEXT,
    to_column TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    username TEXT
);

-- Indici per analisi statistiche
CREATE INDEX IF NOT EXISTS idx_history_viaggio_id ON history(viaggio_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp);
CREATE INDEX IF NOT EXISTS idx_history_action ON history(action);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anagrafica ENABLE ROW LEVEL SECURITY;
ALTER TABLE viaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: user_profiles
-- ============================================

-- Gli utenti possono vedere solo il proprio profilo
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Gli admin possono vedere tutti i profili
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Solo gli admin possono creare/modificare profili
CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

CREATE POLICY "Admins can update profiles" ON user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete profiles" ON user_profiles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- ============================================
-- POLICIES: anagrafica
-- ============================================

-- Tutti gli utenti autenticati possono vedere l'anagrafica
CREATE POLICY "Authenticated users can view anagrafica" ON anagrafica
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Tutti gli utenti autenticati possono aggiungere clienti
CREATE POLICY "Authenticated users can insert anagrafica" ON anagrafica
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Solo gli admin possono modificare/eliminare
CREATE POLICY "Admins can update anagrafica" ON anagrafica
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete anagrafica" ON anagrafica
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- ============================================
-- POLICIES: viaggi
-- ============================================

-- Tutti gli utenti autenticati possono vedere tutti i viaggi
CREATE POLICY "Authenticated users can view viaggi" ON viaggi
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Tutti gli utenti autenticati possono creare viaggi
CREATE POLICY "Authenticated users can insert viaggi" ON viaggi
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Gli utenti possono modificare i propri viaggi in stato 'pending'
CREATE POLICY "Users can update own pending viaggi" ON viaggi
    FOR UPDATE
    USING (
        created_by = auth.uid() AND status = 'pending'
    );

-- Gli admin possono modificare qualsiasi viaggio
CREATE POLICY "Admins can update any viaggio" ON viaggi
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Gli utenti possono eliminare solo i propri viaggi in stato 'pending'
CREATE POLICY "Users can delete own pending viaggi" ON viaggi
    FOR DELETE
    USING (
        created_by = auth.uid() AND status = 'pending'
    );

-- Gli admin possono eliminare qualsiasi viaggio
CREATE POLICY "Admins can delete any viaggio" ON viaggi
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- ============================================
-- POLICIES: history
-- ============================================

-- Tutti gli utenti autenticati possono vedere lo storico
CREATE POLICY "Authenticated users can view history" ON history
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Tutti gli utenti autenticati possono inserire nello storico
CREATE POLICY "Authenticated users can insert history" ON history
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Solo gli admin possono eliminare lo storico
CREATE POLICY "Admins can delete history" ON history
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- ============================================
-- FUNZIONI E TRIGGER
-- ============================================

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger per anagrafica
CREATE TRIGGER update_anagrafica_updated_at
    BEFORE UPDATE ON anagrafica
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger per viaggi
CREATE TRIGGER update_viaggi_updated_at
    BEFORE UPDATE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNZIONE: Registra automaticamente nello storico
-- Con SECURITY DEFINER per bypassare RLS
-- ============================================
CREATE OR REPLACE FUNCTION log_viaggio_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Ottieni l'ID utente corrente (potrebbe essere NULL in alcuni contesti)
    current_user_id := auth.uid();

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO history (viaggio_id, action, to_column, user_id, username)
        VALUES (NEW.id, 'created', NEW."column", NEW.created_by, NEW.created_by_username);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Registra se cambia colonna
        IF (OLD."column" IS DISTINCT FROM NEW."column") THEN
            INSERT INTO history (viaggio_id, action, from_column, to_column, user_id)
            VALUES (NEW.id, 'moved', OLD."column", NEW."column", current_user_id);
        END IF;
        -- Registra se viene approvato
        IF (OLD.status = 'pending' AND NEW.status = 'approved') THEN
            INSERT INTO history (viaggio_id, action, user_id, username)
            VALUES (NEW.id, 'approved', NEW.approved_by, NEW.approved_by_username);
        END IF;
        -- Registra se viene completato
        IF (OLD.status != 'completed' AND NEW.status = 'completed') THEN
            INSERT INTO history (viaggio_id, action, user_id)
            VALUES (NEW.id, 'completed', current_user_id);
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Per DELETE, usa OLD invece di NEW
        -- Il trigger viene eseguito BEFORE DELETE, quindi il record esiste ancora
        INSERT INTO history (viaggio_id, action, user_id)
        VALUES (OLD.id, 'deleted', current_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per logging DELETE (BEFORE per permettere l'inserimento in history)
CREATE TRIGGER log_viaggi_delete
    BEFORE DELETE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();

-- Trigger per logging INSERT e UPDATE (AFTER per avere i dati completi)
CREATE TRIGGER log_viaggi_changes
    AFTER INSERT OR UPDATE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();

-- ============================================
-- DATI DI ESEMPIO (Opzionale - solo per testing)
-- ============================================

-- NOTA: Prima di eseguire questa sezione, devi creare
-- gli utenti tramite Supabase Auth UI o API

-- Esempio di inserimento profilo utente (da eseguire DOPO aver creato l'utente in auth.users)
-- INSERT INTO user_profiles (id, user_id, username, role)
-- VALUES
--   ('uuid-dell-utente-admin', 'admin', 'Amministratore', 'admin'),
--   ('uuid-dell-utente-user', 'user', 'Mario Rossi', 'user');

-- Esempio anagrafica
-- INSERT INTO anagrafica (cliente, indirizzo) VALUES
--   ('Negozio Milano Centro', 'Via Montenapoleone 1, Milano'),
--   ('Boutique Roma', 'Via Condotti 45, Roma'),
--   ('Fornitore Tessuti SpA', 'Via Industria 12, Prato');

-- ============================================
-- FINE SCHEMA
-- ============================================

-- Per verificare che tutto sia stato creato correttamente:
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
