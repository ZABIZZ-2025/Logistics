// ==========================================
// RBS LOGISTICA SMART - APP LOGIC
// ==========================================

// Global State
let viaggi = [];
let currentFilters = {
    search: '',
    circuit: '',
    urgentOnly: false
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderKanban();
    updateStats();
    populateAutocomplete();
    console.log('✅ RBS Logistica Smart inizializzata');
});

// ==========================================
// DATA MANAGEMENT
// ==========================================

function loadData() {
    const stored = localStorage.getItem('rbs_viaggi');
    if (stored) {
        try {
            viaggi = JSON.parse(stored);
            console.log(`📦 Caricati ${viaggi.length} viaggi dal localStorage`);
        } catch (e) {
            console.error('Errore nel caricamento dati:', e);
            viaggi = [];
        }
    } else {
        // Dati di esempio per la demo
        viaggi = createSampleData();
        saveData();
    }
}

function saveData() {
    try {
        localStorage.setItem('rbs_viaggi', JSON.stringify(viaggi));
        console.log('💾 Dati salvati');
    } catch (e) {
        console.error('Errore nel salvataggio:', e);
        showToast('Errore nel salvataggio dei dati', 'error');
    }
}

function createSampleData() {
    return [
        {
            id: generateId(),
            urgente: false,
            azienda: 'CLIENTE BETA',
            luogo: 'Milano, zona centro',
            orario: '09:30',
            circuito: 'nord-est',
            merce: 'Capi abbigliamento lusso collezione primavera',
            peso: 12,
            volume: 2,
            motivo: 'consegna',
            note: '',
            column: 'pianificato',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            urgente: true,
            azienda: 'CLIENTE VIP LUXURY',
            luogo: 'Torino',
            orario: '14:00',
            circuito: 'nord-ovest',
            merce: 'Collezione speciale edizione limitata',
            peso: 8,
            volume: 1,
            motivo: 'consegna',
            note: 'Consegna urgente entro le 14:00',
            column: 'urgenze',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            urgente: false,
            azienda: 'FORNITORE TINTORIA',
            luogo: 'Alessandria',
            orario: '10:00',
            circuito: 'sud',
            merce: 'Ritiro tessuti tinti',
            peso: 35,
            volume: 4,
            motivo: 'ritiro',
            note: '',
            column: 'in-corso',
            createdAt: new Date().toISOString()
        }
    ];
}

