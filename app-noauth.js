// ==========================================
// RBS LOGISTICA SMART - VERSIONE SENZA LOGIN
// ==========================================

import { supabase } from './supabase-config.js';

// Global State
let viaggi = [];
let currentFilters = {
    search: '',
    circuit: '',
    urgentOnly: false
};
let anagraficaClienti = [];
let realtimeChannel = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inizializzazione RBS Logistica Smart (No Auth)...');

    await loadAllData();
    renderKanban();
    updateStats();
    populateAutocomplete();
    setupRealtimeSubscriptions();

    console.log('App inizializzata con successo');
});

// ==========================================
// DATA MANAGEMENT
// ==========================================

async function loadAllData() {
    await loadViaggi();
    await loadAnagraficaClienti();
}

async function loadViaggi() {
    const { data, error } = await supabase
        .from('viaggi')
        .select('*')
        .order('order', { ascending: true });

    if (error) {
        console.error('Errore caricamento viaggi:', error);
        viaggi = [];
        return;
    }

    viaggi = data || [];
    console.log(`Caricati ${viaggi.length} viaggi`);
}

async function loadAnagraficaClienti() {
    const { data, error } = await supabase
        .from('anagrafica')
        .select('*')
        .order('cliente', { ascending: true });

    if (error) {
        console.error('Errore caricamento anagrafica:', error);
        anagraficaClienti = [];
        return;
    }

    anagraficaClienti = (data || []).map(item => ({
        id: item.id,
        azienda: item.cliente,
        luogo: item.indirizzo
    }));
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

function setupRealtimeSubscriptions() {
    realtimeChannel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'viaggi' },
            async () => {
                await loadViaggi();
                renderKanban();
                updateStats();
            }
        )
        .subscribe();
}

// ==========================================
// KANBAN RENDERING - SEGNAPOSTI COMPATTI
// ==========================================

