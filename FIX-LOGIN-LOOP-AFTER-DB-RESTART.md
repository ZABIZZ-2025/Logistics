# 🔧 Guida: Fix Login Loop dopo Riattivazione Supabase

## 📋 Problema Identificato

Dopo la riattivazione del database Supabase (bloccato per inattività), si verifica un **loop infinito di login**:

1. ✅ Inserisco email e password
2. ✅ Clicco "Accedi"
3. ❌ La pagina si ricarica e torna al login invece di entrare nell'app

## 🔍 Cause Possibili

Ci sono **3 possibili cause** per questo comportamento:

### Causa 1: Tabella `user_profiles` Vuota o Mancante
**Cosa succede:**
- Il login su Supabase Auth funziona ✅
- La sessione viene creata ✅
- Ma la tabella `user_profiles` è vuota o non esiste ❌
- Il codice non trova il profilo utente e fa logout automatico
- Redirect al login → **LOOP!**

**Probabilità:** ⚠️ **ALTA** - Dopo la pausa/riattivazione, i dati potrebbero essere stati persi

---

### Causa 2: Policy RLS Disabilitate o Non Funzionanti
**Cosa succede:**
- Il login funziona ✅
- La tabella `user_profiles` esiste e contiene dati ✅
- Ma le Row Level Security (RLS) policies bloccano l'accesso ❌
- Il codice riceve un errore di permesso
- Logout e redirect al login → **LOOP!**

**Probabilità:** ⚠️ **MEDIA** - Le policy RLS potrebbero essere state disabilitate durante la pausa

---

### Causa 3: Sessione Non Persistita
**Cosa succede:**
- Il login funziona ✅
- Ma la sessione non viene salvata nei cookie/localStorage ❌
- Quando si apre `dashboard.html`, la sessione non esiste più
- Redirect immediato al login → **LOOP!**

**Probabilità:** ⚠️ **BASSA** - Ma possibile se c'è un problema con i cookie del browser

---

## 🔎 DIAGNOSTICA - Identifica la Causa

Segui questi passaggi per capire quale delle 3 cause sta causando il problema:

### STEP 1: Verifica Connessione Supabase

1. Apri **Supabase Dashboard** → https://supabase.com/dashboard
2. Seleziona il tuo progetto **RBS Logistica**
3. Vai su **Settings** → **API**
4. Verifica che:
   - **Project URL** corrisponde a quello in `supabase-config.js` (riga 14)
   - **anon public key** corrisponde a quella in `supabase-config.js` (riga 17)

**Se non corrispondono:**
- ✏️ Aggiorna `supabase-config.js` con i valori corretti
- 🔄 Riprova il login

---

### STEP 2: Verifica Stato Database

1. Apri **Supabase Dashboard** → **SQL Editor**
2. Esegui questa query diagnostica:

```sql
-- ==========================================
-- QUERY DIAGNOSTICA - Stato Database
-- ==========================================

-- 1. Verifica tabelle esistenti
SELECT 'Tabelle esistenti:' AS diagnostica;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verifica utenti in auth.users
SELECT 'Utenti in auth.users:' AS diagnostica;
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Verifica profili in user_profiles
SELECT 'Profili in user_profiles:' AS diagnostica;
SELECT id, user_id, username, role, created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 4. Verifica policy RLS attive
SELECT 'Policy RLS su user_profiles:' AS diagnostica;
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 5. Verifica RLS è abilitato
SELECT 'RLS abilitato su user_profiles:' AS diagnostica;
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'user_profiles';
```

**Analizza i risultati:**

#### Risultato A: Tabella `user_profiles` NON esiste
```
❌ La tabella user_profiles non viene mostrata
```
**Soluzione:** Vai a **SOLUZIONE 1**

#### Risultato B: Tabella `user_profiles` esiste ma è VUOTA
```
✅ La tabella user_profiles esiste
❌ SELECT da user_profiles ritorna 0 righe
✅ Ma ci sono utenti in auth.users
```
**Soluzione:** Vai a **SOLUZIONE 2**

