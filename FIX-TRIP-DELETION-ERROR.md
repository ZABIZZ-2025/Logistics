# 🔧 Guida: Fix Errore Eliminazione Viaggi

## 📋 Problema Identificato

Quando si tenta di eliminare un viaggio cliccando sul cestino e confermando con "OK", appare il seguente errore:

```
❌ Errore nell'eliminazione del viaggio
```

## 🔍 Causa del Problema

Il problema è causato dal **trigger di database** `log_viaggi_changes` che registra le modifiche nella tabella `history`.

### Dettaglio Tecnico

1. **Trigger Attuale**: Il trigger viene eseguito `AFTER DELETE`
2. **Operazione Trigger**: Tenta di inserire un record nella tabella `history` con il `viaggio_id` appena eliminato
3. **Foreign Key Constraint**: La tabella `history` ha un constraint:
   ```sql
   viaggio_id UUID REFERENCES viaggi(id) ON DELETE CASCADE
   ```
4. **Conflitto**: Quando il trigger cerca di inserire il record in `history`, il viaggio è già stato eliminato dalla tabella `viaggi`, creando un conflitto di foreign key

### Flusso del Problema

```
┌─────────────────────────────────────┐
│ 1. Admin clicca "Elimina viaggio"  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. DELETE FROM viaggi WHERE id=...  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Trigger AFTER DELETE eseguito    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. INSERT INTO history (viaggio_id) │ ❌ ERRORE!
│    Il viaggio_id non esiste più!    │
└─────────────────────────────────────┘
```

## ✅ Soluzione

La soluzione consiste nel **modificare il timing del trigger** per l'operazione DELETE:

- **DELETE**: Eseguire `BEFORE DELETE` → il viaggio esiste ancora quando viene loggato
- **INSERT/UPDATE**: Eseguire `AFTER` → per avere i dati completi dopo l'operazione

### Modifiche Implementate

1. **Dividi il trigger in due**:
   - `log_viaggi_delete`: trigger `BEFORE DELETE` per il logging delle cancellazioni
   - `log_viaggi_changes`: trigger `AFTER INSERT OR UPDATE` per le altre operazioni

2. **Aggiungi SECURITY DEFINER**:
   - La funzione trigger bypassa le policy RLS per garantire che l'inserimento in `history` funzioni sempre

3. **Gestisci auth.uid() NULL**:
   - Usa una variabile locale per memorizzare `auth.uid()` che potrebbe essere NULL in alcuni contesti

## 🚀 Applicare la Fix

### Passo 1: Accedi a Supabase Dashboard

1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto

### Passo 2: Apri SQL Editor

1. Nel menu laterale, clicca su **SQL Editor**
2. Clicca su **New query**

### Passo 3: Esegui la Migrazione

1. Apri il file `supabase-migration-fix-delete-trigger.sql`
2. Copia tutto il contenuto
3. Incollalo nell'editor SQL di Supabase
4. Clicca su **Run** (o premi `Ctrl+Enter`)

### Passo 4: Verifica il Risultato

Dopo l'esecuzione, dovresti vedere:

```
✅ DROP TRIGGER successful
✅ CREATE OR REPLACE FUNCTION successful
✅ CREATE TRIGGER log_viaggi_delete successful
✅ CREATE TRIGGER log_viaggi_changes successful
```

La query finale mostrerà i trigger creati:

| trigger_name | event_manipulation | action_timing | action_orientation |
|--------------|-------------------|---------------|-------------------|
| log_viaggi_delete | DELETE | BEFORE | ROW |
| log_viaggi_changes | INSERT | AFTER | ROW |
| log_viaggi_changes | UPDATE | AFTER | ROW |

## 🧪 Test della Soluzione

Dopo aver applicato la migrazione:

### Test Eliminazione Viaggio

1. **Accedi come Admin**
2. **Crea un viaggio di test** (se non ne hai già uno)
3. **Clicca sull'icona cestino** 🗑️ su un viaggio
4. **Conferma l'eliminazione** cliccando "OK"
5. ✅ **Risultato atteso**:
   - Il viaggio viene eliminato
   - Appare il messaggio: "Viaggio eliminato"
   - Il viaggio scompare dalla Kanban board
   - Un record viene inserito nella tabella `history` con action='deleted'

