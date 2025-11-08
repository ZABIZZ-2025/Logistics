# 🎮 Guida Completa: RBS Logistica su Playcode

## Vantaggi di Usare Playcode

✅ **Nessun server locale da configurare** - Playcode è già un server HTTP
✅ **Accessibile da qualsiasi dispositivo** - PC, smartphone, tablet
✅ **Condivisibile** - Puoi condividere il link con altri utenti
✅ **Zero installazioni** - Non serve VS Code, Python, Node.js
✅ **Auto-save** - Salva automaticamente mentre lavori
✅ **Gratis** - Piano free sufficiente per questa app

---

## 📋 Cosa Ti Serve Prima di Iniziare

- [ ] Account Playcode (vai su https://playcode.io e registrati - gratis)
- [ ] Account Supabase (vai su https://app.supabase.com e registrati - gratis)
- [ ] Progetto Supabase "RBS Logistica" creato
- [ ] Schema SQL eseguito nel progetto Supabase (4 tabelle create)
- [ ] Credenziali Supabase (URL e anon key) pronte

---

## 🎯 METODO 1: Import Diretto dei File (15 minuti)

### PASSO 1: Crea Nuovo Progetto Playcode

1. **Vai su https://playcode.io**
2. **Fai login** (o crea account gratuito se non ce l'hai)
3. **Click "New Code"** in alto a sinistra
4. **Seleziona "Blank"** (progetto vuoto)
5. **Rinomina il progetto**: Click sul nome "Untitled" e scrivi `RBS Logistica Supabase`

---

### PASSO 2: Carica i File JavaScript

Playcode mostra 3 pannelli: HTML, CSS, JS

#### A) File JavaScript Principale (app-supabase.js)

1. **Apri il file `app-supabase.js`** dalla cartella locale (usa Notepad o VS Code)
2. **Copia TUTTO il contenuto** (Ctrl+A, Ctrl+C)
3. **Torna su Playcode**
4. **Nel pannello "JS"** (JavaScript, in basso a sinistra)
5. **Cancella tutto** il codice di esempio
6. **Incolla** il contenuto di `app-supabase.js` (Ctrl+V)

#### B) File Configurazione (supabase-config.js)

Playcode non supporta import di file multipli JS direttamente, quindi devi **incorporare la configurazione** in app-supabase.js:

1. **Apri `supabase-config.js`** dalla cartella locale
2. **Copia queste righe:**
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```
3. **Nel pannello JS di Playcode**, aggiungi queste righe **ALL'INIZIO** del file (prima di tutto il resto)

4. **MODIFICA con le tue credenziali Supabase:**
   - Vai su https://app.supabase.com
   - Seleziona progetto "RBS Logistica"
   - Click ingranaggio (Settings) > API
   - Copia "Project URL" (es: `https://xyzabcd.supabase.co`)
   - Copia "anon public key" (lunga stringa che inizia con `eyJhbGci...`)
   - Sostituisci in Playcode:
     ```javascript
     const SUPABASE_CONFIG = {
         url: 'https://xyzabcd.supabase.co',  // ← Il tuo URL qui
         anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← La tua key qui
     };
     ```

5. **Aggiungi queste righe subito dopo la configurazione:**
   ```javascript
   // Import Supabase da CDN
   import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

   // Crea client Supabase
   const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
   ```

---

### PASSO 3: Carica HTML

Playcode richiede di separare il login dalla pagina principale. Iniziamo con il **LOGIN**:

#### Versione 1: Solo Login Page

1. **Apri `login-supabase.html`** dalla cartella locale
2. **Copia il contenuto del tag `<body>`** (solo quello che sta dentro `<body>...</body>`)
3. **Nel pannello "HTML"** di Playcode
4. **Cancella tutto** il contenuto di esempio
5. **Incolla** il contenuto del body

6. **Copia anche il contenuto del tag `<head>`** (script, meta tag, ecc.)
7. **Nel pannello HTML**, aggiungi all'inizio:
   ```html
   <!DOCTYPE html>
   <html lang="it">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>RBS Logistica - Login</title>
   </head>
   <body>
       <!-- Il contenuto del body che hai incollato prima -->
   </body>
   </html>
   ```

---

### PASSO 4: Carica CSS

1. **Apri `styles.css`** dalla cartella locale
2. **Copia TUTTO il contenuto** (Ctrl+A, Ctrl+C)
3. **Nel pannello "CSS"** di Playcode
4. **Cancella tutto** il contenuto di esempio
5. **Incolla** il contenuto di `styles.css` (Ctrl+V)

---

### PASSO 5: Test Login

1. **Click "Run"** (o Ctrl+S) in Playcode
2. **Vedi la pagina di login** nel pannello preview a destra
3. **Prova il login:**
   - Email: `admin@rbslogistica.local`
   - Password: `admin123`

4. **Apri Console** (in Playcode: View > Console, o F12 nel browser)
5. **Guarda i messaggi** per verificare cosa succede

---

### PASSO 6: Crea Utente e Profilo in Supabase (se non l'hai già fatto)

Se il login non funziona, probabilmente devi creare l'utente:

#### A) Crea Utente

1. Vai su https://app.supabase.com
2. Seleziona progetto "RBS Logistica"
3. **Authentication > Users**
4. **Click "Add user" > "Create new user"**
5. Email: `admin@rbslogistica.local`
6. Password: `admin123` (o una password sicura che ricorderai)
7. ✅ **IMPORTANTE:** Spunta "Auto Confirm User"
8. Click "Create user"
9. **COPIA L'UUID** dell'utente (es: `550e8400-e29b-41d4-a716-446655440000`)

#### B) Inserisci Profilo

1. **SQL Editor** > "New query"
2. **Incolla questa query** (SOSTITUISCI L'UUID con quello copiato sopra!):
   ```sql
   INSERT INTO user_profiles (id, user_id, username, role)
   VALUES (
       '550e8400-e29b-41d4-a716-446655440000',  -- ← IL TUO UUID QUI!
       'admin',
       'Amministratore',
       'admin'
   );
   ```
3. **Click "Run"** (Ctrl+Enter)
4. Verifica: "Success. 1 row affected"

#### C) Riprova Login

1. Torna su Playcode
2. Prova di nuovo il login
3. Dovresti essere reindirizzato a `index-supabase.html`

---

### PASSO 7: Crea Pagina Principale (Kanban)

Dopo che il login funziona, devi creare un secondo progetto Playcode per la pagina principale:

1. **Click "New Code"** su Playcode
2. **Rinomina**: `RBS Logistica - Kanban`
3. **Copia il contenuto di `index-supabase.html`** nel pannello HTML
4. **Riusa lo stesso CSS** (copia da `styles.css`)
5. **Riusa lo stesso JS** (copia da `app-supabase.js` con configurazione)

**IMPORTANTE:** Devi modificare il redirect nel login:

Nel file JS del progetto LOGIN, trova questa riga:
```javascript
window.location.href = 'index-supabase.html';
```

Sostituisci con l'URL del progetto Kanban su Playcode:
```javascript
window.location.href = 'https://playcode.io/1234567';  // ← URL del tuo progetto Kanban
```

Per trovare l'URL:
- Vai sul progetto Kanban in Playcode
- Click "Share" in alto a destra
- Copia il link "View Only" o "Edit"

---

## 🎯 METODO 2: Upload File ZIP (più veloce - 10 minuti)

Playcode supporta l'upload di file ZIP per progetti più complessi.

### PASSO 1: Prepara i File

Hai già il file ZIP: `RBS_Logistica_Supabase.zip`

Ma devi fare alcune modifiche prima di uploadare:

1. **Estrai il ZIP** in una cartella temporanea
2. **Modifica `supabase-config.js`** con le tue credenziali Supabase
3. **Crea un file `index.html`** (rinomina `login-supabase.html` a `index.html`)
4. **Modifica gli import** nei file HTML per usare path relativi

### PASSO 2: Struttura File per Playcode

Playcode funziona meglio con questa struttura:

```
/
├── index.html (il tuo login-supabase.html rinominato)
├── kanban.html (il tuo index-supabase.html rinominato)
├── app.js (il tuo app-supabase.js)
├── config.js (il tuo supabase-config.js)
├── styles.css
└── logo.svg
```

### PASSO 3: Upload su Playcode

**NOTA:** Playcode free tier ha limitazioni sull'upload di file multipli. Ti consiglio di usare **METODO 3** (GitHub + Playcode) se hai molti file.

---

## 🎯 METODO 3: GitHub + Playcode Import (CONSIGLIATO - 10 minuti)

Questo è il metodo MIGLIORE perché:
- ✅ Importa tutti i file automaticamente
- ✅ Mantiene la struttura del progetto
- ✅ Supporta aggiornamenti futuri
- ✅ Versioning automatico

### PASSO 1: I File Sono Già su GitHub

I tuoi file sono già nel repository Git:
```
N:\Logistics\
```

Verifica che siano pushati su GitHub/il tuo remote repository.

### PASSO 2: Crea Repository Pubblico GitHub (se non lo è già)

1. Vai sul tuo repository GitHub
2. Settings > Danger Zone > "Change visibility" > "Make public"
   (oppure crea un nuovo repo pubblico e pusha i file lì)

### PASSO 3: Usa GitHub Pages (ALTERNATIVA a Playcode)

Invece di Playcode, puoi usare **GitHub Pages** che è gratis e perfetto per questa app:

1. **Sul tuo repository GitHub**
2. **Settings > Pages**
3. **Source:** Seleziona "Deploy from a branch"
4. **Branch:** Seleziona `main` (o il branch dove hai i file)
5. **Folder:** Seleziona `/ (root)`
6. **Click "Save"**

Dopo 1-2 minuti, il sito sarà live su:
```
https://USERNAME.github.io/REPOSITORY_NAME/login-supabase.html
```

**VANTAGGI GitHub Pages:**
- ✅ Completamente gratis
- ✅ Supporta file multipli
- ✅ URL permanente
- ✅ HTTPS automatico
- ✅ Aggiornamenti automatici quando pushi su GitHub

---

## 🎯 METODO 4: Netlify Drop (SEMPLICISSIMO - 5 minuti)

Questo è il metodo PIÙ VELOCE:

### PASSO 1: Vai su Netlify Drop

1. **Vai su https://app.netlify.com/drop**
2. **NON serve registrazione** per testare!

### PASSO 2: Prepara la Cartella

1. **Estrai il ZIP** `RBS_Logistica_Supabase.zip`
2. **Modifica `supabase-config.js`** con le tue credenziali
3. **Rinomina `login-supabase.html` a `index.html`**
   (Netlify cerca index.html come pagina iniziale)

### PASSO 3: Drag & Drop

1. **Trascina l'intera cartella** sulla pagina di Netlify Drop
2. **Attendi 30 secondi** mentre carica
3. **FATTO!** Netlify ti dà un URL tipo: `https://random-name-123456.netlify.app`

### PASSO 4: Testa

1. **Apri l'URL** fornito da Netlify
2. **Prova il login**
3. **Funziona!** (ricorda di aver creato utente e profilo in Supabase)

**VANTAGGI Netlify:**
- ✅ Più veloce di tutti (5 minuti totali)
- ✅ URL permanente
- ✅ HTTPS automatico
- ✅ Gratis per sempre
- ✅ Supporta tutti i file senza limiti
- ✅ Puoi aggiornare trascinando di nuovo la cartella

---

## 🏆 RACCOMANDAZIONE FINALE

**Per testare rapidamente (oggi):**
👉 Usa **NETLIFY DROP** (Metodo 4) - 5 minuti, zero configurazione

**Per uso a lungo termine:**
👉 Usa **GITHUB PAGES** (Metodo 3) - gratis per sempre, aggiornamenti automatici

**Per sviluppare/modificare online:**
👉 Usa **PLAYCODE** (Metodo 1) - puoi editare il codice direttamente online

---

## 📋 Checklist Prima del Deploy

Prima di fare deploy su qualsiasi piattaforma, verifica:

### ✅ Configurazione Supabase
- [ ] Account Supabase creato
- [ ] Progetto "RBS Logistica" creato
- [ ] Schema SQL eseguito (4 tabelle create: user_profiles, anagrafica, viaggi, history)
- [ ] Credenziali copiate (URL e anon key)
- [ ] File `supabase-config.js` modificato con credenziali reali

### ✅ Utente Admin
- [ ] Utente creato in Authentication (admin@rbslogistica.local)
- [ ] "Auto Confirm User" abilitato (status: Confirmed)
- [ ] UUID utente copiato
- [ ] Profilo inserito in user_profiles (query INSERT eseguita)

### ✅ Test Query
Esegui questa query in Supabase SQL Editor per verificare:
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

Deve mostrare:
- ✓ id: (un UUID)
- ✓ email: admin@rbslogistica.local
- ✓ email_confirmed_at: (una data, NON null)
- ✓ username: Amministratore
- ✓ role: admin

### ✅ File Preparati
- [ ] File ZIP estratto
- [ ] supabase-config.js modificato con credenziali
- [ ] (Opzionale) login-supabase.html rinominato a index.html

---

## 🚀 INIZIA SUBITO: Procedura Rapida Netlify

**Tempo richiesto: 10 minuti totali**

### 1. Configura Supabase (5 minuti)

```bash
# 1. Crea progetto su https://app.supabase.com
# 2. Vai su SQL Editor > New query
# 3. Copia/incolla contenuto di supabase-schema.sql
# 4. Click "Run"
# 5. Verifica in Table Editor: dovresti vedere 4 tabelle
```

### 2. Crea Utente (2 minuti)

```bash
# 1. Authentication > Users > "Add user"
# 2. Email: admin@rbslogistica.local
# 3. Password: admin123
# 4. ✅ Auto Confirm User
# 5. Click "Create user"
# 6. Copia UUID
```

### 3. Inserisci Profilo (1 minuto)

```sql
-- SQL Editor > New query
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_COPIATO_SOPRA',  -- ← Sostituisci con UUID utente!
    'admin',
    'Amministratore',
    'admin'
);
-- Click "Run"
```

### 4. Modifica Configurazione (1 minuto)

```bash
# 1. Estrai RBS_Logistica_Supabase.zip
# 2. Apri supabase-config.js con Notepad
# 3. Sostituisci YOUR_SUPABASE_URL con il tuo URL (da Settings > API)
# 4. Sostituisci YOUR_SUPABASE_ANON_KEY con la tua key (da Settings > API)
# 5. Salva
# 6. Rinomina login-supabase.html a index.html
```

### 5. Deploy su Netlify (1 minuto)

```bash
# 1. Vai su https://app.netlify.com/drop
# 2. Trascina l'intera cartella estratta
# 3. Attendi 30 secondi
# 4. Copia l'URL fornito (tipo: https://xyz.netlify.app)
# 5. Apri l'URL nel browser
# 6. Fai login!
```

---

## 🎉 Dopo il Deploy

Una volta che l'app è online:

### Test Login
1. Apri l'URL (Netlify/Playcode/GitHub Pages)
2. Login con: admin@rbslogistica.local / admin123
3. Dovresti vedere la pagina Kanban

### Test Sincronizzazione Real-time
1. Apri l'app in 2 finestre/tab diverse (o 2 dispositivi)
2. Fai login in entrambe
3. Crea un viaggio in una finestra
4. **Lo vedrai apparire ISTANTANEAMENTE nell'altra!** 🚀

### Accesso da Smartphone
1. Apri browser sullo smartphone
2. Vai all'URL dell'app
3. Fai login
4. Funziona perfettamente! È responsive

### Condividi con Altri Utenti
1. Crea altri utenti in Supabase Authentication
2. Inserisci i loro profili in user_profiles
3. Condividi l'URL dell'app
4. Ogni utente può fare login con le sue credenziali

---

## 📞 Riferimenti

- **Playcode:** https://playcode.io
- **Netlify Drop:** https://app.netlify.com/drop
- **GitHub Pages:** https://pages.github.com
- **Supabase:** https://app.supabase.com

---

## 🆘 Troubleshooting

### Errore: "Invalid login credentials"
→ Verifica di aver creato l'utente in Supabase Authentication

### Errore: "Profile not found"
→ Verifica di aver inserito il profilo in user_profiles (query INSERT)

### Errore: "relation user_profiles does not exist"
→ Verifica di aver eseguito lo schema SQL (supabase-schema.sql)

### Errore: 404 o pagina non trovata
→ Verifica che il file iniziale si chiami `index.html`

### Login loop (torna sempre al login)
→ Controlla Console browser (F12) per vedere gli errori
→ Verifica che supabase-config.js sia corretto (non 'YOUR_SUPABASE_...')

---

**Buon deploy! La tua app RBS Logistica sarà online in pochi minuti! 🚀**