#### Risultato C: Profili esistono ma RLS è disabilitato o policy mancanti
```
✅ La tabella user_profiles esiste
✅ Ci sono profili in user_profiles
❌ relrowsecurity = false (RLS disabilitato)
  oppure
❌ Nessuna policy RLS trovata
```
**Soluzione:** Vai a **SOLUZIONE 3**

#### Risultato D: Tutto sembra OK nel database
```
✅ Tabella esiste
✅ Profili esistono
✅ RLS abilitato
✅ Policy presenti
```
**Soluzione:** Vai a **SOLUZIONE 4** (problema di sessione browser)

---

## ✅ SOLUZIONI

### SOLUZIONE 1: Ricrea Schema Completo

Se la tabella `user_profiles` non esiste, devi ricreare tutto lo schema:

1. **Backup degli utenti esistenti in auth.users** (importante!)
   - Vai su **Authentication** → **Users**
   - Annota email e ruoli di tutti gli utenti

2. **Esegui lo schema completo**
   - Apri **SQL Editor** → **New query**
   - Copia il contenuto di `supabase-schema.sql`
   - Esegui la query

3. **Ricrea i profili utente**
   - Per ogni utente in auth.users, crea il profilo corrispondente
   - Usa questa query (sostituisci i valori):

```sql
-- Inserisci profilo per ogni utente
-- SOSTITUISCI i valori tra ' ' con quelli corretti

-- Esempio Admin
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID-DELL-UTENTE-DA-AUTH-USERS', -- ID da auth.users
    'admin',                           -- Username di login
    'Amministratore',                  -- Nome visualizzato
    'admin'                            -- Ruolo (admin o user)
);

-- Esempio User
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID-DELL-ALTRO-UTENTE',
    'mario.rossi',
    'Mario Rossi',
    'user'
);
```

4. **Testa il login**

---

### SOLUZIONE 2: Ricrea Solo i Profili Utente

Se la tabella esiste ma è vuota:

1. **Ottieni gli UUID degli utenti**
```sql
SELECT id, email FROM auth.users;
```

2. **Inserisci i profili mancanti**
```sql
-- Per ogni utente, inserisci il profilo
-- ESEMPIO per admin@rbslogistica.local

INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',  -- UUID da query precedente
    'admin',                                  -- Username
    'Amministratore',                         -- Nome
    'admin'                                   -- Ruolo
);

-- ESEMPIO per user@rbslogistica.local
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '223e4567-e89b-12d3-a456-426614174001',
    'utente',
    'Mario Rossi',
    'user'
);
```

3. **Verifica inserimento**
```sql
SELECT * FROM user_profiles;
```

4. **Testa il login**

---

### SOLUZIONE 3: Riabilita RLS e Policy

Se RLS è disabilitato o le policy mancano:

1. **Abilita RLS**
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anagrafica ENABLE ROW LEVEL SECURITY;
ALTER TABLE viaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
```

2. **Ricrea le Policy**
   - Apri **SQL Editor**
   - Esegui questa sezione dello schema:

```sql
-- ============================================
-- POLICIES: user_profiles
-- ============================================

-- Prima elimina le policy esistenti (se ce ne sono di vecchie)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

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
```

3. **Verifica policy create**
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
```

4. **Testa il login**

---

### SOLUZIONE 4: Problema Sessione Browser

Se tutto sembra OK nel database ma il login non funziona:

1. **Pulisci cache e cookie del browser**
   - Chrome: `Ctrl+Shift+Del` → Seleziona "Cookie e altri dati dei siti" → "Cancella dati"
   - Firefox: `Ctrl+Shift+Del` → Seleziona "Cookie" → "Cancella adesso"
   - Edge: `Ctrl+Shift+Del` → Seleziona "Cookie e altri dati dei siti" → "Cancella"

2. **Verifica localStorage Supabase**
   - Apri il browser sulla pagina di login
   - Premi `F12` (DevTools)
   - Vai su **Application** → **Local Storage**
   - Elimina tutte le chiavi che iniziano con `supabase.auth`

