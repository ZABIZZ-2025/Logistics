// ==========================================
// RBS LOGISTICA SMART - VERSIONE SENZA LOGIN
// ==========================================

import { initSupabase } from './supabase-config.js';

// Global State
let supabase = null;
let viaggi = [];
let currentFilters = {
    search: '',
    circuit: '',
    urgentOnly: false
};
let anagraficaClienti = [];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Avvio RBS Logistica Smart...');

    // Inizializza Supabase
    supabase = await initSupabase();

    if (!supabase) {
        console.error('❌ Impossibile connettersi al database');
        showToast('Errore connessione database', 'error');
        return;
    }

    console.log('✅ Connesso a Supabase');

    try {
        await loadAllData();
        renderKanban();
        updateStats();
        populateAutocomplete();
        console.log('✅ App inizializzata con successo');
    } catch (err) {
        console.error('❌ Errore inizializzazione:', err);
        showToast('Errore caricamento dati: ' + err.message, 'error');
    }
});

// ==========================================
// DATA MANAGEMENT
// ==========================================

async function loadAllData() {
    console.log('📦 Caricamento dati...');
    await loadViaggi();
    await loadAnagraficaClienti();
}

async function loadViaggi() {
    console.log('📋 Caricamento viaggi...');

    const { data, error } = await supabase
        .from('viaggi')
        .select('*')
        .order('order', { ascending: true });

    if (error) {
        console.error('❌ Errore caricamento viaggi:', error);
        throw error;
    }

    viaggi = data || [];
    console.log(`✅ Caricati ${viaggi.length} viaggi`);
}

async function loadAnagraficaClienti() {
    console.log('👥 Caricamento anagrafica...');

    const { data, error } = await supabase
        .from('anagrafica')
        .select('*')
        .order('cliente', { ascending: true });

    if (error) {
        console.error('❌ Errore caricamento anagrafica:', error);
        return;
    }

    anagraficaClienti = data || [];
    console.log(`✅ Caricati ${anagraficaClienti.length} clienti`);
}

// ==========================================
// KANBAN RENDERING
// ==========================================

function renderKanban() {
    console.log('🎨 Rendering kanban...');

    const columns = ['richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

    // Pulisci tutte le colonne
    columns.forEach(col => {
        const container = document.getElementById(`col-${col}`);
        if (container) container.innerHTML = '';
    });

    // Filtra e ordina
    const filteredViaggi = applyFiltersToData();
    filteredViaggi.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`📍 Rendering ${filteredViaggi.length} viaggi`);

    // Renderizza ogni viaggio
    filteredViaggi.forEach(viaggio => {
        const postItElement = createCompactPostIt(viaggio);
        const container = document.getElementById(`col-${viaggio.column}`);
        if (container) {
            container.appendChild(postItElement);
        } else {
            console.warn(`⚠️ Colonna non trovata: ${viaggio.column}`);
        }
    });

    updateColumnCounts();
}

function createCompactPostIt(viaggio) {
    const div = document.createElement('div');
    div.className = `post-it-compact ${viaggio.urgente ? 'urgente' : ''} ${viaggio.circuito === 'corriere' ? 'corriere' : ''}`;
    div.draggable = true;
    div.dataset.id = viaggio.id;

    // Eventi drag
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', dragEnd);

    // Eventi per mostrare tooltip
    div.addEventListener('mouseenter', (e) => showGlobalTooltip(viaggio, e));
    div.addEventListener('mouseleave', hideGlobalTooltipDelayed);
    div.addEventListener('dblclick', (e) => showGlobalTooltip(viaggio, e, true));

    // Formatta luogo abbreviato
    const luogoShort = viaggio.luogo && viaggio.luogo.length > 25
        ? viaggio.luogo.substring(0, 25) + '...'
        : (viaggio.luogo || 'N/D');

    // Formatta data
    let dataFormatted = '';
    if (viaggio.data) {
        const parts = viaggio.data.split('-');
        if (parts.length === 3) {
            dataFormatted = `${parts[2]}/${parts[1]}`;
        }
    }

    div.innerHTML = `
        ${viaggio.urgente ? '<span class="compact-urgent-badge">!</span>' : ''}
        <div class="compact-dest">${escapeHtml(luogoShort)}</div>
        <div class="compact-time">${viaggio.orario || ''} - ${dataFormatted}</div>
    `;

    return div;
}

function applyFiltersToData() {
    return viaggi.filter(viaggio => {
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchSearch =
                (viaggio.azienda && viaggio.azienda.toLowerCase().includes(searchLower)) ||
                (viaggio.luogo && viaggio.luogo.toLowerCase().includes(searchLower)) ||
                (viaggio.merce && viaggio.merce.toLowerCase().includes(searchLower));
            if (!matchSearch) return false;
        }
        if (currentFilters.circuit && viaggio.circuito !== currentFilters.circuit) return false;
        if (currentFilters.urgentOnly && !viaggio.urgente) return false;
        return true;
    });
}

