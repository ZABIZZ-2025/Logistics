# 🔧 Troubleshooting Login Supabase

## Problema: Login Loop (rimanda sempre alla pagina di login)

Questo documento ti guida passo-passo per risolvere il problema del login che non funziona.

---

## ✅ SOLUZIONE RAPIDA - Usa il Login DEBUG

Ho creato un file speciale che mostra esattamente cosa succede durante il login.

### STEP 1: Apri il File DEBUG

```
Apri: login-supabase-DEBUG.html
```

Questo file è identico al login normale, ma mostra un LOG dettagliato in tempo reale.

### STEP 2: Prova a Fare Login

1. Inserisci le credenziali:
   - Email: `admin@rbslogistica.local`
   - Password: `admin123`

2. Clicca "Accedi"

3. **GUARDA IL LOG NERO** in fondo alla pagina
   - Mostra esattamente cosa succede
   - Evidenzia gli errori in rosso
   - Suggerisce la soluzione

### STEP 3: Identifica l'Errore

Il log ti dirà esattamente qual è il problema. I più comuni:

---

## 🔴 ERRORE 1: "supabase-config.js non configurato"

### Sintomo
```
❌ ERRORE: supabase-config.js non configurato!
⚠️ Devi modificare supabase-config.js con le tue credenziali
```

### Causa
Non hai modificato il file `supabase-config.js` con le tue credenziali Supabase.

### Soluzione

1. **Apri Supabase Dashboard**
   - Vai su https://app.supabase.com
   - Login con il tuo account
   - Seleziona il progetto "RBS Logistica"

2. **Copia le Credenziali**
   - Clicca sull'icona ingranaggio (Project Settings)
   - Vai su "API"
   - Copia:
     - **Project URL** (es: `https://xyzabcd.supabase.co`)
     - **anon public key** (lunga stringa che inizia con `eyJhbGci...`)

3. **Modifica supabase-config.js**
   ```javascript
   const SUPABASE_CONFIG = {
       // SOSTITUISCI questa riga:
       url: 'https://xyzabcd.supabase.co',  // ← Il tuo URL

       // SOSTITUISCI questa riga:
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← La tua key
   };
   ```

4. **Salva il file**

5. **Riprova il login**

---

## 🔴 ERRORE 2: "Invalid login credentials"

### Sintomo
```
❌ ERRORE Supabase Auth: Invalid login credentials
❌ Email o password non corretti
```

### Causa
1. Email o password sbagliate
2. Utente non creato in Supabase
3. Password diversa da quella che pensi

### Soluzione

#### Verifica Utente Esistente

1. **Vai su Supabase Dashboard**
   - Authentication > Users

2. **Controlla se l'utente esiste**
   - Cerca: `admin@rbslogistica.local`
   - Se NON c'è, continua con "Crea Utente"

#### Crea Utente (se non esiste)

1. **In Supabase Dashboard**
   - Authentication > Users
   - Clicca "Add user" > "Create new user"

2. **Compila i campi**
   ```
   Email: admin@rbslogistica.local
   Password: admin123
   ✅ Auto Confirm User: ABILITA (importante!)
   ```

3. **Clicca "Create user"**

4. **Copia l'UUID dell'utente**
   - Esempio: `550e8400-e29b-41d4-a716-446655440000`

5. **IMPORTANTE: Inserisci il profilo** (vedi ERRORE 3)

---

## 🔴 ERRORE 3: "Profilo utente non trovato"

### Sintomo
```
❌ ERRORE recupero profilo: row not found
⚠️ Probabilmente il profilo non è stato inserito in user_profiles
```

### Causa
Hai creato l'utente in Authentication, ma NON hai inserito il profilo in `user_profiles`.

### Soluzione

1. **Copia l'UUID dell'utente**
   - Vai su Authentication > Users
   - Trova l'utente `admin@rbslogistica.local`
   - Copia il suo UUID (es: `550e8400-e29b-41d4-a716-446655440000`)

2. **Vai al SQL Editor**
   - Clicca "SQL Editor" nel menu laterale
   - Clicca "+ New query"

