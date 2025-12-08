# 🔍 Guida Query Diagnostiche - Quale Usare?

## ⚡ Quick Start - Quale File Eseguire?

Hai **3 versioni** della query diagnostica. Usa quella più adatta alla tua situazione:

---

### 1️⃣ **`diagnostic-quick.sql`** ⚡ CONSIGLIATO!

**Quando usarlo:**
- Vuoi una risposta **immediata** sul problema del login loop
- Vuoi sapere subito se `user_profiles` è vuoto
- Vuoi la query SQL pronta da eseguire per risolvere

**Cosa fa:**
✅ Conta utenti e profili
✅ Mostra chi NON ha profilo
✅ Ti dice esattamente cosa fare
✅ Include la query INSERT già pronta (devi solo sostituire i valori)

**Come usare:**
1. Copia **tutto** il contenuto di `diagnostic-quick.sql`
2. Incolla in Supabase SQL Editor
3. Clicca **Run**
4. Guarda la sezione "DIAGNOSI" nell'output
5. Se dice "user_profiles è VUOTA", copia gli UUID dalla tabella "DETTAGLIO UTENTI"
6. Scorri in fondo al file, decommentala e modifica la query INSERT
7. Sostituisci gli UUID e i nomi
8. Esegui la query INSERT

**Tempo:** ⏱️ 2-3 minuti

---

### 2️⃣ **`diagnostic-check-simple.sql`** 📊 Più dettagliato

**Quando usarlo:**
- Vuoi vedere **tutti i dettagli** del database
- Vuoi verificare anche trigger, policy RLS, campi
- Vuoi un report completo

**Cosa fa:**
✅ Verifica tabelle esistenti
✅ Lista utenti auth
✅ Lista profili user
✅ Verifica RLS abilitato
✅ Verifica policy RLS
✅ Verifica trigger
✅ Verifica campi tabella viaggi
✅ Conta record in tutte le tabelle
✅ Diagnosi finale

**Come usare:**
1. Copia tutto il contenuto di `diagnostic-check-simple.sql`
2. Incolla in Supabase SQL Editor
3. Clicca Run
4. Scorri fino alla fine per vedere "DIAGNOSI FINALE"

**Tempo:** ⏱️ 5 minuti

---

### 3️⃣ **`diagnostic-check-database.sql`** 📋 Versione originale

**Quando usarlo:**
- Le altre due non funzionano
- Vuoi l'output diviso per sezioni (potrebbe non visualizzarsi bene in Supabase)

**Nota:** Questa versione potrebbe mostrare solo "=======" in Supabase SQL Editor a causa del modo in cui gestisce query multiple.

**Come usare:**
- Preferisci usare `diagnostic-quick.sql` invece

**Tempo:** ⏱️ Variabile

---

## 🎯 Confronto Rapido

| File | Velocità | Dettaglio | Soluzione Inclusa | Consigliato |
|------|----------|-----------|-------------------|-------------|
| `diagnostic-quick.sql` | ⚡⚡⚡ | ⭐⭐ | ✅ Query pronta | ✅ **SÌ** |
| `diagnostic-check-simple.sql` | ⚡⚡ | ⭐⭐⭐⭐ | ✅ Diagnosi | Solo se serve dettaglio |
| `diagnostic-check-database.sql` | ⚡ | ⭐⭐⭐⭐⭐ | ❌ Solo diagnosi | ❌ Problemi compatibilità |

---

## 📖 Esempio di Uso: diagnostic-quick.sql

### Passo 1: Esegui la Query

Copia tutto il contenuto di `diagnostic-quick.sql` ed eseguilo in Supabase SQL Editor.

### Passo 2: Leggi l'Output

Vedrai 3 sezioni:

#### Sezione 1: Conteggio
```
| descrizione              | valore | status                        |
|--------------------------|--------|-------------------------------|
| Utenti in auth.users     | 2      | ✅ OK                         |
| Profili in user_profiles | 0      | ❌ QUESTO È IL PROBLEMA!      |
| Utenti SENZA profilo     | 2      | ❌ Alcuni utenti senza profilo|
```

#### Sezione 2: Dettaglio Utenti
```
| info              | email                     | uuid                                 | stato          |
|-------------------|---------------------------|--------------------------------------|----------------|
| 🔍 DETTAGLIO      | admin@rbslogistica.local  | 123e4567-e89b-12d3-a456-426614174000 | ❌ MANCA PROFILO|
| 🔍 DETTAGLIO      | user@rbslogistica.local   | 223e4567-e89b-12d3-a456-426614174001 | ❌ MANCA PROFILO|
```

#### Sezione 3: Diagnosi
```
| tipo       | risultato                                            | azione                                    |
|------------|------------------------------------------------------|-------------------------------------------|
| 🎯 DIAGNOSI| ❌ PROBLEMA: user_profiles è VUOTA!                 | Esegui la query qui sotto                 |
```

### Passo 3: Applica la Soluzione

Scorri in fondo al file `diagnostic-quick.sql` e troverai:

```sql
/*
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'COPIA-UUID-DA-TABELLA-SOPRA',  -- ← Sostituisci con 123e4567-e89b-12d3...
    'admin',                         -- ← Username
    'Amministratore',               -- ← Nome da visualizzare
    'admin'                         -- ← Ruolo: admin o user
);
*/
```

**Rimuovi il commento** `/* */` e sostituisci i valori:

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',  -- UUID da DETTAGLIO UTENTI
    'admin',
    'Amministratore',
    'admin'
);

INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '223e4567-e89b-12d3-a456-426614174001',
    'mario.rossi',
    'Mario Rossi',
    'user'
);
```

### Passo 4: Esegui INSERT

Seleziona solo le query INSERT e clicca Run.

### Passo 5: Verifica

Esegui di nuovo `diagnostic-quick.sql`. Ora dovrebbe dire:

```
✅ TUTTO OK con utenti e profili
```

### Passo 6: Testa il Login

Vai su `index.html` e prova a fare login. Dovrebbe funzionare! ✅

---

## ❓ FAQ

### Q: Quale file devo usare?
**A:** Usa `diagnostic-quick.sql` - è il più veloce e include già la soluzione.

### Q: La query non restituisce nulla
**A:** Prova `diagnostic-quick.sql` invece di `diagnostic-check-database.sql`.

### Q: Dice "user_profiles è VUOTA" - cosa faccio?
**A:** Segui le istruzioni in fondo a `diagnostic-quick.sql` per creare i profili.

### Q: Ho creato i profili ma il login non funziona
**A:**
1. Verifica che gli UUID siano corretti
2. Pulisci cache e cookie del browser
3. Prova in modalità incognito
4. Leggi `FIX-LOGIN-LOOP-AFTER-DB-RESTART.md` SOLUZIONE 4

### Q: Dice "RLS disabilitato"
**A:** Leggi `FIX-LOGIN-LOOP-AFTER-DB-RESTART.md` SOLUZIONE 3 per riabilitarlo.

---

## 🔗 File di Riferimento

- 📖 **Guida completa:** `FIX-LOGIN-LOOP-AFTER-DB-RESTART.md`
- 🔧 **Migrazioni database:**
  - `supabase-migration-add-missing-fields.sql`
  - `supabase-migration-fix-delete-trigger.sql`
- 🔧 **Schema completo:** `supabase-schema.sql`

---

**Creato:** 2025-12-08
**Versione:** 1.0
**Branch:** `claude/fix-trip-creation-errors-011CUytvs1eM89MFwVqzT3DE`
