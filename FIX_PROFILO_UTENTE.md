# 🔧 Fix Profilo Utente Non Trovato - Supabase

## ✅ Ottimo! La Pagina Si Apre

Il fix per l'errore 404 ha funzionato! Ora risolviamo il problema del profilo.

---

## 🔍 DIAGNOSI PROBLEMA

**Errore**: "Profilo utente non trovato" o "Profilo non configurato"

**Causa**: L'utente esiste in Supabase Authentication, ma:
- Il profilo NON è stato inserito nella tabella `user_profiles`
- Oppure l'UUID non corrisponde tra `auth.users` e `user_profiles`

---

## 🛠️ SOLUZIONE RAPIDA (5 minuti)

### STEP 1: Verifica Utente in Authentication

1. Vai su https://app.supabase.com
2. Seleziona il progetto **"RBS Logistica"**
3. Menu laterale: **Authentication** > **Users**
4. Cerca l'utente: `admin@rbslogistica.local`

**✅ Se lo vedi:**
- Click sull'utente
- **COPIA L'UUID** (es: `550e8400-e29b-41d4-a716-446655440000`)
- Verifica che lo status sia: **"Confirmed"** ✅ (verde)
- Se lo status è "Unconfirmed", vedi sezione "Status Unconfirmed" sotto

**❌ Se NON lo vedi:**
- Vai allo STEP A (Crea Utente) sotto

---

### STEP 2: Verifica Profilo in Database

1. Menu laterale: **SQL Editor**
2. Click **"New query"**
3. Copia e incolla questa query:

```sql
-- Verifica utente e profilo
SELECT
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    up.id as profile_id,
    up.user_id as profile_user_id,
    up.username,
    up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@rbslogistica.local';
```

4. Click **"Run"** (o Ctrl+Enter)

---

### STEP 3: Analizza Risultato

#### ✅ **Caso 1: Utente trovato, Profilo MANCANTE**

Risultato query:
```
user_id: 550e8400-e29b-41d4-a716-446655440000
email: admin@rbslogistica.local
email_confirmed_at: 2025-11-09 10:30:00
profile_id: NULL          ← ❌ PROBLEMA!
username: NULL            ← ❌ PROBLEMA!
role: NULL                ← ❌ PROBLEMA!
```

**Soluzione**: Vai allo **STEP B** (Inserisci Profilo)

---

#### ✅ **Caso 2: Utente NON trovato**

Risultato query:
```
No rows returned
```

**Soluzione**: Vai allo **STEP A** (Crea Utente)

---

#### ✅ **Caso 3: UUID Non Corrispondente**

Risultato query:
```
user_id: 550e8400-e29b-41d4-a716-446655440000
profile_id: aaa11111-bbbb-cccc-dddd-eeeeeeeeeeee  ← ❌ DIVERSO!
username: Amministratore
role: admin
```

**Soluzione**: Vai allo **STEP C** (Correggi UUID)

---

## 🔧 STEP A: Crea Utente (Se Non Esiste)

1. **Authentication** > **Users**
2. Click **"Add user"** (bottone verde in alto a destra)
3. Seleziona **"Create new user"**
4. Compila:
   - **Email**: `admin@rbslogistica.local`
   - **Password**: (scegli una password sicura, es: `RBS2025!admin`)
   - ✅ **IMPORTANTE**: Spunta **"Auto Confirm User"**
5. Click **"Create user"**

6. **L'utente appare nella lista**
7. **Click sull'utente** appena creato
8. **COPIA L'UUID** (stringa tipo: `550e8400-e29b-41d4-a716-446655440000`)
9. **Salvalo in Notepad** (ti serve per STEP B)

**Poi vai allo STEP B** per inserire il profilo

---

## 🔧 STEP B: Inserisci Profilo (Profilo Mancante)

1. Menu laterale: **SQL Editor**
2. Click **"New query"**
3. Copia questa query:

```sql
-- Inserisci profilo admin
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_DELL_UTENTE_QUI',  -- ← SOSTITUISCI con UUID copiato sopra!
    'admin',
    'Amministratore',
    'admin'
);
```