function renderKanban() {
    const columns = ['richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

    columns.forEach(col => {
        const container = document.getElementById(`col-${col}`);
        if (container) container.innerHTML = '';
    });

    const filteredViaggi = applyFiltersToData();
    filteredViaggi.sort((a, b) => (a.order || 0) - (b.order || 0));

    filteredViaggi.forEach(viaggio => {
        const postItElement = createCompactPostIt(viaggio);
        const container = document.getElementById(`col-${viaggio.column}`);
        if (container) container.appendChild(postItElement);
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
    div.addEventListener('dragover', dragOverPostIt);
    div.addEventListener('drop', dropOnPostIt);
    div.addEventListener('dragleave', dragLeavePostIt);

    // Formatta luogo abbreviato
    const luogoShort = viaggio.luogo.length > 25
        ? viaggio.luogo.substring(0, 25) + '...'
        : viaggio.luogo;

    // Formatta data
    let dataFormatted = '';
    if (viaggio.data) {
        const parts = viaggio.data.split('-');
        if (parts.length === 3) {
            dataFormatted = `${parts[2]}/${parts[1]}`;
        }
    }

    const motivoIcon = {
        'ritiro': 'Ritiro',
        'consegna': 'Consegna',
        'entrambi': 'Rit+Cons'
    };

    const circuitoIcon = {
        'nord-est': 'NE',
        'nord-ovest': 'NO',
        'sud': 'Sud',
        'corriere': 'Corr'
    };

    div.innerHTML = `
        ${viaggio.urgente ? '<span class="compact-urgent-badge">!</span>' : ''}
        <div class="compact-dest">${escapeHtml(luogoShort)}</div>
        <div class="compact-time">${viaggio.orario} - ${dataFormatted}</div>

        <!-- Tooltip con dettagli completi -->
        <div class="post-it-tooltip">
            <div class="tooltip-header">
                <span class="tooltip-azienda">${escapeHtml(viaggio.azienda)}</span>
                <div class="tooltip-badges">
                    ${viaggio.urgente ? '<span class="tooltip-badge urgente">URGENTE</span>' : ''}
                </div>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Luogo:</span>
                <span class="tooltip-value">${escapeHtml(viaggio.luogo)}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Data:</span>
                <span class="tooltip-value">${dataFormatted} alle ${viaggio.orario}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Circuito:</span>
                <span class="tooltip-value">${circuitoIcon[viaggio.circuito] || viaggio.circuito}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Merce:</span>
                <span class="tooltip-value">${escapeHtml(viaggio.merce || '-')}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Tipo:</span>
                <span class="tooltip-value">${motivoIcon[viaggio.motivo] || viaggio.motivo}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Pacchi/Peso:</span>
                <span class="tooltip-value">${viaggio.volume || 0} pz / ${viaggio.peso || 0} kg</span>
            </div>
            ${viaggio.note ? `
            <div class="tooltip-row">
                <span class="tooltip-label">Note:</span>
                <span class="tooltip-value">${escapeHtml(viaggio.note)}</span>
            </div>
            ` : ''}
            <div class="tooltip-actions">
                <button class="tooltip-btn tooltip-btn-edit" onclick="editViaggio('${viaggio.id}')">Modifica</button>
                <button class="tooltip-btn tooltip-btn-delete" onclick="deleteViaggio('${viaggio.id}')">Elimina</button>
            </div>
        </div>
    `;

    return div;
}

function applyFiltersToData() {
    return viaggi.filter(viaggio => {
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchSearch =
                viaggio.azienda.toLowerCase().includes(searchLower) ||
                viaggio.luogo.toLowerCase().includes(searchLower) ||
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

    const { error } = await supabase
        .from('viaggi')
        .update({ column: newColumn })
        .eq('id', id);

    if (error) {
        console.error('Errore spostamento:', error);
        showToast('Errore nello spostamento', 'error');
        return;
    }

    await loadViaggi();
    renderKanban();
    updateStats();
    showToast('Viaggio spostato', 'success');
}

function dragOverPostIt(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== ev.currentTarget) {
        ev.currentTarget.classList.add('drag-over-item');
    }
}

function dragLeavePostIt(ev) {
    ev.currentTarget.classList.remove('drag-over-item');
}

async function dropOnPostIt(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.currentTarget.classList.remove('drag-over-item');

    const draggedId = ev.dataTransfer.getData('text/plain');
    const targetId = ev.currentTarget.dataset.id;
    if (draggedId === targetId) return;

    const targetViaggio = viaggi.find(v => v.id === targetId);
    if (!targetViaggio) return;

    const { error } = await supabase
        .from('viaggi')
        .update({ column: targetViaggio.column, order: Date.now() })
        .eq('id', draggedId);

    if (error) {
        console.error('Errore riordino:', error);
        return;
    }

    await loadViaggi();
    renderKanban();
}

// ==========================================
// STATISTICS
// ==========================================

function updateStats() {
    const total = viaggi.length;
    const richieste = viaggi.filter(v => v.column === 'richieste').length;
    const pianificati = viaggi.filter(v => v.column === 'pianificato').length;
    const inCorso = viaggi.filter(v => v.column === 'in-corso').length;
    const completati = viaggi.filter(v => v.column === 'completato').length;
    const urgenze = viaggi.filter(v => v.urgente || v.column === 'urgenze').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statRichieste').textContent = richieste;
    document.getElementById('statPianificati').textContent = pianificati;
    document.getElementById('statInCorso').textContent = inCorso;
    document.getElementById('statCompletati').textContent = completati;
    document.getElementById('statUrgenze').textContent = urgenze;
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
// POST-IT FORM MODAL
// ==========================================

function openPostItForm() {
    document.getElementById('postItModal').classList.add('show');
    document.getElementById('postItForm').reset();
    document.getElementById('postItId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuovo Viaggio';
}

function closePostItForm() {
    document.getElementById('postItModal').classList.remove('show');
}

function toggleUrgentStyle() {
    // Visual feedback for urgent toggle
}

async function savePostIt(event) {
    event.preventDefault();

    const id = document.getElementById('postItId').value;

    const viaggioData = {
        urgente: document.getElementById('urgente').checked,
        azienda: document.getElementById('azienda').value.trim(),
        luogo: document.getElementById('luogo').value.trim(),
        data: document.getElementById('data').value,
        orario: document.getElementById('orario').value,
        circuito: document.getElementById('circuito').value,
        merce: document.getElementById('merce').value.trim(),
        peso: parseFloat(document.getElementById('peso').value) || 0,
        volume: parseInt(document.getElementById('volume').value) || 0,
        motivo: document.querySelector('input[name="motivo"]:checked').value,
        note: document.getElementById('note').value.trim()
    };

    if (id) {
        const { error } = await supabase.from('viaggi').update(viaggioData).eq('id', id);
        if (error) {
            showToast('Errore modifica', 'error');
            return;
        }
        showToast('Viaggio aggiornato', 'success');
    } else {
        const newViaggio = {
            ...viaggioData,
            column: 'richieste',
            order: Date.now(),
            created_by_username: 'Utente',
            status: 'pending'
        };
        const { error } = await supabase.from('viaggi').insert([newViaggio]);
        if (error) {
            showToast('Errore creazione', 'error');
            return;
        }
        showToast('Viaggio creato', 'success');
    }

    await loadViaggi();
    renderKanban();
    updateStats();
    closePostItForm();
}

function editViaggio(id) {
    const viaggio = viaggi.find(v => v.id === id);
    if (!viaggio) return;

    document.getElementById('postItId').value = viaggio.id;
    document.getElementById('urgente').checked = viaggio.urgente;
    document.getElementById('azienda').value = viaggio.azienda;
    document.getElementById('luogo').value = viaggio.luogo;
    document.getElementById('data').value = viaggio.data || '';
    document.getElementById('orario').value = viaggio.orario;
    document.getElementById('circuito').value = viaggio.circuito;
    document.getElementById('merce').value = viaggio.merce || '';
    document.getElementById('peso').value = viaggio.peso || '';
    document.getElementById('volume').value = viaggio.volume || '';
    document.querySelector(`input[name="motivo"][value="${viaggio.motivo}"]`).checked = true;
    document.getElementById('note').value = viaggio.note || '';

    document.getElementById('modalTitle').textContent = 'Modifica Viaggio';
    document.getElementById('postItModal').classList.add('show');
}

async function deleteViaggio(id) {
    if (!confirm('Eliminare questo viaggio?')) return;

    const { error } = await supabase.from('viaggi').delete().eq('id', id);
    if (error) {
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
    const pianificati = document.getElementById('col-pianificato');
    if (!pianificati || pianificati.children.length === 0) {
        showToast('Nessun viaggio pianificato', 'warning');
        return;
    }

    const addresses = [];
    pianificati.querySelectorAll('.post-it-compact').forEach(el => {
        const viaggio = viaggi.find(v => v.id === el.dataset.id);
        if (viaggio?.luogo) addresses.push(viaggio.luogo);
    });

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
    const aziende = [...new Set(viaggi.map(v => v.azienda))];
    const luoghi = [...new Set(viaggi.map(v => v.luogo))];

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
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Close modal on ESC or click outside
window.onclick = function(e) {
    const modal = document.getElementById('postItModal');
    if (e.target === modal) closePostItForm();
};

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePostItForm();
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openPostItForm();
    }
});

// Global exports
window.openPostItForm = openPostItForm;
window.closePostItForm = closePostItForm;
window.toggleUrgentStyle = toggleUrgentStyle;
window.savePostIt = savePostIt;
window.editViaggio = editViaggio;
window.deleteViaggio = deleteViaggio;
window.allowDrop = allowDrop;
window.drop = drop;
window.exportToGoogleMaps = exportToGoogleMaps;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;

console.log('RBS Logistica Smart (No Auth) - Caricato');