function generateId() {
    return 'VIA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// KANBAN RENDERING
// ==========================================

function renderKanban() {
    const columns = ['pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

    // Clear all columns
    columns.forEach(col => {
        const container = document.getElementById(`col-${col}`);
        if (container) {
            container.innerHTML = '';
        }
    });

    // Filter viaggi
    const filteredViaggi = applyFiltersToData();

    // Render each viaggio
    filteredViaggi.forEach(viaggio => {
        const postItElement = createPostItElement(viaggio);
        const container = document.getElementById(`col-${viaggio.column}`);
        if (container) {
            container.appendChild(postItElement);
        }
    });

    // Update counts
    updateColumnCounts();
}

function applyFiltersToData() {
    return viaggi.filter(viaggio => {
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchSearch =
                viaggio.azienda.toLowerCase().includes(searchLower) ||
                viaggio.luogo.toLowerCase().includes(searchLower) ||
                viaggio.merce.toLowerCase().includes(searchLower);
            if (!matchSearch) return false;
        }

        // Circuit filter
        if (currentFilters.circuit && viaggio.circuito !== currentFilters.circuit) {
            return false;
        }

        // Urgent filter
        if (currentFilters.urgentOnly && !viaggio.urgente) {
            return false;
        }

        return true;
    });
}

function createPostItElement(viaggio) {
    const div = document.createElement('div');
    div.className = `post-it ${viaggio.urgente ? 'urgente' : ''} ${viaggio.circuito === 'corriere' ? 'corriere' : ''}`;
    div.draggable = true;
    div.dataset.id = viaggio.id;
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', dragEnd);

    const circuitoIcon = {
        'nord-est': '🗺️ Nord-Est',
        'nord-ovest': '🗺️ Nord-Ovest',
        'sud': '🗺️ Sud',
        'corriere': '📦 Corriere'
    };

    const motivoIcon = {
        'ritiro': '📥 Ritiro',
        'consegna': '📤 Consegna',
        'entrambi': '🔄 Ritiro+Consegna'
    };

    div.innerHTML = `
        <div class="post-it-header">
            ${viaggio.urgente ? '<div class="post-it-urgente-badge">⚠️ URGENTE</div>' : '<div></div>'}
            <div class="post-it-actions">
                <button class="action-btn" onclick="editViaggio('${viaggio.id}')" title="Modifica">✏️</button>
                <button class="action-btn" onclick="deleteViaggio('${viaggio.id}')" title="Elimina">🗑️</button>
            </div>
        </div>
        <div class="post-it-body">
            <div class="post-it-azienda">${escapeHtml(viaggio.azienda)}</div>

            <div class="post-it-field">
                <span class="post-it-label">📍 Luogo</span>
                <span class="post-it-value">${escapeHtml(viaggio.luogo)}</span>
            </div>

            <div class="post-it-field">
                <span class="post-it-label">⏰ Orario</span>
                <span class="post-it-value">${viaggio.orario}</span>
            </div>

            <div class="post-it-field">
                <span class="post-it-label">📦 Merce</span>
                <span class="post-it-value">${escapeHtml(viaggio.merce)}</span>
            </div>

            <div class="post-it-field">
                <span class="post-it-label">⚖️ Peso/Volume</span>
                <span class="post-it-value">${viaggio.volume || 0} pacchi / ${viaggio.peso || 0} kg</span>
            </div>

            <div class="post-it-field">
                <span class="post-it-label">🎯 Motivo</span>
                <span class="post-it-value">${motivoIcon[viaggio.motivo]}</span>
            </div>

            ${viaggio.note ? `
            <div class="post-it-field">
                <span class="post-it-label">📝 Note</span>
                <span class="post-it-value">${escapeHtml(viaggio.note)}</span>
            </div>
            ` : ''}

            <span class="post-it-circuito">${circuitoIcon[viaggio.circuito]}</span>
        </div>
    `;

    return div;
}

function updateColumnCounts() {
    const columns = ['pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

    columns.forEach(col => {
        const container = document.getElementById(`col-${col}`);
        const countElement = document.getElementById(`count-${col}`);
        if (container && countElement) {
            const count = container.children.length;
            countElement.textContent = count;
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
    document.querySelectorAll('.column-content').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function drop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');

    const id = ev.dataTransfer.getData('text/plain');
    const newColumn = ev.currentTarget.id.replace('col-', '');

    // Update viaggio column
    const viaggio = viaggi.find(v => v.id === id);
    if (viaggio) {
        viaggio.column = newColumn;
        saveData();
        renderKanban();
        updateStats();

        const columnNames = {
            'pianificato': 'PIANIFICATO',
            'in-corso': 'IN CORSO',
            'corriere': 'CORRIERE ESTERNO',
            'urgenze': 'URGENZE',
            'rimanda': 'RIMANDA DOMANI',
            'completato': 'COMPLETATO'
        };

        showToast(`Viaggio spostato in ${columnNames[newColumn]}`, 'success');
    }
}

// ==========================================
// POST-IT FORM MODAL
// ==========================================

function openPostItForm() {
    document.getElementById('postItModal').classList.add('show');
    document.getElementById('postItForm').reset();
    document.getElementById('postItId').value = '';
    document.getElementById('modalTitle').textContent = '📝 Nuovo Viaggio - Post-it Virtuale';
}

function closePostItForm() {
    document.getElementById('postItModal').classList.remove('show');
}

function toggleUrgentStyle() {
    const urgente = document.getElementById('urgente').checked;
    const modal = document.getElementById('postItModal');
    if (urgente) {
        modal.style.border = '3px solid var(--danger-color)';
    } else {
        modal.style.border = 'none';
    }
}

function savePostIt(event) {
    event.preventDefault();

    const form = document.getElementById('postItForm');
    const id = document.getElementById('postItId').value;

    const viaggioData = {
        urgente: document.getElementById('urgente').checked,
        azienda: document.getElementById('azienda').value.trim(),
        luogo: document.getElementById('luogo').value.trim(),
        orario: document.getElementById('orario').value,
        circuito: document.getElementById('circuito').value,
        merce: document.getElementById('merce').value.trim(),
        peso: parseFloat(document.getElementById('peso').value) || 0,
        volume: parseInt(document.getElementById('volume').value) || 0,
        motivo: document.querySelector('input[name="motivo"]:checked').value,
        note: document.getElementById('note').value.trim()
    };

    if (id) {
        // Edit existing
        const viaggio = viaggi.find(v => v.id === id);
        if (viaggio) {
            Object.assign(viaggio, viaggioData);
            showToast('Viaggio aggiornato con successo', 'success');
        }
    } else {
        // Create new
        const newViaggio = {
            id: generateId(),
            ...viaggioData,
            column: viaggioData.urgente ? 'urgenze' : 'pianificato',
            createdAt: new Date().toISOString()
        };
        viaggi.unshift(newViaggio);
        showToast('Nuovo viaggio creato', 'success');
    }

    saveData();
    renderKanban();
    updateStats();
    populateAutocomplete();
    closePostItForm();
}

function editViaggio(id) {
    const viaggio = viaggi.find(v => v.id === id);
    if (!viaggio) return;

    document.getElementById('postItId').value = viaggio.id;
    document.getElementById('urgente').checked = viaggio.urgente;
    document.getElementById('azienda').value = viaggio.azienda;
    document.getElementById('luogo').value = viaggio.luogo;
    document.getElementById('orario').value = viaggio.orario;
    document.getElementById('circuito').value = viaggio.circuito;
    document.getElementById('merce').value = viaggio.merce;
    document.getElementById('peso').value = viaggio.peso || '';
    document.getElementById('volume').value = viaggio.volume || '';
    document.querySelector(`input[name="motivo"][value="${viaggio.motivo}"]`).checked = true;
    document.getElementById('note').value = viaggio.note || '';

    document.getElementById('modalTitle').textContent = '✏️ Modifica Viaggio';
    document.getElementById('postItModal').classList.add('show');
}

function deleteViaggio(id) {
    if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;

    viaggi = viaggi.filter(v => v.id !== id);
    saveData();
    renderKanban();
    updateStats();
    showToast('Viaggio eliminato', 'success');
}

// ==========================================
// STATISTICS
// ==========================================

function updateStats() {
    const total = viaggi.length;
    const pianificati = viaggi.filter(v => v.column === 'pianificato').length;
    const inCorso = viaggi.filter(v => v.column === 'in-corso').length;
    const completati = viaggi.filter(v => v.column === 'completato').length;
    const urgenze = viaggi.filter(v => v.urgente || v.column === 'urgenze').length;

    document.getElementById('statTotal').textContent = total;
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
    updateStats();
}

function clearFilters() {
    document.getElementById('searchFilter').value = '';
    document.getElementById('circuitFilter').value = '';
    document.getElementById('urgentFilter').checked = false;

    currentFilters = {
        search: '',
        circuit: '',
        urgentOnly: false
    };

    renderKanban();
    updateStats();
    showToast('Filtri rimossi', 'success');
}

// ==========================================
// AUTOCOMPLETE
// ==========================================

function populateAutocomplete() {
    const aziende = [...new Set(viaggi.map(v => v.azienda))];
    const luoghi = [...new Set(viaggi.map(v => v.luogo))];

    const aziendaList = document.getElementById('aziendaList');
    const luogoList = document.getElementById('luogoList');

    aziendaList.innerHTML = aziende.map(a => `<option value="${escapeHtml(a)}">`).join('');
    luogoList.innerHTML = luoghi.map(l => `<option value="${escapeHtml(l)}">`).join('');
}

// ==========================================
// EXPORT / IMPORT
// ==========================================

function exportData() {
    const dataStr = JSON.stringify(viaggi, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rbs-logistica-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast('Dati esportati con successo', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) {
                    throw new Error('Formato file non valido');
                }

                if (confirm(`Vuoi sostituire i ${viaggi.length} viaggi attuali con ${imported.length} viaggi importati?`)) {
                    viaggi = imported;
                    saveData();
                    renderKanban();
                    updateStats();
                    populateAutocomplete();
                    showToast('Dati importati con successo', 'success');
                }
            } catch (err) {
                console.error('Errore import:', err);
                showToast('Errore nell\'importazione del file', 'error');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// UTILITIES
// ==========================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('postItModal');
    if (event.target === modal) {
        closePostItForm();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closePostItForm();
    }

    // Ctrl/Cmd + N to create new post-it
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openPostItForm();
    }
});

console.log('🚀 RBS Logistica Smart - App caricata con successo');