3. **Esegui questa query** (SOSTITUISCI l'UUID!)
   ```sql
   INSERT INTO user_profiles (id, user_id, username, role)
   VALUES (
       '550e8400-e29b-41d4-a716-446655440000',  -- ← SOSTITUISCI con il TUO UUID!
       'admin',
       'Amministratore',
       'admin'
   );
   ```

4. **Clicca "Run"**

5. **Verifica**
   - Dovresti vedere: "Success. 1 row affected"

6. **Riprova il login**

---

## 🔴 ERRORE 4: "Email not confirmed"

### Sintomo
```
❌ Email non confermata
```

### Causa
Quando hai creato l'utente, non hai abilitato "Auto Confirm User".

### Soluzione

#### Opzione A: Abilita Auto Confirm (Consigliato)

1. **Elimina l'utente esistente**
   - Authentication > Users
   - Trova l'utente
   - Click sui "..." > "Delete user"

2. **Ricrea l'utente**
   - Clicca "Add user" > "Create new user"
   - Email: `admin@rbslogistica.local`
   - Password: `admin123`
   - ✅ **IMPORTANTE: Abilita "Auto Confirm User"**
   - Clicca "Create user"

3. **Inserisci profilo** (vedi ERRORE 3)

#### Opzione B: Conferma Manualmente

1. **Authentication > Users**
2. Trova l'utente
3. Click sui "..." > "Send confirmation email"
4. Vai nella tua email
5. Clicca sul link di conferma

---

## 🔴 ERRORE 5: "Failed to fetch" o "Network Error"

### Sintomo
```
❌ Failed to fetch
❌ Network request failed
```

### Causa
1. File aperto con `file://` invece di server HTTP
2. Problemi di CORS
3. Nessuna connessione internet

### Soluzione

#### Verifica Connessione Internet

1. Apri https://google.com
2. Se funziona, NON è un problema di internet

#### Usa un Server Locale

Non aprire il file direttamente (`file://`). Usa un server HTTP:

##### Opzione A: VS Code Live Server

1. Installa "Live Server" in VS Code
2. Click destro su `login-supabase-DEBUG.html`
3. Seleziona "Open with Live Server"

##### Opzione B: Python Server

```bash
# In una finestra di comando, nella cartella dell'app:
cd "C:\Users\michelangelo.zanardo\Documents\RBS\Progetti RBS\Trasporti\RBS_Logistica_Supabase"

# Se hai Python 3:
python -m http.server 8000

# Poi apri: http://localhost:8000/login-supabase-DEBUG.html
```

##### Opzione C: Node.js http-server

```bash
# Installa http-server (una volta):
npm install -g http-server

# Nella cartella dell'app:
cd "C:\Users\michelangelo.zanardo\Documents\RBS\Progetti RBS\Trasporti\RBS_Logistica_Supabase"
http-server

# Poi apri: http://localhost:8080/login-supabase-DEBUG.html
```

---

## 🔴 ERRORE 6: Schema Database Non Eseguito

### Sintomo
```
❌ relation "user_profiles" does not exist
```

### Causa
Non hai eseguito `supabase-schema.sql` nel SQL Editor.

### Soluzione

1. **Apri il file** `supabase-schema.sql`

2. **Copia TUTTO il contenuto** (Ctrl+A, Ctrl+C)

3. **Vai su Supabase Dashboard**
   - SQL Editor
   - "+ New query"

4. **Incolla** tutto il contenuto (Ctrl+V)

5. **Clicca "Run"**

6. **Verifica**
   - Vai su "Table Editor"
   - Dovresti vedere 4 tabelle:
     - user_profiles ✅
     - anagrafica ✅
     - viaggi ✅
     - history ✅

7. **Riprova il login**

---

## ✅ CHECKLIST COMPLETA

Prima di fare login, verifica:

- [ ] **Supabase account creato**
  - Vai su https://app.supabase.com
  - Dovresti vedere il progetto "RBS Logistica"

- [ ] **Schema SQL eseguito**
  - Table Editor > Dovresti vedere 4 tabelle

- [ ] **Credenziali configurate**
  - Apri `supabase-config.js`
  - Verifica che url e anonKey NON siano 'YOUR_SUPABASE_...'

- [ ] **Utente admin creato**
  - Authentication > Users
  - Dovresti vedere `admin@rbslogistica.local`
  - Status: "Confirmed" (non "Waiting for verification")

- [ ] **Profilo inserito**
  - SQL Editor > Nuova query
  - Esegui: `SELECT * FROM user_profiles;`
  - Dovresti vedere almeno 1 riga con role='admin'

- [ ] **File aperto correttamente**
  - Usa un server HTTP (Live Server, Python, Node.js)
  - NON aprire con `file://`

---

## 🆘 Se Nulla Funziona

### Prova Questo Test

1. **Apri** `login-supabase-DEBUG.html`

2. **Premi F12** (Console)

3. **Fai login**

4. **Fai uno screenshot** del LOG nero

5. **Inviane lo screenshot** o copia/incolla il contenuto

Ti dirà ESATTAMENTE qual è il problema.

---

## 📊 Test di Verifica Supabase

Puoi anche testare direttamente da Supabase:

1. **Vai su Supabase Dashboard**
2. **Authentication > Users**
3. **Clicca sull'utente** `admin@rbslogistica.local`
4. **Clicca "Send magic link"** (per testare)
5. **Se ricevi l'email** = Supabase funziona

Oppure:

1. **SQL Editor**
2. Nuova query
3. Esegui:
   ```sql
   SELECT
       u.id,
       u.email,
       up.username,
       up.role
   FROM auth.users u
   LEFT JOIN user_profiles up ON u.id = up.id
   WHERE u.email = 'admin@rbslogistica.local';
   ```
4. **Dovresti vedere**:
   ```
   id: (UUID)
   email: admin@rbslogistica.local
   username: Amministratore
   role: admin
   ```

Se vedi `null` per username e role = **ERRORE 3** (profilo non inserito)

---

## 🎯 Risoluzione Garantita

Se segui questa guida passo-passo, il login funzionerà sicuramente.

Il 99% dei problemi è uno di questi:
1. ❌ `supabase-config.js` non modificato (ERRORE 1)
2. ❌ Utente non creato (ERRORE 2)
3. ❌ Profilo non inserito (ERRORE 3)
4. ❌ Auto Confirm User non abilitato (ERRORE 4)

**Usa `login-supabase-DEBUG.html` per sapere quale!**

---

## 📞 Supporto Aggiuntivo

Se continui ad avere problemi:

1. Usa `login-supabase-DEBUG.html`
2. Fai screenshot del LOG nero
3. Controlla console browser (F12 > Console)
4. Inviami i dettagli dell'errore

Il debug LOG ti dirà la soluzione! 🔍
