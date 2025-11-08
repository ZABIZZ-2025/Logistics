# 🎮 Setup Completo per Playcode - RBS Logistica Supabase

## ⚠️ PROBLEMA RISOLTO

**Errore:** `Imported module 'https:' from '' is not installed`

**Causa:** Playcode non supporta bene gli import ES6 da URL esterni (`import { x } from 'https://...'`)

**Soluzione:** Ho creato **versioni speciali per Playcode** che usano tag `<script>` invece di `import`.

---

## 📁 FILE SPECIFICI PER PLAYCODE

Usa questi file invece dei file originali:

1. **`login-playcode.html`** ← Usa QUESTO per il login
2. **I file CSS e altri rimangono gli stessi**

---

## 🚀 SETUP RAPIDO SU PLAYCODE (15 minuti)

### PASSO 1: Crea Progetto Playcode

1. **Vai su** https://playcode.io
2. **Fai login** (o crea account gratuito)
3. **Click "New Code"**
4. **Seleziona "Blank"**
5. **Rinomina**: `RBS Logistica - Login`

---

### PASSO 2: Copia il Codice Login

1. **Apri** il file `login-playcode.html` dal repository Git
2. **Copia TUTTO** il contenuto (Ctrl+A, Ctrl+C)
3. **Torna su Playcode**
4. **Nel pannello HTML** (a sinistra):
   - Cancella tutto il contenuto di esempio
   - Incolla il codice copiato (Ctrl+V)

---

### PASSO 3: Configura Supabase nel Codice

Playcode mostra il codice nel pannello HTML. Devi modificare la configurazione **direttamente nel codice HTML**:

1. **Scorri** fino a trovare questa sezione (circa riga 220):

```javascript
const SUPABASE_CONFIG = {
    // SOSTITUISCI con il tuo Project URL
    url: 'YOUR_SUPABASE_URL',

    // SOSTITUISCI con la tua anon key
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

2. **Prendi le credenziali Supabase:**
   - Vai su https://app.supabase.com
   - Seleziona progetto "RBS Logistica"
   - Click Settings > API
   - **Copia "Project URL"** (es: `https://xyzabcd.supabase.co`)
   - **Copia "anon public key"** (lunga stringa che inizia con `eyJhbGci...`)

3. **Sostituisci nel codice Playcode:**

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xyzabcd.supabase.co',  // ← Il tuo URL qui
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← La tua key qui
};
```

4. **Salva** (Ctrl+S o il codice si salva automaticamente)

---

### PASSO 4: Test Login

1. **Click "Run"** in Playcode (o Ctrl+S)
2. **Vedi l'anteprima** nel pannello a destra
3. **Se vedi ancora** il banner giallo "⚠️ CONFIGURAZIONE RICHIESTA":
   - Verifica di aver sostituito correttamente `YOUR_SUPABASE_URL`
   - Ricarica la pagina (Ctrl+R)

4. **Se il banner giallo è sparito**, sei pronto!

5. **Prova il login:**
   - Email: `admin@rbslogistica.local`
   - Password: `admin123`

6. **Apri Console** (F12 > tab Console) per vedere i log:
   ```
   🚀 Supabase client inizializzato
   📍 URL: https://xyzabcd.supabase.co
   🔐 Tentativo login per: admin@rbslogistica.local
   ✅ Login riuscito per: admin@rbslogistica.local
   ✅ Profilo caricato: Amministratore
   ```

---

## 🎯 COSA FARE SE IL LOGIN NON FUNZIONA

### Errore 1: Banner giallo "CONFIGURAZIONE RICHIESTA"

**Causa:** Non hai sostituito `YOUR_SUPABASE_URL` nel codice

**Soluzione:**
1. Scorri il codice HTML in Playcode
2. Cerca `YOUR_SUPABASE_URL`
3. Sostituisci con il tuo URL reale
4. Salva (Ctrl+S)

---

### Errore 2: "❌ Email o password non corretti"

**Causa:** Utente non creato in Supabase o password sbagliata

**Soluzione:**
1. Vai su https://app.supabase.com
2. Seleziona progetto "RBS Logistica"
3. Authentication > Users
4. Verifica che esista l'utente `admin@rbslogistica.local`

**Se non esiste:**
1. Click "Add user" > "Create new user"
2. Email: `admin@rbslogistica.local`
3. Password: `admin123`
4. ✅ **IMPORTANTE:** Spunta "Auto Confirm User"
5. Click "Create user"
6. **Copia l'UUID** dell'utente
7. Inserisci il profilo (vedi PASSO 5 sotto)

---

### Errore 3: "⚠️ Profilo utente non trovato"

**Causa:** Utente creato ma profilo non inserito in `user_profiles`

**Soluzione:**
1. Vai su https://app.supabase.com
2. SQL Editor > New query
3. Esegui (SOSTITUISCI L'UUID!):

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_UTENTE_DA_AUTHENTICATION',  -- ← UUID copiato da Authentication > Users
    'admin',
    'Amministratore',
    'admin'
);
```

4. Click "Run"
5. Riprova il login

---

### Errore 4: "🌐 Errore di connessione"

**Causa:** URL o key Supabase sbagliati

**Soluzione:**
1. Verifica che l'URL inizi con `https://` e finisca con `.supabase.co`
2. Verifica che la key sia quella "anon public" (NON service_role!)
3. Ricontrolla di aver copiato correttamente (senza spazi extra)

---

## 📊 VANTAGGI E LIMITAZIONI PLAYCODE

