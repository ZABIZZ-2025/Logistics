# RBS Logistica Smart 🚚

Sistema di gestione viaggi e logistica per RBS 1979 - Applicazione web completa senza database esterni.

## 📋 Moduli Implementati

### ✅ Modulo 1: Crea Post-it Virtuale
- Form completo per creare nuovi viaggi
- 7 campi essenziali:
  1. Urgente (Sì/No)
  2. Azienda/Cliente
  3. Luogo di destinazione
  4. Orario richiesto
  5. Descrizione merce
  6. Dimensioni/Quantità (peso/volume)
  7. Motivo del viaggio (Ritiro/Consegna/Entrambi)
- Autocomplete per aziende e luoghi già utilizzati
- Salvataggio automatico nel browser (LocalStorage)

### ✅ Modulo 2: Kanban Virtuale Interattivo
- 6 colonne operative:
  - **PIANIFICATO**: Viaggi programmati
  - **IN CORSO**: Viaggi in esecuzione
  - **CORRIERE ESTERNO**: Affidati a corrieri
  - **URGENZE**: Richieste prioritarie
  - **RIMANDA DOMANI**: Non urgenti
  - **COMPLETATO**: Viaggi conclusi
- **Drag & Drop**: Sposta i post-it tra colonne trascinandoli
- 4 circuiti geografici: Nord-Est, Nord-Ovest, Sud, Corriere
- Visualizzazione colorata per urgenze e corrieri
- Contatori automatici per ogni colonna

## 🚀 Come Utilizzare l'App

### Avvio Immediato

1. **Apri il file `index.html` nel browser**
   ```bash
   # Opzione 1: Doppio click su index.html
   # Opzione 2: Apri da terminale
   open index.html        # Mac
   xdg-open index.html    # Linux
   start index.html       # Windows
   ```

2. **Oppure usa un server locale (consigliato)**
   ```bash
   # Con Python 3
   python3 -m http.server 8000

   # Con Node.js
   npx http-server -p 8000

   # Con PHP
   php -S localhost:8000
   ```

3. **Apri il browser**: http://localhost:8000

### Primo Utilizzo

L'app è precaricata con **3 viaggi di esempio** per testare immediatamente le funzionalità.

### Funzionalità Principali

#### 1️⃣ Creare un Nuovo Viaggio

1. Clicca su **"➕ Nuovo Viaggio"** in alto a destra
2. Compila il form con i 7 campi
3. Spunta **"URGENTE"** se necessario
4. Clicca su **"💾 Salva Post-it"**
5. Il post-it apparirà nella colonna appropriata

#### 2️⃣ Spostare un Viaggio

- **Trascina** il post-it da una colonna all'altra
- Il sistema salva automaticamente la nuova posizione
- Riceverai una notifica di conferma

#### 3️⃣ Modificare un Viaggio

1. Clicca sull'icona **✏️** sul post-it
2. Modifica i campi nel form
3. Clicca **"💾 Salva Post-it"**

#### 4️⃣ Eliminare un Viaggio

1. Clicca sull'icona **🗑️** sul post-it
2. Conferma l'eliminazione

#### 5️⃣ Filtrare i Viaggi

Nella sidebar sinistra:
- **Cerca**: Filtra per cliente, luogo o merce
- **Circuito**: Mostra solo viaggi di un circuito specifico
- **Solo Urgenti**: Mostra solo viaggi urgenti

#### 6️⃣ Esportare/Importare Dati

- **Esporta**: Scarica tutti i viaggi in formato JSON
- **Importa**: Carica un file JSON precedentemente esportato

## 📊 Statistiche

La sidebar mostra in tempo reale:
- Viaggi totali
- Pianificati
- In corso
- Completati
- Urgenze

## 🎨 Caratteristiche Tecniche

### Tecnologie Utilizzate

- **HTML5**: Struttura moderna e semantica
- **CSS3**: Design responsive con gradients e animazioni
- **JavaScript Vanilla**: Nessuna dipendenza esterna
- **LocalStorage**: Persistenza dati nel browser
- **Drag & Drop API**: Interazione intuitiva
- **Progressive Web App (PWA)**: Installabile come app

### Storage Dati

