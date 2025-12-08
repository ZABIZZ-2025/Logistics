# 🚚 RBS Logistica Smart

Sistema di gestione viaggi e logistica con Kanban board interattiva e sincronizzazione real-time.

## ✨ Caratteristiche

- ✅ Gestione viaggi con Kanban board drag & drop
- ✅ Autenticazione multi-utente (Admin/User)
- ✅ Creazione e gestione richieste viaggi
- ✅ Anagrafica clienti con autocompletamento
- ✅ Export percorsi Google Maps
- ✅ Sincronizzazione real-time con Supabase
- ✅ Interfaccia responsive e moderna

## 🚀 Setup Rapido

### 1. Crea Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto
3. Vai su **SQL Editor** e esegui il contenuto di `supabase-schema.sql`
4. Vai su **Settings → API** e copia:
   - **Project URL**
   - **anon public key**

### 2. Configura l'Applicazione

Apri `supabase-config.js` e sostituisci i valori:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tuo-progetto.supabase.co',  // Il tuo Project URL
    anonKey: 'tua-anon-public-key'            // La tua anon public key
};
```

### 3. Crea Utente Amministratore

1. In Supabase Dashboard vai su **Authentication → Users**
2. Clicca **Add user** → **Create new user**
3. Inserisci:
   - Email: `admin@tuodominio.com`
   - Password: (scegli una password sicura)
   - ✅ Spunta "Auto Confirm User"
4. Copia l'**UUID** dell'utente creato
5. Vai su **SQL Editor** ed esegui:

```sql
INSERT INTO user_profiles (id, user_id, username, role)
VALUES (
    'uuid-copiato-da-auth-users',  -- UUID dell'utente
    'admin',                        -- Username
    'Amministratore',              -- Nome visualizzato
    'admin'                        -- Ruolo: 'admin' o 'user'
);
```

### 4. Deploy

**Opzione A - Netlify (consigliato):**
1. Vai su [netlify.com/drop](https://app.netlify.com/drop)
2. Trascina l'intera cartella del progetto
3. Fatto! L'app è online 🎉

**Opzione B - Locale:**
1. Apri `index.html` nel browser
2. Fatto! 🎉

## 🔐 Login

- **Email**: quella inserita in Supabase Auth (es: admin@tuodominio.com)
- **Password**: quella impostata in Supabase Auth
- **IMPORTANTE**: Usa l'**EMAIL**, non un username!

## 🗄️ Migrazioni Database

Se il database esiste già ed è stato creato con una versione precedente, applica queste migrazioni in ordine:

### 1. Aggiunta Campi Viaggi
```bash
supabase-migration-add-missing-fields.sql
```
Aggiunge i campi: `circuito`, `merce`, `peso`, `volume`, `motivo`

### 2. Fix Trigger Eliminazione
```bash
supabase-migration-fix-delete-trigger.sql
```
Corregge il trigger per permettere l'eliminazione corretta dei viaggi

## 📁 Struttura File

```
├── index.html                                  # Pagina di login
├── dashboard.html                              # Applicazione principale
├── app-supabase.js                            # Logica applicazione
├── supabase-config.js                         # ⚙️ Configurazione Supabase
├── styles.css                                 # Stili CSS
├── logo.svg                                   # Logo
├── manifest.json                              # PWA manifest
├── netlify.toml                               # Configurazione Netlify
├── _redirects                                 # Rewrite rules Netlify
├── supabase-schema.sql                        # 🗄️ Schema database completo
├── supabase-migration-add-missing-fields.sql  # Migrazione campi
└── supabase-migration-fix-delete-trigger.sql  # Migrazione trigger
```

## 🎯 Funzionalità

### Per Utenti Normali
- Creare nuove richieste di viaggio
- Visualizzare le proprie richieste
- Visualizzare lo stato delle richieste

### Per Amministratori
- Tutte le funzionalità degli utenti +
- Gestire TUTTI i viaggi con drag & drop
- Modificare e eliminare qualsiasi viaggio
- Gestire anagrafica clienti
- Esportare percorsi su Google Maps

## 🆘 Troubleshooting

### Login non funziona (loop infinito)

**Problema**: La pagina torna sempre al login dopo aver inserito le credenziali.

**Soluzioni**:
1. **Verifica che il progetto Supabase sia attivo**
   - Vai su Supabase Dashboard
   - Se vedi "Paused", clicca "Restore/Unpause"
   - Aspetta 2-3 minuti

2. **Verifica URL e chiavi in `supabase-config.js`**
   - Devono corrispondere a quelli in Settings → API

3. **Verifica profilo utente**
   - Esegui in SQL Editor:
   ```sql
   SELECT * FROM user_profiles;
   ```
   - Deve esistere un profilo con l'UUID dell'utente

4. **Usa EMAIL per il login** (non username!)

5. **Pulisci cache browser** (Ctrl+Shift+Del)

### Errore "Cannot read properties of null (reading 'AuthClient')"

**Problema**: Supabase client non riesce a inizializzarsi.

**Soluzioni**:
1. Verifica che il progetto Supabase sia **Active** (non Paused)
2. Verifica che URL e anon key in `supabase-config.js` siano corretti
3. Pulisci cache browser e ricarica (Ctrl+Shift+F5)

### Errore creazione viaggi

**Problema**: Errore al salvataggio del viaggio.

**Soluzione**: Applica la migrazione `supabase-migration-add-missing-fields.sql`

### Errore eliminazione viaggi

**Problema**: Errore quando si elimina un viaggio.

**Soluzione**: Applica la migrazione `supabase-migration-fix-delete-trigger.sql`

## 🔒 Sicurezza

- HTTPS obbligatorio (fornito da Netlify)
- Autenticazione JWT con Supabase
- Row Level Security (RLS) abilitato
- Permessi basati su ruoli (admin/user)

## 📞 Supporto

Per problemi:
1. Apri la Console browser (F12) e verifica errori
2. Verifica che Supabase sia configurato correttamente
3. Verifica che le migrazioni siano state applicate

## 📄 Licenza

© 2025 RBS 1979 - Tutti i diritti riservati

---

**Versione**: 2.0
**Database**: Supabase PostgreSQL
**Deploy**: Netlify