function updateColumnCounts() {
    const columns = ['richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];
    columns.forEach(col => {
        const container = document.getElementById(`col-${col}`);
        const countElement = document.getElementById(`count-${col}`);
        if (container && countElement) {
            countElement.textContent = container.children.length;
        }
    });
}

// ==========================================
// DRAG & DROP
// ==========================================

function allowDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
}

function dragStart(ev) {
    ev.dataTransfer.setData('text/plain', ev.target.dataset.id);
    ev.target.classList.add('dragging');
}

function dragEnd(ev) {
    ev.target.classList.remove('dragging');
    document.querySelectorAll('.column-content').forEach(col => col.classList.remove('drag-over'));
}

async function drop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');

    const id = ev.dataTransfer.getData('text/plain');
    const newColumn = ev.currentTarget.id.replace('col-', '');

    console.log(`🔄 Spostamento viaggio ${id} a ${newColumn}`);

    const { error } = await supabase
        .from('viaggi')
        .update({ column: newColumn })
        .eq('id', id);

    if (error) {
        console.error('❌ Errore spostamento:', error);
        showToast('Errore spostamento', 'error');
        return;
    }

    await loadViaggi();
    renderKanban();
    updateStats();
    showToast('Viaggio spostato', 'success');
}

// ==========================================
// STATISTICS
// ==========================================

function updateStats() {
    const stats = {
        total: viaggi.length,
        richieste: viaggi.filter(v => v.column === 'richieste').length,
        pianificati: viaggi.filter(v => v.column === 'pianificato').length,
        inCorso: viaggi.filter(v => v.column === 'in-corso').length,
        completati: viaggi.filter(v => v.column === 'completato').length,
        urgenze: viaggi.filter(v => v.urgente || v.column === 'urgenze').length
    };

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statRichieste').textContent = stats.richieste;
    document.getElementById('statPianificati').textContent = stats.pianificati;
    document.getElementById('statInCorso').textContent = stats.inCorso;
    document.getElementById('statCompletati').textContent = stats.completati;
    document.getElementById('statUrgenze').textContent = stats.urgenze;

    console.log('📊 Stats aggiornate:', stats);
}

// ==========================================
// FILTERS
// ==========================================

function applyFilters() {
    currentFilters.search = document.getElementById('searchFilter').value.trim();
    currentFilters.circuit = document.getElementById('circuitFilter').value;
    currentFilters.urgentOnly = document.getElementById('urgentFilter').checked;
    renderKanban();
}

function clearFilters() {
    document.getElementById('searchFilter').value = '';
    document.getElementById('circuitFilter').value = '';
    document.getElementById('urgentFilter').checked = false;
    currentFilters = { search: '', circuit: '', urgentOnly: false };
    renderKanban();
    showToast('Filtri rimossi', 'success');
}

// ==========================================
// EDIT / DELETE
// ==========================================

async function editViaggio(id) {
    // Redirect a pagina modifica (da implementare) o alert
    alert('Funzione modifica in sviluppo. ID: ' + id);
}

async function deleteViaggio(id) {
    if (!confirm('Eliminare questo viaggio?')) return;

    const { error } = await supabase.from('viaggi').delete().eq('id', id);

    if (error) {
        console.error('❌ Errore eliminazione:', error);
        showToast('Errore eliminazione', 'error');
        return;
    }

    await loadViaggi();
    renderKanban();
    updateStats();
    showToast('Viaggio eliminato', 'success');
}

// ==========================================
// GOOGLE MAPS EXPORT
// ==========================================

function exportToGoogleMaps() {
    const pianificati = viaggi.filter(v => v.column === 'pianificato');

    if (pianificati.length === 0) {
        showToast('Nessun viaggio pianificato', 'warning');
        return;
    }

    const addresses = pianificati.map(v => v.luogo).filter(Boolean);

    if (addresses.length === 0) {
        showToast('Nessun indirizzo valido', 'warning');
        return;
    }

    let mapsUrl;
    if (addresses.length === 1) {
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addresses[0])}&travelmode=driving`;
    } else {
        const origin = encodeURIComponent(addresses[0]);
        const destination = encodeURIComponent(addresses[addresses.length - 1]);
        const waypoints = addresses.slice(1, -1).map(a => encodeURIComponent(a)).join('|');
        mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? '&waypoints=' + waypoints : ''}&travelmode=driving`;
    }

    window.open(mapsUrl, '_blank');
    showToast('Apertura Google Maps...', 'success');
}

// ==========================================
// AUTOCOMPLETE
// ==========================================

function populateAutocomplete() {
    const aziende = [...new Set(viaggi.map(v => v.azienda).filter(Boolean))];
    const luoghi = [...new Set(viaggi.map(v => v.luogo).filter(Boolean))];

    const aziendaList = document.getElementById('aziendaList');
    const luogoList = document.getElementById('luogoList');

    if (aziendaList) aziendaList.innerHTML = aziende.map(a => `<option value="${escapeHtml(a)}">`).join('');
    if (luogoList) luogoList.innerHTML = luoghi.map(l => `<option value="${escapeHtml(l)}">`).join('');
}

