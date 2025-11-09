# 🚚 RBS Logistica Smart - Supabase Edition

Sistema completo di gestione viaggi e logistica per RBS 1979.

## 🎯 Caratteristiche

- ✅ **Autenticazione sicura** con Supabase Auth
- ✅ **Database real-time** con Supabase PostgreSQL
- ✅ **Sincronizzazione multi-utente** in tempo reale
- ✅ **Kanban board interattivo** con drag & drop
- ✅ **Gestione anagrafica clienti**
- ✅ **Export Google Maps** per pianificazione percorsi
- ✅ **Responsive design** (Desktop, Tablet, Mobile)
- ✅ **PWA ready** (installabile come app)

## 📋 Requisiti

- Account Supabase (gratuito): https://supabase.com
- Browser moderno (Chrome, Firefox, Safari, Edge)

## 🚀 Deploy su Netlify (5 minuti)

### 1. Configura Supabase

1. Crea account su https://app.supabase.com
2. Crea nuovo progetto "RBS Logistica"
3. Vai su SQL Editor e esegui `supabase-schema.sql`
4. Vai su Settings > API e copia:
   - Project URL
   - anon public key

### 2. Configura l'App

Modifica `supabase-config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'IL_TUO_PROJECT_URL',
    anonKey: 'LA_TUA_ANON_KEY'
};
```

### 3. Crea Utente Admin

1. Vai su Authentication > Users
2. Click "Add user" > "Create new user"
3. Email: `admin@rbslogistica.local`
4. Password: (scegli una password sicura)
5. ✅ Spunta "Auto Confirm User"
6. Copia l'UUID dell'utente creato
7. Vai su SQL Editor ed esegui:

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'UUID_DELL_UTENTE',  -- Sostituisci con UUID copiato
    'admin',
    'Amministratore',
    'admin'
);
```

### 4. Deploy su Netlify

**Opzione A: Netlify Drop (più veloce)**
1. Vai su https://app.netlify.com/drop
2. Trascina l'intera cartella del progetto
3. Attendi 30 secondi
4. **FATTO!** L'app è online

**Opzione B: Git Deploy (consigliato per produzione)**
1. Pusha il repository su GitHub
2. Vai su https://app.netlify.com
3. Click "Add new site" > "Import from Git"
4. Seleziona il repository
5. Deploy automatico ad ogni push

## 📁 Struttura File

```
/
├── index.html              # Pagina login (entry point)
├── dashboard.html          # Dashboard Kanban
├── app-supabase.js         # Logica applicazione
├── supabase-config.js      # Configurazione Supabase
├── supabase-schema.sql     # Schema database
├── styles.css              # Stili CSS
├── logo.svg                # Logo RBS
├── manifest.json           # PWA manifest
├── docs/                   # Documentazione completa
└── README.md               # Questo file
```

## 🔐 Primo Accesso

1. Apri l'app nel browser
2. Email: `admin@rbslogistica.local`
3. Password: (quella scelta in Supabase)
4. Accedi e inizia a usare l'app!

## 📱 Funzionalità Principali

### Per Utenti Normali
- ✅ Creare nuove richieste di viaggio
- ✅ Visualizzare i propri viaggi
- ✅ Modificare richieste in stato "Richieste"
- ✅ Visualizzare storico delle modifiche

### Per Amministratori
- ✅ Tutte le funzionalità utente +
- ✅ Gestire TUTTI i viaggi (drag & drop tra colonne)
- ✅ Modificare qualsiasi viaggio
- ✅ Eliminare viaggi
- ✅ Gestire anagrafica clienti
- ✅ Esportare dati
- ✅ Export Google Maps per percorsi

## 🎨 Colonne Kanban

1. **Richieste** - Nuove richieste da processare
2. **Pianificato** - Viaggi pianificati
3. **In Corso** - Viaggi in esecuzione
4. **Preventivi** - Richieste di preventivo
5. **Corriere Esterno** - Affidati a corrieri terzi
6. **Completato** - Viaggi conclusi

## 🔄 Sincronizzazione Real-time

L'app usa Supabase Realtime per sincronizzare automaticamente:
- Nuovi viaggi creati
- Modifiche ai viaggi esistenti
- Spostamenti tra colonne
- Eliminazioni

Apri l'app in 2 finestre: le modifiche si vedono ISTANTANEAMENTE!

## 📊 Database

### Tabelle
- `user_profiles` - Profili utenti (ruoli e permessi)
- `anagrafica` - Clienti/fornitori
- `viaggi` - Viaggi/spedizioni
- `history` - Storico modifiche

### Sicurezza (RLS)
- ✅ Row Level Security abilitato
- ✅ Utenti vedono solo i propri dati
- ✅ Admin ha accesso completo
- ✅ Politiche di sicurezza automatiche

## 🛠️ Sviluppo Locale

```bash
# 1. Clona il repository
git clone <repository-url>
cd Logistics

# 2. Configura Supabase (modifica supabase-config.js)

# 3. Avvia server locale
python3 -m http.server 8000
# oppure
npx http-server -p 8000

# 4. Apri browser
open http://localhost:8000
```

## 📖 Documentazione Completa

Tutte le guide sono nella cartella `docs/`:

- `DEPLOY_RAPIDO_NETLIFY.txt` - Guida deploy dettagliata
- `SUPABASE_SETUP_GUIDE.md` - Setup Supabase completo
- `TROUBLESHOOTING_LOGIN.md` - Risoluzione problemi
- E molte altre...

## 🆘 Troubleshooting

### Login loop (torna sempre al login)
- **Causa**: Profilo non inserito in `user_profiles`
- **Soluzione**: Verifica di aver eseguito la query INSERT con l'UUID corretto

### Errore "Invalid login credentials"
- **Causa**: Email o password errate
- **Soluzione**: Verifica credenziali in Supabase > Authentication > Users

### Errore CORS
- **Causa**: File `supabase-config.js` non modificato
- **Soluzione**: Inserisci URL e key reali (non `YOUR_SUPABASE_...`)

### Più dettagli
Consulta `docs/TROUBLESHOOTING_LOGIN.md` per diagnostica completa

## 🔒 Sicurezza

- ✅ HTTPS obbligatorio (fornito da Netlify)
- ✅ Autenticazione JWT con Supabase
- ✅ Row Level Security su database
- ✅ API keys protette (anon key è pubblica per design)
- ✅ Nessun dato sensibile in frontend

## 📝 Licenza

© 2025 RBS 1979 - Uso interno aziendale

## 🤝 Supporto

Per problemi o domande:
1. Consulta la documentazione in `docs/`
2. Verifica Console browser (F12) per errori
3. Controlla configurazione Supabase

---

**Versione**: 2.0.0
**Ultimo aggiornamento**: Novembre 2025
**Database**: Supabase PostgreSQL
**Deploy**: Netlify
