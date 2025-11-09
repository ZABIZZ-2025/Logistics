# 🔐 Guida Sistema di Autenticazione

## Panoramica

L'app RBS Logistica Smart ora include un sistema di autenticazione con **due ruoli utente**:

### 👑 **Admin (Amministratori)**
- Gestiscono il Kanban completo
- Possono spostare, modificare ed eliminare tutti i post-it
- Approvano le richieste degli utenti
- Gestiscono gli utenti (creazione, modifica, eliminazione)
- Accedono a export/import dati
- Visualizzano tutte le statistiche

### 👤 **User (Utenti Standard)**
- Possono **solo creare richieste di viaggio**
- Le richieste vanno nella colonna "RICHIESTE DA APPROVARE"
- Vedono lo stato delle proprie richieste
- **Non vedono** il Kanban completo
- **Non possono** modificare o eliminare viaggi

---

## 🚀 Come Accedere

### Primo Accesso

1. Apri l'app: verrà visualizzata la **pagina di login**
2. Usa uno degli account di default:

#### Admin di Default
```
Username: admin
Password: admin123
```

#### Utente Standard di Default
```
Username: user
Password: user123
```

### Interfaccia Diversa per Ruolo

#### Admin vedono:
- 📋 Kanban completo con 7 colonne
- 📊 Sidebar con statistiche
- 👥 Pulsante "Gestisci Utenti"
- 📥📤 Export/Import dati
- ➕ Pulsante "Nuovo Viaggio"

#### Utenti vedono:
- 📝 Form per creare richieste di viaggio
- 📋 Lista delle proprie richieste con stato
- ⏳ Stato: "In Attesa", "Approvata", "In Corso", "Completata"

---

## 🔄 Flusso di Lavoro

### Per Utenti Standard:

1. **Login** con credenziali utente
2. **Compila il form** con i dettagli del viaggio:
   - ⚠️ Urgenza (opzionale)
   - 🏢 Azienda/Cliente
   - 📍 Luogo destinazione
   - ⏰ Orario richiesto
   - 🗺️ Circuito geografico
   - 📦 Descrizione merce
   - ⚖️ Peso e numero pacchi
   - 🎯 Motivo (Ritiro/Consegna/Entrambi)
   - 📝 Note (opzionale)
3. **Clicca "Invia Richiesta"**
4. La richiesta viene inviata agli admin
5. **Visualizza lo stato** nella sezione "Le Tue Richieste Recenti"

### Per Admin:

1. **Login** con credenziali admin
2. **Visualizza il Kanban** completo
3. **Colonna "RICHIESTE"** mostra le richieste degli utenti
   - I post-it mostrano il nome dell'utente che ha fatto la richiesta
4. **Trascina il post-it** dalla colonna "RICHIESTE" a:
   - 📋 PIANIFICATO = richiesta approvata e pianificata
   - ⚠️ URGENZE = richiesta urgente da gestire subito
   - O qualsiasi altra colonna appropriata
5. Una volta spostato, l'utente vede la richiesta come "Approvata"

---

## 👥 Gestione Utenti (Solo Admin)

### Aggiungere Nuovo Utente

1. Login come admin
2. Clicca **"👥 Gestisci Utenti"** nell'header
3. Clicca **"➕ Aggiungi Utente"**
4. Inserisci:
   - Username
   - Password
   - Nome completo
   - Ruolo (Admin o User)
5. Il nuovo utente può ora fare login

### Eliminare Utente

1. Apri "Gestisci Utenti"
2. Clicca **"🗑️ Elimina"** accanto all'utente
3. Conferma eliminazione

**⚠️ Nota:** Non puoi eliminare l'utente con cui sei loggato

---

## 🆕 Modifiche all'Interfaccia

### Post-it più Piccoli
I post-it sono ora **più compatti** per visualizzare più informazioni sullo schermo:
- Font ridotto
- Padding ridotto
- Layout compatto con icone abbreviate

### Colonna "RICHIESTE"
Nuova colonna **"⏳ RICHIESTE"** nel Kanban:
- Colore arancione
- Contiene le richieste degli utenti in attesa di approvazione
- I post-it mostrano il nome dell'utente

### Statistiche Aggiornate
Sidebar con nuova statistica:
- **⏳ Richieste**: numero di richieste in attesa

---

## 🔒 Sicurezza

### Storage Dati
- **Utenti** salvati in `localStorage` (`rbs_users`)
- **Sessione** salvata in `localStorage` (`rbs_session`)
- **Password** salvate in chiaro (⚠️ sistema semplificato, non per uso produzione)

### Logout
- Clicca **"🚪 Esci"** nell'header
- La sessione viene cancellata
- Redirect automatico a pagina di login

### Protezione Funzioni
- Tutte le funzioni admin sono protette nel codice
- Gli utenti non possono accedere a funzioni admin anche modificando l'URL

---

## 📱 Compatibilità

Il sistema di autenticazione funziona su:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet
- ✅ Mobile (iOS Safari, Chrome Mobile)
- ✅ Offline (dopo primo carico)

---

## 🔧 Personalizzazione

### Modificare Utenti di Default

Modifica il file `login.html`, sezione `DEFAULT_USERS`:

```javascript
const DEFAULT_USERS = [
    {
        id: 'admin1',
        username: 'tuoadmin',
        password: 'tuapassword',
        role: 'admin',
        name: 'Tuo Nome Admin'
    },
    {
        id: 'user1',
        username: 'tuouser',
        password: 'tuapassword',
        role: 'user',
        name: 'Tuo Nome Utente'
    }
];
```

### Reset Utenti

Se hai perso l'accesso admin:

1. Apri la **Console del browser** (F12)
2. Esegui:
```javascript
localStorage.removeItem('rbs_users');
localStorage.removeItem('rbs_session');
```
3. Ricarica la pagina
4. Gli utenti di default saranno ripristinati

---

## ❓ FAQ

### Come cambio la password?
Al momento non c'è interfaccia per cambio password. Usa il pannello "Gestisci Utenti" per eliminare e ricreare l'utente con nuova password.

### Posso avere più di un admin?
Sì! Usa "Gestisci Utenti" per creare più account admin.

### Gli utenti possono vedere i viaggi completati?
Gli utenti vedono solo le **proprie richieste** e il loro stato.

### Come viene approvata una richiesta?
Un admin **trascina il post-it** dalla colonna "RICHIESTE" a qualsiasi altra colonna. Questo approva automaticamente la richiesta.

### Gli utenti ricevono notifiche?
No, al momento non ci sono notifiche push. Gli utenti vedono lo stato aggiornato quando accedono all'app.

---

## 🎯 Prossimi Sviluppi Possibili

- 🔔 Notifiche push per utenti
- 🔐 Hashing password
- 👤 Profili utente con avatar
- 📧 Reset password via email
- 📊 Report personalizzati per utente
- 💬 Chat interno tra utenti e admin

---

**Versione**: 2.0.0 con Autenticazione
**Data**: Ottobre 2025
