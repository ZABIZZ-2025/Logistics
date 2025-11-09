# 🚀 GUIDA DEPLOY RAPIDO - 10 MINUTI

## 📋 Checklist Pre-Deploy

- [ ] Account Supabase creato
- [ ] Progetto Supabase "RBS Logistica" creato
- [ ] Schema SQL eseguito (4 tabelle create)
- [ ] Utente admin creato e confermato
- [ ] Profilo admin inserito in `user_profiles`
- [ ] File `supabase-config.js` modificato con credenziali reali

---

## 🎯 STEP 1: Configura Supabase (5 minuti)

### 1.1 Crea Progetto

1. Vai su https://app.supabase.com
2. Click "New project"
3. Nome: `RBS Logistica`
4. Database Password: (scegli e salva)
5. Region: `Europe (Frankfurt)`
6. Click "Create new project"
7. Attendi 2-3 minuti

### 1.2 Esegui Schema SQL

1. Menu laterale: **SQL Editor**
2. Click "New query"
3. Apri file `supabase-schema.sql`
4. Copia TUTTO il contenuto
5. Incolla nell'editor
6. Click **"Run"** (Ctrl+Enter)
7. Verifica: "Success. No rows returned"

### 1.3 Verifica Tabelle

1. Menu laterale: **Table Editor**
2. Dovresti vedere 4 tabelle:
   - ✅ `user_profiles`
   - ✅ `anagrafica`
   - ✅ `viaggi`
   - ✅ `history`

### 1.4 Copia Credenziali

1. Menu laterale: **Settings** > **API**
2. Copia e salva:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (stringa lunga)

### 1.5 Crea Utente Admin

1. Menu laterale: **Authentication** > **Users**
2. Click **"Add user"** > "Create new user"
3. Email: `admin@rbslogistica.local`
4. Password: (scegli una password sicura)
5. ✅ **IMPORTANTE**: Spunta **"Auto Confirm User"**
6. Click "Create user"
7. **COPIA L'UUID** dell'utente (es: `550e8400-e29b-41d4-a716-446655440000`)

### 1.6 Inserisci Profilo Admin

1. Menu laterale: **SQL Editor**
2. Click "New query"
3. Incolla questa query (SOSTITUISCI L'UUID!):

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_COPIATO_SOPRA',  -- ← Sostituisci con UUID!
    'admin',
    'Amministratore',
    'admin'
);
```

4. Click **"Run"**
5. Verifica: "Success. 1 row affected"

### 1.7 Verifica Setup Completo

Esegui questa query:

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

**Risultato atteso:**
- ✅ `email`: admin@rbslogistica.local
- ✅ `email_confirmed_at`: (una data, NON null)
- ✅ `username`: Amministratore
- ✅ `role`: admin

---

## 🎯 STEP 2: Configura App (2 minuti)

### 2.1 Modifica Configurazione

1. Apri file `supabase-config.js`
2. Sostituisci `YOUR_SUPABASE_URL` con Project URL
3. Sostituisci `YOUR_SUPABASE_ANON_KEY` con anon key

**Prima:**
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

**Dopo:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

4. **SALVA** il file

---

## 🎯 STEP 3: Deploy su Netlify (3 minuti)

### Opzione A: Netlify Drop (Più veloce)

1. Vai su https://app.netlify.com/drop
2. **Trascina** l'intera cartella del progetto
3. Attendi 30 secondi
4. **COPIA L'URL** fornito (es: `https://random-name.netlify.app`)
5. **FATTO!** App online

### Opzione B: Git Deploy (Consigliato)

1. Vai su https://app.netlify.com
2. Click **"Add new site"** > "Import from Git"
3. Connetti GitHub/GitLab/Bitbucket
4. Seleziona repository `Logistics`
5. **Build settings:**
   - Build command: (lascia vuoto)
   - Publish directory: `.` (cartella root)
6. Click **"Deploy site"**
7. Attendi 1-2 minuti
8. **COPIA L'URL** del sito

### (Opzionale) Personalizza URL

