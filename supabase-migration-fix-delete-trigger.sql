-- ============================================
-- RBS 1979 LOGISTICS - FIX DELETION TRIGGER
-- ============================================
-- Data: 2025-11-18
-- Descrizione: Risolve l'errore di eliminazione viaggi
--              causato dal trigger che tenta di inserire
--              nella tabella history dopo la cancellazione
-- ============================================

-- PROBLEMA:
-- Il trigger log_viaggi_changes viene eseguito AFTER DELETE
-- e cerca di inserire un record in history con viaggio_id
-- che però ha un constraint ON DELETE CASCADE, creando
-- un conflitto di foreign key.
--
-- SOLUZIONE:
-- Dividere il trigger in due:
-- 1. BEFORE DELETE per il logging (il record esiste ancora)
-- 2. AFTER INSERT/UPDATE per le altre operazioni

-- ============================================
-- STEP 1: Elimina il trigger esistente
-- ============================================
DROP TRIGGER IF EXISTS log_viaggi_changes ON viaggi;

-- ============================================
-- STEP 2: Ricrea la funzione di logging
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

-- ============================================
-- STEP 3: Crea trigger BEFORE DELETE
-- (il viaggio esiste ancora quando loggato)
-- ============================================
CREATE TRIGGER log_viaggi_delete
    BEFORE DELETE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();

-- ============================================
-- STEP 4: Crea trigger AFTER INSERT/UPDATE
-- ============================================
CREATE TRIGGER log_viaggi_changes
    AFTER INSERT OR UPDATE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();

-- ============================================
-- STEP 5: Verifica i trigger creati
-- ============================================
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'viaggi'
ORDER BY trigger_name;

-- ============================================
-- NOTE
-- ============================================
-- Dopo questa migrazione:
-- ✅ L'eliminazione dei viaggi funzionerà correttamente
-- ✅ Il logging nella tabella history continuerà a funzionare
-- ✅ Il trigger DELETE viene eseguito BEFORE (prima della cancellazione)
-- ✅ I trigger INSERT/UPDATE vengono eseguiti AFTER (dopo l'operazione)
-- ============================================