4. **IMPORTANTE**: Sostituisci `'UUID_DELL_UTENTE_QUI'` con l'UUID che hai copiato

   **Esempio** (i tuoi valori saranno diversi!):
   ```sql
   INSERT INTO user_profiles (id, user_id, username, role)
   VALUES (
       '550e8400-e29b-41d4-a716-446655440000',  -- ← Il tuo UUID qui
       'admin',
       'Amministratore',
       'admin'
   );
   ```

5. Click **"Run"** (Ctrl+Enter)

6. **Verifica**: Dovresti vedere **"Success. 1 row affected"** ✅

7. **Vai allo STEP D** (Test Login)

---

## 🔧 STEP C: Correggi UUID (Se Non Corrisponde)

Se `user_id` e `profile_id` sono diversi:

1. **SQL Editor** > **"New query"**
2. Copia questa query:

```sql
-- Correggi UUID profilo
UPDATE user_profiles
SET id = (
    SELECT id FROM auth.users WHERE email = 'admin@rbslogistica.local'
)
WHERE user_id = 'admin';
```

3. Click **"Run"**
4. Verifica: **"Success. 1 row affected"**
5. **Vai allo STEP D** (Test Login)

---

## 🔧 STEP D: Verifica Finale

Esegui di nuovo la query di verifica:

```sql
SELECT
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    up.id as profile_id,
    up.username,
    up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@rbslogistica.local';
```

**Risultato CORRETTO** ✅:
```
user_id: 550e8400-e29b-41d4-a716-446655440000
email: admin@rbslogistica.local
email_confirmed_at: 2025-11-09 10:30:00  ← ✅ NON NULL!
profile_id: 550e8400-e29b-41d4-a716-446655440000  ← ✅ UGUALE a user_id!
username: Amministratore  ← ✅ NON NULL!
role: admin  ← ✅ NON NULL!
```

Se tutto è ✅, vai allo **STEP E** (Test Login)

---

## 🔧 STEP E: Test Login

1. **Torna alla pagina dell'app** su Netlify
2. **Ricarica la pagina** (Ctrl+R o F5)
3. **Fai login**:
   - Email: `admin@rbslogistica.local`
   - Password: (quella che hai scelto)
4. Click **"Accedi"**

**✅ Dovrebbe funzionare!**

Se funziona vedrai:
- ✅ **"Accesso riuscito! Benvenuto Amministratore"** (messaggio verde)
- ✅ Redirect alla **Dashboard Kanban**
- ✅ Nome utente in alto a destra: "Amministratore"

---

## 🆘 SE ANCORA NON FUNZIONA

### Errore: "Email not confirmed"

**Causa**: Utente non confermato
**Soluzione**:

1. **Authentication** > **Users** > Click utente
2. Menu a destra, click **"..."** (tre puntini)
3. Click **"Confirm email"**
4. Riprova login

---

### Errore: "Invalid login credentials"

**Causa**: Password errata o utente non esiste
**Soluzione**:

**Opzione A - Reset Password:**
1. **Authentication** > **Users** > Click utente
2. Menu a destra, click **"..."**
3. Click **"Send password recovery"**
4. Oppure elimina e ricrea utente (STEP A)

**Opzione B - Usa Console Browser per Debug:**
1. Apri app Netlify
2. Premi **F12**
3. Vai al tab **"Console"**
4. Prova di nuovo il login
5. Guarda gli errori in rosso
6. Inviami screenshot degli errori

---

### Errore: "relation user_profiles does not exist"

**Causa**: Schema SQL non eseguito
**Soluzione**:

1. **SQL Editor** > **"New query"**
2. Apri file `supabase-schema.sql` dal progetto
3. Copia TUTTO il contenuto
4. Incolla nell'editor Supabase
5. Click **"Run"**
6. Verifica: **"Success"**
7. Vai su **Table Editor** > Dovresti vedere 4 tabelle:
   - `user_profiles`
   - `anagrafica`
   - `viaggi`
   - `history`

Poi ripeti STEP B (Inserisci Profilo)

---

## 📋 CHECKLIST COMPLETA