3. **Riprova il login in modalità incognito**
   - Apri una finestra in incognito/privata
   - Vai alla pagina di login
   - Inserisci le credenziali
   - Se funziona → il problema era la cache

4. **Verifica console JavaScript**
   - Apri DevTools (`F12`)
   - Vai su **Console**
   - Riprova il login
   - Guarda se ci sono errori JavaScript

---

## 🧪 Test di Verifica

Dopo aver applicato una delle soluzioni:

### Test 1: Login Admin
1. Vai su `index.html`
2. Inserisci credenziali admin
3. Clicca "Accedi"
4. ✅ Dovresti vedere: "Accesso riuscito! Benvenuto Amministratore"
5. ✅ Redirect automatico a `dashboard.html`
6. ✅ Dovresti vedere la Kanban board

### Test 2: Login User
1. Logout (se loggato come admin)
2. Vai su `index.html`
3. Inserisci credenziali user
4. Clicca "Accedi"
5. ✅ Dovresti vedere: "Accesso riuscito! Benvenuto [Nome]"
6. ✅ Redirect automatico a `dashboard.html`
7. ✅ Dovresti vedere il form di richiesta viaggi (non la Kanban)

---

## 🔍 Debug Avanzato

Se il problema persiste, abilita il debug:

### Opzione A: Log in Console Browser

1. Apri `index.html` nella pagina di login
2. Premi `F12` (DevTools)
3. Vai su **Console**
4. Riprova il login
5. Cerca questi messaggi:
   - ✅ `"Attempting login with email: ..."`
   - ✅ `"Login successful, user:"`
   - ❌ `"Error: Profilo utente non trovato"`
   - ❌ `"Invalid login credentials"`

### Opzione B: Verifica Manuale Sessione

Aggiungi questo codice nella console del browser (F12) quando sei su `dashboard.html`:

```javascript
import { supabase } from './supabase-config.js';

// Verifica sessione
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Sessione:', session);
console.log('Errore sessione:', error);

// Verifica profilo
if (session) {
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    console.log('Profilo:', profile);
    console.log('Errore profilo:', profileError);
}
```

Analizza i risultati:
- Se `session` è `null` → problema di autenticazione Supabase
- Se `profileError` esiste → problema di query/RLS
- Se `profile` è `null` → profilo mancante nel database

---

## 📞 Checklist Completa

Prima di contattare il supporto, verifica:

- [ ] URL e API key in `supabase-config.js` sono corretti
- [ ] Database Supabase è attivo (non in pausa)
- [ ] Tabella `user_profiles` esiste
- [ ] Ci sono record in `user_profiles` con gli UUID corretti
- [ ] RLS è abilitato su `user_profiles`
- [ ] Le policy RLS sono presenti e corrette
- [ ] Cache e cookie del browser sono stati puliti
- [ ] Hai provato in modalità incognito
- [ ] Console browser non mostra errori JavaScript
- [ ] Le migrazioni sono state applicate (`supabase-migration-add-missing-fields.sql` e `supabase-migration-fix-delete-trigger.sql`)

---

## 📝 Query Utili per Diagnostica

```sql
-- Verifica completa stato database
SELECT
    'auth.users' AS tabella,
    COUNT(*) AS count
FROM auth.users
UNION ALL
SELECT
    'user_profiles' AS tabella,
    COUNT(*) AS count
FROM user_profiles
UNION ALL
SELECT
    'viaggi' AS tabella,
    COUNT(*) AS count
FROM viaggi
UNION ALL
SELECT
    'anagrafica' AS tabella,
    COUNT(*) AS count
FROM anagrafica;

-- Verifica corrispondenza auth.users <-> user_profiles
SELECT
    u.email,
    u.id AS auth_id,
    p.id AS profile_id,
    p.username,
    p.role,
    CASE
        WHEN p.id IS NULL THEN '❌ PROFILO MANCANTE'
        ELSE '✅ OK'
    END AS status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.email;
```

---

**Data guida**: 2025-12-08
**Versione**: 1.0
**Branch**: `claude/fix-trip-creation-errors-011CUytvs1eM89MFwVqzT3DE`