### ✅ Vantaggi:
- Editor online, zero installazioni
- Anteprima live in tempo reale
- Modifiche immediate visibili
- Gratis

### ❌ Limitazioni:
- Non supporta file multipli con import/export (per questo uso un file singolo)
- Service worker può causare errori `preview-sw.js` (ignorabili)
- Può essere più lento di Netlify

---

## 🏆 ALTERNATIVA CONSIGLIATA: NETLIFY

Se Playcode ti dà problemi, **usa Netlify** che è più stabile:

### Perché Netlify è migliore:
- ✅ Supporta file multipli senza problemi
- ✅ Nessun errore di service worker
- ✅ Più veloce
- ✅ URL permanente professionale
- ✅ Gratis per sempre

### Come fare:
1. Vai su https://app.netlify.com/drop
2. Trascina la cartella con tutti i file
3. Attendi 30 secondi
4. Funziona perfettamente!

Vedi la guida: `DEPLOY_RAPIDO_NETLIFY.txt`

---

## 🔍 DEBUG SU PLAYCODE

### Come vedere i log:

1. **Apri Console** (F12 nel browser, tab Console)
2. **Cerca messaggi** con emoji:
   - 🚀 = Inizializzazione
   - 🔐 = Login in corso
   - ✅ = Operazione riuscita
   - ❌ = Errore
   - ⚠️ = Warning

### Messaggi tipici:

**✅ Tutto OK:**
```
🚀 Supabase client inizializzato
📍 URL: https://xyzabcd.supabase.co
🔐 Tentativo login per: admin@rbslogistica.local
✅ Login riuscito per: admin@rbslogistica.local
✅ Profilo caricato: Amministratore
```

**❌ Configurazione mancante:**
```
⚠️ CONFIGURAZIONE RICHIESTA: Modifica SUPABASE_CONFIG nel codice
```

**❌ Profilo non trovato:**
```
🔐 Tentativo login per: admin@rbslogistica.local
✅ Login riuscito for: admin@rbslogistica.local
❌ Errore profilo: {...}
```

---

## 📝 CHECKLIST COMPLETA

Prima di testare il login, verifica:

### Supabase:
- [ ] Account creato su https://app.supabase.com
- [ ] Progetto "RBS Logistica" creato
- [ ] Schema SQL eseguito (4 tabelle create)
- [ ] Utente admin creato (`admin@rbslogistica.local`)
- [ ] "Auto Confirm User" abilitato
- [ ] Profilo inserito in `user_profiles`

### Playcode:
- [ ] Progetto creato
- [ ] Codice `login-playcode.html` incollato
- [ ] `YOUR_SUPABASE_URL` sostituito con URL reale
- [ ] `YOUR_SUPABASE_ANON_KEY` sostituito con key reale
- [ ] Codice salvato (Ctrl+S)
- [ ] Banner giallo "CONFIGURAZIONE RICHIESTA" non visibile

---

## 🎨 PANNELLI PLAYCODE

Playcode ha 3 pannelli:

1. **HTML** (sinitra) ← Incolla QUI tutto il codice di `login-playcode.html`
2. **CSS** (centro) ← NON usare, tutto il CSS è già nell'HTML
3. **JS** (destra) ← NON usare, tutto il JS è già nell'HTML

**IMPORTANTE:** Usa SOLO il pannello HTML. CSS e JS sono già incorporati nel file HTML.

---

## ⚡ SOLUZIONE VELOCE AI PROBLEMI COMUNI

### Problema: Errore `Imported module 'https:'`
**Soluzione:** Stai usando i file sbagliati. Usa `login-playcode.html` NON `login-supabase.html`

### Problema: Banner giallo sempre visibile
**Soluzione:** Sostituisci `YOUR_SUPABASE_URL` nel codice, riga ~220

### Problema: Login loop
**Soluzione:** Profilo non inserito. Esegui query INSERT in Supabase SQL Editor

### Problema: Errori `preview-sw.js`
**Soluzione:** Ignora, sono di Playcode, non impediscono il funzionamento

---

## 📞 FILE DI RIFERIMENTO

- **`login-playcode.html`** ← USA QUESTO su Playcode
- **`DEPLOY_RAPIDO_NETLIFY.txt`** ← Alternativa più stabile
- **`PROBLEMI_RISOLTI.md`** ← Troubleshooting generale
- **`SUPABASE_SETUP_GUIDE.md`** ← Setup Supabase completo

---

## 🆘 SUPPORTO

Se dopo aver seguito tutti i passi hai ancora problemi:

1. **Apri Console** (F12)
2. **Fai screenshot** dei messaggi di errore
3. **Fai screenshot** della configurazione Supabase
4. **Verifica** la checklist sopra

La console ti dirà ESATTAMENTE qual è il problema.

---

## ✅ RISULTATO FINALE

Dopo aver completato il setup:

1. **Login funziona** senza errori
2. **Console mostra** `✅ Login riuscito` e `✅ Profilo caricato`
3. **Banner giallo** non è visibile
4. **Redirect** a pagina principale (anche se non ancora creata)

---

**Tempo richiesto:** 10-15 minuti
**Difficoltà:** Media (richiede modifica del codice)

**Alternativa più facile:** Netlify (5 minuti, zero modifica codice)

---

_Creato: 8 Novembre 2025_
_Versione: 1.0 - Specifico per Playcode_
_Risolve: Errore "Imported module 'https:' from '' is not installed"_