- **LocalStorage**: Tutti i dati sono salvati nel browser
- **Nessun database esterno** richiesto
- **Backup automatico** tramite export JSON
- **Capacità**: ~5-10MB (migliaia di viaggi)

### Compatibilità

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Design

- 📱 **Mobile**: Layout a colonna singola
- 📱 **Tablet**: Layout a 2 colonne
- 💻 **Desktop**: Layout completo a 6 colonne

## 🔧 Personalizzazione

### Aggiungere il Logo RBS 1979

1. Salva il logo come `logo.png` nella cartella principale
2. Dimensioni consigliate: 200x50px (PNG trasparente)
3. Ricarica la pagina

### Modificare i Circuiti

Modifica il file `app.js` alla riga con i circuiti:

```javascript
const circuitoIcon = {
    'nord-est': '🗺️ Nord-Est',
    'nord-ovest': '🗺️ Nord-Ovest',
    'sud': '🗺️ Sud',
    'corriere': '📦 Corriere',
    'tuo-circuito': '🗺️ Tuo Circuito' // Aggiungi qui
};
```

E nel form HTML (`index.html`):

```html
<option value="tuo-circuito">🗺️ Tuo Circuito</option>
```

### Cambiare i Colori

Modifica le variabili CSS in `styles.css`:

```css
:root {
    --primary-color: #ff6b35;  /* Arancione RBS */
    --secondary-color: #004e89;
    /* ... altri colori ... */
}
```

## 🔐 Sicurezza e Privacy

- ✅ Tutti i dati rimangono **nel browser locale**
- ✅ Nessun invio dati a server esterni
- ✅ Nessun tracking o analytics
- ✅ Funziona completamente **offline**
- ⚠️ Backup regolare tramite export consigliato

## 📱 Installare come App

### Desktop (Chrome/Edge)

1. Apri l'app nel browser
2. Clicca sull'icona **"Installa"** nella barra degli indirizzi
3. Conferma l'installazione

### Mobile (iOS/Android)

1. Apri l'app in Safari (iOS) o Chrome (Android)
2. Tocca **"Condividi"** (iOS) o **"Menu"** (Android)
3. Seleziona **"Aggiungi a Home"**

## 🔄 Backup e Ripristino

### Backup Manuale

1. Clicca su **"📥 Esporta Dati"**
2. Salva il file JSON in un luogo sicuro
3. Ripeti regolarmente (es. ogni settimana)

### Ripristino

1. Clicca su **"📤 Importa Dati"**
2. Seleziona il file JSON salvato
3. Conferma la sostituzione dei dati attuali

### Backup Automatico

I dati sono salvati automaticamente nel browser, ma:
- ⚠️ Possono essere persi se cancelli la cache del browser
- ⚠️ Non sono condivisi tra dispositivi diversi
- ✅ Usa l'export per backup sicuri

## ⌨️ Scorciatoie da Tastiera

- **Ctrl/Cmd + N**: Crea nuovo viaggio
- **ESC**: Chiudi modal/form
- **Tab**: Naviga tra i campi del form

## 🐛 Risoluzione Problemi

### I dati non si salvano

- Verifica che il browser non sia in modalità incognito
- Controlla che i cookie/storage siano abilitati
- Fai un export per backup

### Il drag & drop non funziona

- Aggiorna il browser all'ultima versione
- Prova con Chrome o Firefox
- Disabilita estensioni che potrebbero interferire

### L'app è lenta

- Esporta i dati
- Cancella i viaggi completati vecchi
- Reimporta i dati aggiornati

## 📞 Supporto

Per problemi o domande:
- Controlla questa documentazione
- Verifica la console del browser (F12)
- Esporta i dati prima di modifiche importanti

## 🎯 Roadmap Futuri Moduli

- **Modulo 3**: Vista Mobile Driver (percorsi e navigazione)
- **Modulo 4**: Checklist Magazzino
- **Modulo 5**: Dashboard Analytics
- **Modulo 6**: Report e Statistiche Avanzate

## 📄 Licenza

© 2025 RBS 1979 - Uso interno aziendale

---

**Versione**: 1.0.0
**Data**: Ottobre 2025
**Sviluppato per**: RBS 1979 Logistica
