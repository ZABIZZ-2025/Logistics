# 🆘 Troubleshooting Netlify - Errore "Page Not Found"

## ❌ Problema Risolto

**Errore**: "Page not found" su Netlify
**Causa**: Configurazione `netlify.toml` con condizione errata
**Soluzione**: File corretti e semplificati

---

## 🔧 Fix Applicato

### 1. Corretto `netlify.toml`
**Problema**: Aveva una condizione `conditions = {Role = ["admin", "user"]}` che bloccava l'accesso
**Soluzione**: Rimossa condizione e semplificato il file

### 2. Creato `_redirects`
**Aggiunto**: File `_redirects` per gestire il routing in modo più semplice
**Contenuto**: Reindirizza tutti i path non esistenti a `index.html`

---

## 🚀 Come Applicare il Fix su Netlify

### Opzione A: Re-deploy Automatico (Git)

Se hai deployato tramite Git:

1. **Le modifiche sono già committate** su questo branch
2. **Netlify farà re-deploy automaticamente** entro 1-2 minuti
3. **Ricarica la pagina** dopo 2 minuti
4. ✅ **Dovrebbe funzionare!**

### Opzione B: Re-deploy Manuale (Drag & Drop)

Se hai usato Netlify Drop:

1. **Scarica/Aggiorna** la cartella del progetto con i file corretti
2. Vai su https://app.netlify.com
3. Login e seleziona il tuo sito
4. Vai su **"Deploys"** tab
5. Click **"Drag and drop your site folder here"**
6. **Trascina** l'intera cartella aggiornata
7. Attendi 30 secondi
8. ✅ **Dovrebbe funzionare!**

### Opzione C: Trigger Redeploy

Se vuoi forzare il redeploy senza modifiche:

1. Vai su https://app.netlify.com
2. Seleziona il tuo sito
3. Vai su **"Deploys"** tab
4. Click **"Trigger deploy"** > "Clear cache and deploy site"
5. Attendi 1-2 minuti
6. Ricarica la pagina

---

## 🔍 Verifica che il Fix Funzioni

### 1. Controlla Deploy Status

1. Vai su https://app.netlify.com
2. Seleziona il tuo sito
3. Guarda la sezione **"Production deploys"**
4. Lo stato dovrebbe essere: ✅ **"Published"** (verde)
5. Se vedi **"Building"** o **"Deploying"**, attendi che finisca

### 2. Controlla Log Deploy

1. Click sul deploy più recente
2. Vai su **"Deploy log"**
3. Scorri in fondo
4. Dovresti vedere: **"Site is live ✨"**
5. Se vedi errori in rosso, leggili per capire il problema

### 3. Testa l'URL

1. Apri l'URL del sito (es: `https://nome-sito.netlify.app`)
2. Dovresti vedere la **pagina di login**
3. Se vedi ancora 404, vai alla sezione "Diagnosi Avanzata" sotto

---

## 🔍 Diagnosi Avanzata

### Problema: Ancora "Page Not Found" dopo fix

**Verifica 1: File Deployati**

1. Netlify Dashboard > **"Deploys"** > Click ultimo deploy
2. Scroll in basso, click **"Deploy details"**
3. Click **"Browse deploy"** (icona cartella)
4. **Verifica che ci sia `index.html` nella root**
5. Se NON c'è, il problema è nella struttura del progetto

**Verifica 2: Publish Directory**

1. Netlify Dashboard > **"Site settings"**
2. **"Build & deploy"** > "Continuous Deployment"
3. Scroll a **"Build settings"**
4. **Publish directory** dovrebbe essere: `.` (punto) oppure vuoto
5. Se è diverso, cambialo e fai redeploy

**Verifica 3: Deploy Context**

1. Netlify Dashboard > **"Deploys"**
2. Guarda il **contesto** del deploy (es: "Production", "Branch deploy")
3. Assicurati di stare guardando il deploy **"Production"**

---

## ✅ Checklist Troubleshooting

- [ ] File `index.html` esiste nella root del progetto
- [ ] File `netlify.toml` corretto (senza `conditions`)
- [ ] File `_redirects` creato
- [ ] Deploy status: **"Published"** (verde)
- [ ] Deploy log: **"Site is live ✨"** (senza errori rossi)
- [ ] Publish directory impostato a `.` o vuoto
- [ ] URL sito aperto in **finestra incognito** (per evitare cache)

---

## 🐛 Altri Errori Comuni

### Errore: "File not found: index.html"

**Causa**: File `index.html` non nella directory publish
**Soluzione**:
1. Verifica che `index.html` sia nella root del progetto
2. Verifica publish directory in Settings > Build & deploy

### Errore: "Build failed"

**Causa**: Errore nel comando build
**Soluzione**:
1. Rimuovi il comando build da `netlify.toml`
2. Oppure imposta build command vuoto nelle Settings

### Errore: "Branch not found"

**Causa**: Branch Git non esiste su remote
**Soluzione**:
1. Pusha il branch: `git push -u origin nome-branch`
2. Oppure cambia branch in Netlify Settings

### Errore: Cache problemi

**Causa**: Browser o Netlify hanno cache vecchia
**Soluzione**:
1. Apri URL in **finestra incognito**
2. Oppure: Deploys > Trigger deploy > Clear cache and deploy

---

## 📝 File Corretti

### `netlify.toml` (Corretto)
```toml
# Netlify Configuration
[build]
  publish = "."

# Headers for security and performance
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.svg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### `_redirects` (Nuovo)
```
# Netlify _redirects file
# Simple redirect rules for SPA behavior

# Redirect all non-existing paths to index.html for client-side routing
/*    /index.html   200
```

---

## 🆘 Se Ancora Non Funziona

1. **Screenshot Deploy Log**
   - Vai su Deploys > Click ultimo deploy
   - Fai screenshot del log completo
   - Cerca errori in rosso

2. **Verifica Struttura Progetto**
   ```bash
   ls -la
   # Dovresti vedere:
   # index.html
   # dashboard.html
   # app-supabase.js
   # supabase-config.js
   # styles.css
   # netlify.toml
   # _redirects
   ```

3. **Test Locale**
   ```bash
   # Testa in locale per verificare che i file funzionino
   python3 -m http.server 8000
   # Apri: http://localhost:8000
   # Se funziona in locale, il problema è nel deploy Netlify
   ```

4. **Controlla Console Browser**
   - Apri URL Netlify
   - Premi F12
   - Vai al tab "Console"
   - Cerca errori in rosso
   - Gli errori possono indicare file mancanti o path errati

---

## 📞 Supporto

Se dopo tutti questi passi il problema persiste:

1. Controlla **Deploy log** su Netlify (screenshot)
2. Controlla **Console browser** (F12 > Console, screenshot)
3. Verifica che `index.html` esista con:
   ```bash
   cat index.html | head -20
   ```
4. Verifica publish directory:
   - Netlify Settings > Build & deploy
   - Publish directory: `.` o vuoto

---

## ✅ Test Finale

Quando funziona, dovresti vedere:

1. ✅ URL Netlify aperto → **Pagina di login** (non 404)
2. ✅ Logo RBS visibile (se presente)
3. ✅ Form con Email e Password
4. ✅ Console browser (F12) **senza errori critici** in rosso
5. ✅ Network tab (F12): file JS, CSS caricati correttamente

---

**Ultimo aggiornamento**: 9 Novembre 2025
**Fix applicato**: Rimossa condizione Role errata da netlify.toml
**File aggiunti**: `_redirects` per routing SPA
