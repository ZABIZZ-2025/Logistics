# 🔧 Guida: Fix Errori Creazione Viaggi

## 📋 Problema Identificato

Quando si tenta di creare un nuovo viaggio, si verificano i seguenti errori:

- **Profilo User**: `"Errore nel salvataggio della richiesta"`
- **Profilo Admin**: `"Errore nella creazione del viaggio"`

## 🔍 Causa del Problema

Lo schema della tabella `viaggi` nel database Supabase è **incompleto**. Mancano i seguenti campi che l'applicazione cerca di salvare:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `circuito` | TEXT | Circuito geografico (nord-est, nord-ovest, sud, corriere) |
| `merce` | TEXT | Descrizione della merce |
| `peso` | DECIMAL(10,2) | Peso in kg |
| `volume` | INTEGER | Numero di pacchi |
| `motivo` | TEXT | Motivo del viaggio (ritiro, consegna, entrambi) |

## ✅ Soluzione

### Opzione 1: Applicare la Migrazione (CONSIGLIATO)

Segui questi passaggi per aggiungere i campi mancanti al database esistente:

1. **Accedi a Supabase Dashboard**
   - Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Seleziona il tuo progetto

2. **Apri SQL Editor**
   - Nel menu laterale, clicca su **SQL Editor**
   - Clicca su **New query**

3. **Esegui la Migrazione**
   - Apri il file `supabase-migration-add-missing-fields.sql`
   - Copia tutto il contenuto
   - Incollalo nell'editor SQL di Supabase
   - Clicca su **Run** (o premi `Ctrl+Enter`)

4. **Verifica il Risultato**
   - Dovresti vedere un messaggio di successo
   - La query finale mostrerà i 5 campi aggiunti con i loro tipi

### Opzione 2: Ricreare il Database da Zero

Se preferisci ricreare tutto il database con lo schema corretto:

1. **Backup dei Dati Esistenti** (IMPORTANTE!)
   - Esporta tutti i dati dalle tabelle `viaggi`, `anagrafica` e `user_profiles`
   - Salva il backup in un luogo sicuro

2. **Elimina le Tabelle Esistenti**
   ```sql
   DROP TABLE IF EXISTS history CASCADE;
   DROP TABLE IF EXISTS viaggi CASCADE;
   DROP TABLE IF EXISTS anagrafica CASCADE;
   DROP TABLE IF EXISTS user_profiles CASCADE;
   ```

3. **Ricrea lo Schema Completo**
   - Apri il file `supabase-schema.sql` (aggiornato)
   - Copia tutto il contenuto
   - Incollalo nell'editor SQL di Supabase
   - Clicca su **Run**

4. **Ripristina i Dati** (se necessario)
   - Importa i dati salvati nel backup

## 🧪 Test della Soluzione

Dopo aver applicato la migrazione:

1. **Test Profilo User**
   - Accedi con un account utente
   - Vai a "Nuova Richiesta Viaggio"
   - Compila tutti i campi obbligatori
   - Clicca su "Invia Richiesta"
   - ✅ Dovrebbe mostrare: "Richiesta inviata con successo!"

2. **Test Profilo Admin**
   - Accedi con un account admin
   - Clicca su "Nuovo Viaggio"
   - Compila tutti i campi obbligatori
   - Clicca su "Salva"
   - ✅ Dovrebbe mostrare: "Nuovo viaggio creato"

## 📊 Schema Completo Aggiornato

La tabella `viaggi` ora include:

```sql
CREATE TABLE viaggi (
    -- ID e metadati
    id UUID PRIMARY KEY,

    -- Dati viaggio
    urgente BOOLEAN,
    azienda TEXT NOT NULL,
    luogo TEXT NOT NULL,
    data DATE NOT NULL,
    orario TIME NOT NULL,
    circuito TEXT,        -- ✅ AGGIUNTO
    merce TEXT,           -- ✅ AGGIUNTO
    peso DECIMAL(10,2),   -- ✅ AGGIUNTO
    volume INTEGER,       -- ✅ AGGIUNTO
    motivo TEXT,          -- ✅ AGGIUNTO
    note TEXT,

    -- Kanban
    "column" TEXT NOT NULL,
    "order" BIGINT NOT NULL,
    status TEXT,

    -- Tracking
    created_by UUID,
    created_by_username TEXT,
    created_at TIMESTAMP,
    approved_by UUID,
    approved_by_username TEXT,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚨 Note Importanti

- ⚠️ **NON eliminare le tabelle** se non hai fatto un backup completo dei dati
- ✅ La migrazione è **sicura** e non cancella dati esistenti
- ✅ I campi aggiunti hanno valori di default, quindi i record esistenti non saranno danneggiati
- ✅ Dopo la migrazione, l'applicazione funzionerà immediatamente senza modifiche al codice

## 📞 Supporto

Se riscontri problemi durante l'applicazione della migrazione:

1. Controlla il log degli errori nell'SQL Editor di Supabase
2. Verifica che la tabella `viaggi` esista nel database
3. Controlla i permessi RLS (Row Level Security) sul progetto
4. Contatta il supporto con il messaggio di errore completo

## 📝 Modifiche Applicate

### File Creati/Modificati:
- ✅ `supabase-migration-add-missing-fields.sql` - Script di migrazione
- ✅ `supabase-schema.sql` - Schema aggiornato con i campi mancanti
- ✅ `FIX-TRIP-CREATION-ERRORS.md` - Questa guida

### Campi Aggiunti:
- ✅ `circuito` - Circuito geografico
- ✅ `merce` - Descrizione merce
- ✅ `peso` - Peso in kg
- ✅ `volume` - Numero pacchi
- ✅ `motivo` - Motivo viaggio

---

**Data fix**: 2025-11-10
**Versione**: 1.0
**Branch**: `claude/fix-trip-creation-errors-011CUytvs1eM89MFwVqzT3DE`