### Verifica Logging in History

Puoi verificare che il logging funzioni eseguendo questa query in SQL Editor:

```sql
SELECT
    h.action,
    h.timestamp,
    h.viaggio_id,
    h.username,
    v.azienda
FROM history h
LEFT JOIN viaggi v ON h.viaggio_id = v.id
WHERE h.action = 'deleted'
ORDER BY h.timestamp DESC
LIMIT 10;
```

**Nota**: Per i viaggi eliminati, `v.azienda` sarà NULL perché il viaggio non esiste più nella tabella `viaggi`, ma il record in `history` rimarrà per lo storico.

## 📊 Schema Trigger Aggiornato

### Prima della Fix

```sql
-- ❌ PROBLEMA: Unico trigger AFTER per tutte le operazioni
CREATE TRIGGER log_viaggi_changes
    AFTER INSERT OR UPDATE OR DELETE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();
```

### Dopo la Fix

```sql
-- ✅ SOLUZIONE: Due trigger separati con timing appropriato

-- Trigger per DELETE (BEFORE - il record esiste ancora)
CREATE TRIGGER log_viaggi_delete
    BEFORE DELETE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();

-- Trigger per INSERT/UPDATE (AFTER - dati completi disponibili)
CREATE TRIGGER log_viaggi_changes
    AFTER INSERT OR UPDATE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();
```

### Funzione Aggiornata

```sql
CREATE OR REPLACE FUNCTION log_viaggio_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;  -- ✅ Gestisce auth.uid() NULL
BEGIN
    current_user_id := auth.uid();

    -- ... logica trigger ...

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ✅ Bypassa RLS
```

## 🚨 Note Importanti

- ✅ **Sicuro**: La migrazione non cancella dati esistenti
- ✅ **Backward Compatible**: Non influisce su viaggi o history esistenti
- ✅ **Immediato**: L'eliminazione funzionerà subito dopo la migrazione
- ✅ **No Code Changes**: Non serve modificare il codice JavaScript
- ⚠️ **History Orphan**: I record in `history` con `action='deleted'` avranno `viaggio_id` che non esiste più in `viaggi` (comportamento corretto per mantenere lo storico)

## 🔄 Rollback (Se Necessario)

Se per qualche motivo vuoi tornare al comportamento precedente:

```sql
-- Elimina i nuovi trigger
DROP TRIGGER IF EXISTS log_viaggi_delete ON viaggi;
DROP TRIGGER IF EXISTS log_viaggi_changes ON viaggi;

-- Ricrea il trigger originale (NON CONSIGLIATO - riporta il bug)
CREATE TRIGGER log_viaggi_changes
    AFTER INSERT OR UPDATE OR DELETE ON viaggi
    FOR EACH ROW
    EXECUTE FUNCTION log_viaggio_changes();
```

**ATTENZIONE**: Il rollback riporterà il bug dell'eliminazione!

## 📞 Supporto

Se riscontri problemi:

1. **Controlla i log** nell'SQL Editor di Supabase
2. **Verifica i trigger** con la query:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE event_object_table = 'viaggi';
   ```
3. **Controlla i permessi RLS** sulla tabella `history`
4. **Contatta il supporto** con il messaggio di errore completo

## 📝 Modifiche Applicate

### File Creati/Modificati:
- ✅ `supabase-migration-fix-delete-trigger.sql` - Script di migrazione
- ✅ `supabase-schema.sql` - Schema aggiornato con trigger corretti
- ✅ `FIX-TRIP-DELETION-ERROR.md` - Questa guida

### Trigger Modificati:
- ✅ `log_viaggi_delete` - Nuovo trigger BEFORE DELETE
- ✅ `log_viaggi_changes` - Modificato per AFTER INSERT OR UPDATE
- ✅ `log_viaggio_changes()` - Funzione con SECURITY DEFINER

---

**Data fix**: 2025-11-18
**Versione**: 1.0
**Branch**: `claude/fix-trip-creation-errors-011CUytvs1eM89MFwVqzT3DE`
**Relates to**: FIX-TRIP-CREATION-ERRORS.md (campi mancanti)
