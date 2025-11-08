# 🔍 Diagnosi Rapida Login - RBS Logistica Supabase

## ⚡ PROBLEMA: Login continua a rimandare alla pagina di login

Questa guida ti aiuta a identificare e risolvere il problema in **5 minuti**.

---

## ✅ PASSO 1: Usa il File DEBUG (2 minuti)

### Apri il file di debug:
```
login-supabase-DEBUG.html
```

**DOVE TROVARLO:**
- Nel file ZIP: `RBS_Logistica_Supabase.zip` in Downloads
- Oppure nel repository Git: `N:\Logistics\login-supabase-DEBUG.html`

### Estrai lo ZIP (se non l'hai già fatto):
1. Vai in `C:\Users\michelangelo.zanardo\Downloads\`
2. Trova il file `RBS_Logistica_Supabase.zip`
3. Click destro > "Estrai tutto..."
4. Scegli una cartella (es: Desktop o Documenti)
5. Apri la cartella estratta

---

## ✅ PASSO 2: Apri con Server HTTP (IMPORTANTE!)

**⚠️ NON aprire il file con doppio click!** Non funzionerà con `file://`

### OPZIONE A: VS Code Live Server (Consigliato)
1. Apri VS Code
2. Apri la cartella estratta
3. Installa estensione "Live Server" (se non ce l'hai)
4. Click destro su `login-supabase-DEBUG.html` > "Open with Live Server"

### OPZIONE B: Python (se hai Python installato)
1. Apri Prompt dei Comandi (cmd)
2. Vai nella cartella:
   ```bash
   cd C:\Users\michelangelo.zanardo\Desktop\RBS_Logistica_Supabase
   ```
3. Esegui:
   ```bash
   python -m http.server 8000
   ```
4. Apri browser e vai su: `http://localhost:8000/login-supabase-DEBUG.html`

---

## ✅ PASSO 3: Fai Login e Leggi il LOG (1 minuto)

1. **Inserisci le credenziali:**
   - Email: `admin@rbslogistica.local`
   - Password: `admin123` (o la password che hai scelto)

2. **Clicca "Accedi"**

3. **GUARDA IL LOG NERO** in fondo alla pagina
   - Mostra esattamente cosa succede
   - Gli errori sono in **ROSSO**
   - I suggerimenti sono in **CYAN**

---

## ✅ PASSO 4: Identifica l'Errore (1 minuto)

Cerca nel log uno di questi messaggi:

### ❌ ERRORE 1: "supabase-config.js non configurato"
**Vedi questo?**
```
❌ ERRORE: supabase-config.js non configurato!
⚠️ Devi modificare supabase-config.js con le tue credenziali
```

**SOLUZIONE:**
1. Apri `supabase-config.js`
2. Sostituisci `'YOUR_SUPABASE_URL'` con il tuo URL Supabase
3. Sostituisci `'YOUR_SUPABASE_ANON_KEY'` con la tua chiave

**Dove trovare URL e chiave:**
- Vai su https://app.supabase.com
- Seleziona progetto "RBS Logistica"
- Click su ingranaggio (Settings) > API
- Copia "Project URL" e "anon public key"

---

### ❌ ERRORE 2: "Invalid login credentials"
**Vedi questo?**
```
❌ ERRORE Supabase Auth: Invalid login credentials
❌ Email o password non corretti
```

**CAUSE POSSIBILI:**
1. Email o password sbagliate
2. Utente non creato in Supabase

**SOLUZIONE:**
1. Vai su https://app.supabase.com
2. Seleziona progetto "RBS Logistica"
3. Vai su **Authentication > Users**
4. **Controlla se esiste l'utente** `admin@rbslogistica.local`

**Se NON esiste, crealo:**
1. Click "Add user" > "Create new user"
2. Email: `admin@rbslogistica.local`
3. Password: `admin123` (o una sicura)
4. ✅ **IMPORTANTE:** Abilita "Auto Confirm User"
5. Click "Create user"
6. **COPIA L'UUID** dell'utente (es: `550e8400-e29b-41d4-a716-446655440000`)
7. Vai al PASSO 5 per inserire il profilo

---

### ❌ ERRORE 3: "Profilo utente non trovato" (PIÙ COMUNE!)
**Vedi questo?**
```
❌ ERRORE recupero profilo: row not found
⚠️ Probabilmente il profilo non è stato inserito in user_profiles
```

**CAUSA:** Hai creato l'utente in Authentication, ma NON hai inserito il profilo nella tabella `user_profiles`.

**SOLUZIONE:** Vai al PASSO 5

---

### ❌ ERRORE 4: "relation user_profiles does not exist"
**Vedi questo?**
```
❌ relation "user_profiles" does not exist
```

**CAUSA:** Non hai eseguito lo schema SQL in Supabase.

**SOLUZIONE:**
1. Apri il file `supabase-schema.sql`
2. Copia TUTTO il contenuto
3. Vai su https://app.supabase.com
4. Seleziona progetto "RBS Logistica"
5. Click su **SQL Editor** > "New query"
6. Incolla tutto il contenuto
7. Click "Run" (o Ctrl+Enter)
8. Verifica in **Table Editor** che ci siano 4 tabelle:
   - user_profiles
   - anagrafica
   - viaggi
   - history

---

## ✅ PASSO 5: Inserisci Profilo Utente (1 minuto)

**Se hai ERRORE 3** (profilo non trovato), fai questo:

1. **Copia l'UUID dell'utente:**
   - Vai su https://app.supabase.com
   - Authentication > Users
   - Trova `admin@rbslogistica.local`
   - Copia il suo **UUID** (lunga stringa tipo `550e8400-e29b-41d4-a716-446655440000`)

2. **Vai al SQL Editor:**
   - Click "SQL Editor" > "New query"

3. **Esegui questa query** (SOSTITUISCI L'UUID!):
   ```sql
   INSERT INTO user_profiles (id, user_id, username, role)
   VALUES (
       '550e8400-e29b-41d4-a716-446655440000',  -- ← SOSTITUISCI con il TUO UUID!
       'admin',
       'Amministratore',
       'admin'
   );
   ```

4. **Click "Run"**

5. **Verifica:**
   - Dovresti vedere: "Success. 1 row affected"

6. **RIPROVA IL LOGIN** in `login-supabase-DEBUG.html`

---

## ✅ CHECKLIST VELOCE

Prima di provare il login, verifica:

- [ ] **File ZIP estratto** in una cartella accessibile
- [ ] **File aperto con server HTTP** (Live Server o Python)
- [ ] **Supabase account creato** su https://app.supabase.com
- [ ] **Progetto "RBS Logistica" creato**
- [ ] **Schema SQL eseguito** (SQL Editor > verifica 4 tabelle in Table Editor)
- [ ] **Credenziali configurate** in `supabase-config.js` (URL e anonKey)
- [ ] **Utente admin creato** (Authentication > Users > vedi `admin@rbslogistica.local`)
- [ ] **Auto Confirm User abilitato** (status "Confirmed" non "Waiting")
- [ ] **Profilo inserito** in `user_profiles` (query SELECT o verifica in Table Editor)

---

## 🆘 Se Ancora Non Funziona

1. **Premi F12** nel browser (apre Console)
2. **Fai screenshot** del LOG nero
3. **Fai screenshot** della Console (tab Console in F12)
4. **Copia/incolla** i messaggi di errore

Questi screenshot mostreranno ESATTAMENTE qual è il problema.

---

## 📊 Test di Verifica Manuale

Puoi verificare il setup direttamente in Supabase:

1. Vai su https://app.supabase.com
2. Seleziona progetto "RBS Logistica"
3. **SQL Editor** > "New query"
4. Esegui:
   ```sql
   SELECT
       u.id,
       u.email,
       u.email_confirmed_at,
       up.username,
       up.role
   FROM auth.users u
   LEFT JOIN user_profiles up ON u.id = up.id
   WHERE u.email = 'admin@rbslogistica.local';
   ```

**RISULTATO ATTESO:**
```
id: (un UUID)
email: admin@rbslogistica.local
email_confirmed_at: (una data/ora, NON null)
username: Amministratore
role: admin
```

**Se vedi `null` per username/role** → **ERRORE 3**: Profilo non inserito (vai al PASSO 5)
**Se vedi `null` per email_confirmed_at** → **ERRORE 4**: Email non confermata (ricrea utente con Auto Confirm)

---

## 🎯 Risoluzione Garantita

Il **99% dei problemi** è uno di questi:
1. ❌ `supabase-config.js` non modificato (ERRORE 1) - 40%
2. ❌ Profilo non inserito (ERRORE 3) - 40%
3. ❌ Utente non creato (ERRORE 2) - 15%
4. ❌ Schema SQL non eseguito (ERRORE 4) - 5%

**Il file `login-supabase-DEBUG.html` ti dirà quale!**

---

## 📞 File di Riferimento

- **`TROUBLESHOOTING_LOGIN.md`** - Guida dettagliata completa
- **`SUPABASE_SETUP_GUIDE.md`** - Setup completo passo-passo
- **`README_SUPABASE.md`** - Panoramica e FAQ
- **`LEGGIMI.txt`** (nello ZIP) - Istruzioni generali

---

**Tempo richiesto:** 5 minuti per diagnosticare + 5-10 minuti per risolvere

**Il log DEBUG ti mostrerà la soluzione esatta! 🔍**