Prima di fare login, verifica:

- [ ] **Progetto Supabase creato**: "RBS Logistica"
- [ ] **Schema SQL eseguito**: 4 tabelle in Table Editor
- [ ] **Utente creato**: Authentication > Users > `admin@rbslogistica.local`
- [ ] **Utente confermato**: Status "Confirmed" ✅ (verde)
- [ ] **UUID copiato**: Stringa tipo `550e8400-...`
- [ ] **Profilo inserito**: Query INSERT eseguita con successo
- [ ] **Verifica query OK**: Query SELECT mostra tutti i campi NON NULL
- [ ] **File config modificato**: `supabase-config.js` con URL e key reali

Se tutti i punti sono ✅, il login **DEVE** funzionare!

---

## 🔍 DEBUG AVANZATO

### Query Diagnostica Completa

```sql
-- 1. Verifica utente
SELECT * FROM auth.users WHERE email = 'admin@rbslogistica.local';

-- 2. Verifica profilo
SELECT * FROM user_profiles WHERE user_id = 'admin';

-- 3. Verifica join
SELECT
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.confirmed_at,
    u.created_at,
    up.id as profile_id,
    up.user_id as profile_user_id,
    up.username,
    up.role,
    up.created_at as profile_created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@rbslogistica.local';

-- 4. Conta profili
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- 5. Lista tutti i profili
SELECT * FROM user_profiles;
```

Esegui tutte queste query e analizza i risultati.

---

## 📖 ESEMPIO COMPLETO

### Situazione Iniziale (ERRORE)
```
Console browser (F12):
❌ Errore caricamento profilo: {...}
⚠️ Profilo utente non trovato
```

### Verifica Query
```sql
SELECT u.id, u.email, up.username, up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@rbslogistica.local';

Risultato:
user_id: 550e8400-e29b-41d4-a716-446655440000
email: admin@rbslogistica.local
username: NULL  ← ❌ PROBLEMA
role: NULL      ← ❌ PROBLEMA
```

### Soluzione Applicata
```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin',
    'Amministratore',
    'admin'
);

Risultato: Success. 1 row affected ✅
```

### Verifica Finale
```sql
SELECT u.id, u.email, up.username, up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@rbslogistica.local';

Risultato:
user_id: 550e8400-e29b-41d4-a716-446655440000
email: admin@rbslogistica.local
username: Amministratore  ← ✅ OK!
role: admin              ← ✅ OK!
```

### Test Login
```
Login page:
Email: admin@rbslogistica.local
Password: RBS2025!admin
Click "Accedi"

Risultato:
✅ Accesso riuscito! Benvenuto Amministratore
→ Redirect a dashboard.html
✅ Dashboard caricata con nome utente in alto
```

---

## 🎯 RISOLUZIONE VELOCE (1 minuto)

Se sei sicuro che l'utente esiste ma il profilo no:

```sql
-- Copia UUID utente
SELECT id, email FROM auth.users WHERE email = 'admin@rbslogistica.local';
-- Risultato: 550e8400-e29b-41d4-a716-446655440000

-- Inserisci profilo (SOSTITUISCI UUID!)
INSERT INTO user_profiles (id, user_id, username, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'Amministratore', 'admin');

-- Verifica
SELECT * FROM user_profiles WHERE user_id = 'admin';
-- Risultato: 1 riga con tutti i campi compilati ✅

-- Login DOVREBBE FUNZIONARE!
```

---

## 📞 SUPPORTO

Se dopo tutti questi step ancora non funziona:

1. **Screenshot Console Browser** (F12 > Console > Screenshot errori)
2. **Screenshot Query Verifica** (risultato della query SELECT sopra)
3. **Screenshot Authentication Users** (lista utenti in Supabase)

Con questi 3 screenshot posso identificare esattamente il problema.

---

**Tempo richiesto**: 5 minuti
**Difficoltà**: Facile (copy-paste query SQL)
**Tasso successo**: 99% (problema molto comune e facilmente risolvibile)

---

_Ultimo aggiornamento: 9 Novembre 2025_
_Fix applicato: Query INSERT profilo mancante_
