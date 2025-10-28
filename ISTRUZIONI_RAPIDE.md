# 🚀 AVVIO RAPIDO - RBS Logistica Smart

## Come Aprire l'App

### Metodo 1: Doppio Click (Più Semplice)
1. Vai nella cartella del progetto
2. Fai **doppio click** su `index.html`
3. L'app si aprirà nel browser

### Metodo 2: Server Locale (Consigliato)
```bash
# Apri il terminale nella cartella del progetto
cd /home/user/Logistics

# Avvia il server (scegli uno):
python3 -m http.server 8000

# Apri il browser:
# http://localhost:8000
```

## ✅ Primo Test - 5 Minuti

### 1. Crea il Primo Viaggio
- Clicca **"➕ Nuovo Viaggio"** (in alto a destra)
- Compila i campi:
  - Azienda: **CLIENTE PROVA**
  - Luogo: **Milano**
  - Orario: **14:00**
  - Circuito: **Nord-Est**
  - Merce: **Test consegna**
  - Peso: **10**
  - Pacchi: **2**
  - Motivo: **Consegna**
- Clicca **"💾 Salva Post-it"**

### 2. Prova il Drag & Drop
- **Trascina** il post-it creato dalla colonna **PIANIFICATO**
- **Rilascialo** nella colonna **IN CORSO**
- Vedrai un messaggio di conferma

### 3. Modifica un Viaggio
- Clicca l'icona **✏️** sul post-it
- Cambia l'orario o l'azienda
- Salva le modifiche

### 4. Prova i Filtri
Nella sidebar sinistra:
- Scrivi "PROVA" nella casella **Cerca**
- Vedrai solo i viaggi che contengono "PROVA"
- Clicca **"Pulisci Filtri"** per rimuovere

### 5. Esporta i Dati
- Clicca **"📥 Esporta Dati"**
- Salva il file JSON
- Questo è il tuo backup

## 📱 Moduli Disponibili

✅ **Modulo 1**: Form Crea Post-it
✅ **Modulo 2**: Kanban Interattivo

## 🎯 Funzionalità Principali

| Funzione | Come Fare |
|----------|-----------|
| **Nuovo viaggio** | Pulsante "➕ Nuovo Viaggio" |
| **Sposta viaggio** | Trascina il post-it tra colonne |
| **Modifica viaggio** | Icona ✏️ sul post-it |
| **Elimina viaggio** | Icona 🗑️ sul post-it |
| **Filtra viaggi** | Sidebar sinistra |
| **Esporta dati** | Pulsante "📥 Esporta Dati" |
| **Importa dati** | Pulsante "📤 Importa Dati" |

## 📊 Colonne Kanban

| Colonna | Scopo |
|---------|-------|
| 📋 **PIANIFICATO** | Viaggi programmati |
| 🚚 **IN CORSO** | Driver in viaggio |
| 📦 **CORRIERE ESTERNO** | Affidati a corrieri terzi |
| ⚠️ **URGENZE** | Da gestire immediatamente |
| ⏰ **RIMANDA DOMANI** | Posticipati |
| ✅ **COMPLETATO** | Consegnati |

## ⌨️ Scorciatoie

- **Ctrl/Cmd + N**: Nuovo viaggio
- **ESC**: Chiudi form
- **Tab**: Naviga tra campi

## 🔧 In Caso di Problemi

### L'app non si apre
- Usa un server locale (metodo 2)
- Controlla che JavaScript sia abilitato

### I dati non si salvano
- Non usare modalità incognito
- Abilita i cookie nel browser

### Il drag & drop non funziona
- Aggiorna il browser
- Usa Chrome o Firefox

## 💾 Backup Dati

**IMPORTANTE**: I dati sono salvati nel browser locale.

### Come fare backup regolari:
1. Ogni venerdì: clicca **"📥 Esporta Dati"**
2. Salva il file JSON in una cartella sicura
3. Usa nomi tipo: `rbs-backup-2025-10-28.json`

### Come ripristinare:
1. Clicca **"📤 Importa Dati"**
2. Seleziona il file JSON salvato
3. Conferma la sostituzione

## 📞 Note Importanti

- ✅ Funziona **senza internet** (dopo primo carico)
- ✅ Dati **salvati automaticamente**
- ✅ **Nessun server esterno** richiesto
- ⚠️ Fai **backup regolari** (export JSON)

## 🎨 Personalizzazione

### Aggiungere il logo aziendale:
1. Salva il logo come `logo.svg` o `logo.png`
2. Sostituisci il file esistente
3. Ricarica la pagina

---

**App pronta all'uso!** 🚀

Leggi il **README.md** completo per funzionalità avanzate.