// ==========================================
// UTILITIES
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log(`Toast [${type}]: ${message}`);
        return;
    }
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// GLOBAL TOOLTIP
// ==========================================

let tooltipTimeout = null;
let tooltipLocked = false;

// Aggiungi eventi al tooltip per mantenerlo aperto quando ci passi sopra
document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('globalTooltip');
    if (tooltip) {
        tooltip.addEventListener('mouseenter', () => {
            // Cancella il timeout di chiusura quando entri nel tooltip
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        });
        tooltip.addEventListener('mouseleave', () => {
            // Chiudi quando esci dal tooltip (se non è locked)
            if (!tooltipLocked) {
                hideGlobalTooltip();
            }
        });
    }
});

function showGlobalTooltip(viaggio, event, lock = false) {
    const tooltip = document.getElementById('globalTooltip');
    if (!tooltip) return;

    // Se locked e non è un doppio click, non mostrare
    if (tooltipLocked && !lock) return;

    // Cancella timeout di chiusura
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }

    // Lock se doppio click
    if (lock) {
        tooltipLocked = true;
    }

    // Labels
    const motivoLabel = {
        'ritiro': '📥 Ritiro',
        'consegna': '📤 Consegna',
        'entrambi': '🔄 Ritiro + Consegna'
    };
    const circuitoLabel = {
        'nord-est': '🗺️ Nord-Est',
        'nord-ovest': '🗺️ Nord-Ovest',
        'sud': '🗺️ Sud',
        'corriere': '📦 Corriere'
    };

    // Formatta data
    let dataFormatted = viaggio.data || '';
    if (viaggio.data) {
        const parts = viaggio.data.split('-');
        if (parts.length === 3) {
            dataFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    // Contenuto tooltip
    const content = tooltip.querySelector('.tooltip-content');
    content.innerHTML = `
        <div class="tooltip-header">
            <span class="tooltip-azienda">${escapeHtml(viaggio.azienda || 'N/D')}</span>
            <div class="tooltip-badges">
                ${viaggio.urgente ? '<span class="tooltip-badge urgente">⚠️ URGENTE</span>' : ''}
            </div>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">📍 Luogo:</span>
            <span class="tooltip-value">${escapeHtml(viaggio.luogo || 'N/D')}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">📅 Data:</span>
            <span class="tooltip-value">${dataFormatted}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">🕐 Orario:</span>
            <span class="tooltip-value">${viaggio.orario || 'N/D'}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">🗺️ Circuito:</span>
            <span class="tooltip-value">${circuitoLabel[viaggio.circuito] || viaggio.circuito || 'N/D'}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">📦 Merce:</span>
            <span class="tooltip-value">${escapeHtml(viaggio.merce || 'N/D')}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">🚚 Tipo:</span>
            <span class="tooltip-value">${motivoLabel[viaggio.motivo] || viaggio.motivo || 'N/D'}</span>
        </div>
        ${viaggio.peso ? `
        <div class="tooltip-row">
            <span class="tooltip-label">⚖️ Peso:</span>
            <span class="tooltip-value">${viaggio.peso} kg</span>
        </div>
        ` : ''}
        ${viaggio.volume ? `
        <div class="tooltip-row">
            <span class="tooltip-label">📦 Pacchi:</span>
            <span class="tooltip-value">${viaggio.volume}</span>
        </div>
        ` : ''}
        ${viaggio.note ? `
        <div class="tooltip-row">
            <span class="tooltip-label">📝 Note:</span>
            <span class="tooltip-value">${escapeHtml(viaggio.note)}</span>
        </div>
        ` : ''}
        <div class="tooltip-actions">
            <button class="tooltip-btn tooltip-btn-edit" onclick="editViaggio('${viaggio.id}')">✏️ Modifica</button>
            <button class="tooltip-btn tooltip-btn-delete" onclick="deleteViaggio('${viaggio.id}')">🗑️ Elimina</button>
        </div>
    `;

    // Posiziona tooltip
    tooltip.style.display = 'block';

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.right + 15;
    if (left + tooltipRect.width > window.innerWidth) {
        left = rect.left - tooltipRect.width - 15;
    }
    if (left < 10) left = 10;

    let top = rect.top;
    if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
    }
    if (top < 10) top = 10;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideGlobalTooltipDelayed() {
    if (tooltipLocked) return;

    tooltipTimeout = setTimeout(() => {
        hideGlobalTooltip();
    }, 300);
}

function hideGlobalTooltip() {
    const tooltip = document.getElementById('globalTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
    tooltipLocked = false;
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================

window.allowDrop = allowDrop;
window.drop = drop;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.editViaggio = editViaggio;
window.deleteViaggio = deleteViaggio;
window.exportToGoogleMaps = exportToGoogleMaps;
window.hideGlobalTooltip = hideGlobalTooltip;

console.log('📦 app-noauth.js caricato');