1. Vai su **Site settings**
2. Click **"Change site name"**
3. Nuovo nome: `rbs-logistica` (o quello che vuoi)
4. Salva
5. Nuovo URL: `https://rbs-logistica.netlify.app`

---

## 🎯 STEP 4: Testa App (1 minuto)

### 4.1 Primo Login

1. Apri URL Netlify nel browser
2. Email: `admin@rbslogistica.local`
3. Password: (quella scelta in Supabase)
4. Click **"Accedi"**
5. Dovresti vedere la dashboard Kanban

### 4.2 Test Sincronizzazione

1. Apri app in **2 finestre** del browser
2. Fai login in entrambe
3. Crea un viaggio in una finestra
4. **Magia!** Appare ISTANTANEAMENTE nell'altra finestra 🚀

### 4.3 Test Mobile

1. Prendi smartphone
2. Vai all'URL Netlify
3. Fai login
4. Funziona perfettamente! 📱

---

## ✅ DEPLOY COMPLETATO!

La tua app è ora:
- 🌐 **Online** e accessibile da qualsiasi dispositivo
- 🔄 **Sincronizzata** in tempo reale
- 🔒 **Sicura** con HTTPS e autenticazione
- 💰 **Gratis** per sempre (Supabase + Netlify free tier)
- ⚡ **Veloce** con CDN globale Netlify

---

## 🆘 Troubleshooting Rapido

### ❌ Login loop
**Soluzione**: Ripeti STEP 1.6 (inserisci profilo con UUID corretto)

### ❌ "Invalid credentials"
**Soluzione**: Verifica email/password in Supabase Authentication

### ❌ Pagina bianca
**Soluzione**: Verifica che `index.html` esista nella root del progetto

### ❌ Errori CORS
**Soluzione**: Verifica `supabase-config.js` (deve avere URL e key reali)

### 📖 Troubleshooting Completo
Vedi `docs/TROUBLESHOOTING_LOGIN.md`

---

## 🔄 Aggiornamenti Futuri

### Deploy Manuale (Netlify Drop)
1. Modifica file localmente
2. Vai su https://app.netlify.com
3. Login e seleziona sito
4. Vai su **Deploys**
5. Trascina cartella aggiornata
6. Attendi 30 secondi
7. Sito aggiornato!

### Deploy Automatico (Git)
1. Modifica file localmente
2. Commit e push su Git:
```bash
git add .
git commit -m "Descrizione modifiche"
git push
```
3. Netlify fa deploy **automaticamente**
4. Attendi 1-2 minuti
5. Sito aggiornato!

---

## 👥 Aggiungere Altri Utenti

1. Supabase: **Authentication > Users**
2. Click "Add user"
3. Email: `utente@rbslogistica.local`
4. Password: (scegli)
5. ✅ Auto Confirm User
6. Copia UUID
7. **SQL Editor**:

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_UTENTE',
    'mario.rossi',
    'Mario Rossi',
    'user'  -- 'user' o 'admin'
);
```

8. Il nuovo utente può fare login!

---

## 📊 Monitoraggio

### Supabase Dashboard
- **Table Editor**: Vedi tutti i dati
- **Authentication**: Gestisci utenti
- **SQL Editor**: Query personalizzate
- **Database** > Logs: Vedi attività

### Netlify Dashboard
- **Analytics**: Visite, banda, performance
- **Deploys**: Storico deploy
- **Functions**: (se aggiungi serverless functions)

---

## 🎉 CONGRATULAZIONI!

Tempo totale: **10 minuti**
Costo mensile: **€0.00**
Disponibilità: **99.9%**

La tua applicazione professionale è ora online e pronta all'uso! 🚀

---

**Per supporto completo, vedi:**
- `README.md` - Panoramica generale
- `docs/DEPLOY_RAPIDO_NETLIFY.txt` - Guida dettagliata
- `docs/SUPABASE_SETUP_GUIDE.md` - Setup Supabase completo
- `docs/TROUBLESHOOTING_LOGIN.md` - Risoluzione problemi
