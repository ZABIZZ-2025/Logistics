# 🚀 Guida Setup Supabase per RBS Logistica

## Panoramica

Questa guida ti aiuterà a configurare Supabase come database cloud per la tua applicazione RBS Logistica, sostituendo localStorage con un database PostgreSQL condiviso accessibile da tutti i dispositivi.

## Tempo Stimato

- ⏱️ **Setup Supabase**: 30 minuti
- ⏱️ **Configurazione Applicazione**: 5 minuti
- ⏱️ **Test**: 10 minuti
- **TOTALE**: ~45 minuti

---

## PARTE 1: Creazione Account Supabase (10 minuti)

### Step 1.1: Registrazione

1. Vai su **https://supabase.com**
2. Clicca su **"Start your project"**
3. Registrati con:
   - Email (consigliato: email aziendale)
   - GitHub account
   - Google account

### Step 1.2: Creazione Progetto

1. Dopo il login, clicca **"New Project"**
2. Compila i campi:
   - **Name**: `RBS Logistica`
   - **Database Password**: Scegli una password SICURA (salvala!)
   - **Region**: `Europe West (Frankfurt)` o `Europe Central (Warsaw)` (più vicino all'Italia)
   - **Pricing Plan**: Seleziona **"Free"** (sufficiente per iniziare)

3. Clicca **"Create new project"**
4. ⏳ Attendi 2-3 minuti mentre Supabase crea il database

---

## PARTE 2: Creazione Database Schema (15 minuti)

### Step 2.1: Apri SQL Editor

1. Nel menu laterale sinistro, clicca su **🗄️ SQL Editor**
2. Clicca su **"+ New query"**

### Step 2.2: Esegui Schema SQL

1. Apri il file `supabase-schema.sql` (presente nella tua cartella Logistics)
2. **Copia TUTTO il contenuto** del file
3. **Incolla** nell'SQL Editor di Supabase
4. Clicca sul pulsante **"Run"** (o premi `Ctrl+Enter`)
5. ✅ Dovresti vedere il messaggio: **"Success. No rows returned"**

### Step 2.3: Verifica Tabelle Create

1. Nel menu laterale, clicca su **📊 Table Editor**
2. Dovresti vedere 4 tabelle:
   - ✅ `user_profiles`
   - ✅ `anagrafica`
   - ✅ `viaggi`
   - ✅ `history`

---

## PARTE 3: Creazione Utenti per Autenticazione (10 minuti)

### Step 3.1: Crea Utente Admin

1. Nel menu laterale, clicca su **🔐 Authentication**
2. Vai su tab **"Users"**
3. Clicca **"Add user"** > **"Create new user"**
4. Compila:
   - **Email**: `admin@rbslogistica.local` (o la tua email reale)
   - **Password**: `admin123` (o una password sicura)
   - **Auto Confirm User**: ✅ ABILITA (importante!)
5. Clicca **"Create user"**
6. **COPIA l'UUID** dell'utente (es. `550e8400-e29b-41d4-a716-446655440000`)

### Step 3.2: Aggiungi Profilo Admin

1. Torna al **SQL Editor**
2. Crea una nuova query con questo codice (sostituisci `UUID_COPIATO` con l'UUID dell'utente):

```sql
-- Inserisci profilo admin
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
  'UUID_COPIATO',  -- Sostituisci con l'UUID dell'utente admin
  'admin',
  'Amministratore',
  'admin'
);
```

3. **Run** la query
4. ✅ Dovresti vedere: **"Success. 1 row affected"**

### Step 3.3: Crea Utente Standard (opzionale)

Ripeti gli step 3.1 e 3.2 con questi dati:
- **Email**: `user@rbslogistica.local`
- **Password**: `user123`
- **Role**: `'user'` (invece di `'admin'`)
- **Username**: `'user'`
- **Nome**: `'Utente Standard'`

---

## PARTE 4: Ottieni Credenziali API (5 minuti)

### Step 4.1: Trova URL e API Key

1. Nel menu laterale, clicca su **⚙️ Project Settings** (icona ingranaggio in basso)
2. Vai su **"API"**
3. Troverai:
   - **Project URL** (es. `https://xyzabcd.supabase.co`)
   - **anon public key** (lunga stringa che inizia con `eyJhbGci...`)

### Step 4.2: Salva le Credenziali

📋 **COPIA e SALVA** in un posto sicuro:
- ✅ Project URL
- ✅ Anon public key
- ✅ Database password (scelta prima)

---

## PARTE 5: Configura l'Applicazione (5 minuti)

### Step 5.1: Modifica supabase-config.js

1. Apri il file `supabase-config.js` nella tua cartella Logistics
2. Sostituisci:
   ```javascript
   url: 'YOUR_SUPABASE_URL',  // ← Incolla qui il Project URL
   anonKey: 'YOUR_SUPABASE_ANON_KEY'  // ← Incolla qui la anon key
   ```

3. Salva il file

### Step 5.2: Usa i Nuovi File

Invece di usare `index.html` e `app.js`, ora userai:
- ✅ `index-supabase.html` (nuovo file HTML)
- ✅ `app-supabase.js` (nuovo file JavaScript con integrazione Supabase)
- ✅ `login-supabase.html` (nuovo login con Supabase Auth)

---

## PARTE 6: Test dell'Applicazione (10 minuti)

### Step 6.1: Apri l'App

1. Apri `login-supabase.html` nel browser
2. Effettua login con:
   - **Email**: `admin@rbslogistica.local`
   - **Password**: `admin123`

### Step 6.2: Test Funzionalità

Verifica che funzionino:
- ✅ Login
- ✅ Creazione nuovo viaggio
- ✅ Drag & drop post-it
- ✅ Modifica viaggio
- ✅ Eliminazione viaggio
- ✅ Gestione anagrafica clienti
- ✅ Creazione nuovo utente
- ✅ Logout

### Step 6.3: Test Multi-Utente (IMPORTANTE!)

1. Apri una **finestra in incognito**
2. Apri `login-supabase.html`
3. Login con utente standard (se creato)
4. Crea una nuova richiesta viaggio
5. **Torna alla prima finestra** (admin)
6. ✅ **DOVRESTI VEDERE** la nuova richiesta apparire automaticamente (real-time!)

---

## PARTE 7: Pubblicazione su Playcode (10 minuti)

### Step 7.1: Crea Progetto Playcode

1. Vai su **https://playcode.io**
2. Clicca **"New Project"**
3. Seleziona **"Blank"**

### Step 7.2: Carica i Files

Carica questi file nell'ordine:
1. `supabase-config.js`
2. `app-supabase.js`
3. `styles.css`
4. `index-supabase.html` (rinomina in `index.html`)
5. `login-supabase.html` (rinomina in `login.html`)
6. `logo.svg` (se presente)

### Step 7.3: Configura HTML

Playcode imposta automaticamente `index.html` come file principale.

### Step 7.4: Testa e Pubblica

1. Clicca **"Run"** per testare
2. Se funziona, clicca **"Share"**
3. Copia l'URL pubblico (es. `https://playcode.io/abc123`)
4. 🎉 **Condividi l'URL** con il tuo team!

---

## 📊 Statistiche e Query

### Query Utili

Una volta che l'app è in funzione, puoi eseguire query SQL per statistiche:

#### Statistiche Viaggi per Mese
```sql
SELECT
    DATE_TRUNC('month', created_at) as mese,
    COUNT(*) as totale_viaggi,
    COUNT(CASE WHEN urgente = true THEN 1 END) as viaggi_urgenti,
    COUNT(CASE WHEN "column" = 'completato' THEN 1 END) as viaggi_completati
FROM viaggi
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mese DESC;
```

#### Viaggi per Circuito
```sql
SELECT
    circuito,
    COUNT(*) as totale,
    SUM(peso) as peso_totale,
    SUM(volume) as pacchi_totali
FROM viaggi
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY circuito
ORDER BY totale DESC;
```

#### Clienti più Attivi
```sql
SELECT
    azienda,
    COUNT(*) as numero_viaggi,
    MAX(created_at) as ultimo_viaggio
FROM viaggi
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY azienda
ORDER BY numero_viaggi DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### Problema: "Invalid API key"
- ✅ Verifica che hai copiato la **anon public key** (NON la service_role key)
- ✅ Verifica che non ci siano spazi extra

### Problema: "Failed to fetch"
- ✅ Verifica che il Project URL sia corretto
- ✅ Verifica di avere connessione internet
- ✅ Controlla la console del browser (F12) per errori

### Problema: "Row Level Security policy violation"
- ✅ Verifica di aver eseguito TUTTO lo schema SQL
- ✅ Verifica che le policies RLS siano attive

### Problema: "User already registered"
- ✅ Normale! L'email è già in uso
- ✅ Usa un'email diversa o elimina l'utente esistente

### Problema: Login non funziona
- ✅ Verifica che hai abilitato "Auto Confirm User"
- ✅ Verifica che esista il profilo in `user_profiles`
- ✅ Verifica email e password corrette

---

## 💰 Limiti Piano Gratuito

Il piano gratuito Supabase include:
- ✅ 500 MB storage database
- ✅ 2 GB bandwidth/mese
- ✅ 50,000 monthly active users
- ✅ Pausa dopo 1 settimana di inattività (si riattiva automaticamente)

**Per RBS Logistica** (2-10 utenti):
- 📊 Stima database: < 50 MB/anno
- 📊 Stima bandwidth: < 500 MB/mese
- ✅ **Piano gratuito SUFFICIENTE per anni**

---

## 📞 Supporto

Se hai problemi:
1. Consulta la documentazione Supabase: https://supabase.com/docs
2. Controlla il codice nei file `app-supabase.js` (commenti dettagliati)
3. Usa la console browser (F12 > Console) per debug

---

## ✅ Checklist Finale

Prima di andare in produzione, verifica:

- [ ] Tutte le tabelle create in Supabase
- [ ] Utenti admin e user creati
- [ ] Profili utenti inseriti in `user_profiles`
- [ ] Credenziali API configurate in `supabase-config.js`
- [ ] Login funziona con entrambi gli utenti
- [ ] Real-time sync funziona (test con 2 finestre)
- [ ] Tutti i CRUD funzionano (create, read, update, delete)
- [ ] Anagrafica clienti funziona
- [ ] Google Maps export funziona
- [ ] Drag & drop funziona
- [ ] App pubblicata su Playcode (opzionale)
- [ ] URL condiviso con il team

---

## 🎉 Congratulazioni!

Hai completato con successo la migrazione da localStorage a Supabase!

La tua applicazione ora:
- ✅ Funziona su tutti i dispositivi
- ✅ Si sincronizza in real-time
- ✅ È accessibile da ovunque
- ✅ Ha backup automatico
- ✅ È sicura con RLS
- ✅ Può fare statistiche avanzate
