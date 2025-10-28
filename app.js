// ==========================================
// RBS LOGISTICA SMART - APP LOGIC WITH AUTH
// ==========================================

// Global State
let viaggi = [];
let currentSession = null;
let currentFilters = {
    search: '',
    circuit: '',
    urgentOnly: false
};
let anagraficaClienti = [];

// ==========================================
// AUTHENTICATION & SESSION
// ==========================================

function checkSession() {
    const sessionJson = localStorage.getItem('rbs_session');
    if (!sessionJson) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return null;
    }

    try {
        currentSession = JSON.parse(sessionJson);
        return currentSession;
    } catch (e) {
        console.error('Errore sessione:', e);
        window.location.href = 'login.html';
        return null;
    }
}

function logout() {
    if (confirm('Vuoi uscire dall\'applicazione?')) {
        localStorage.removeItem('rbs_session');
        window.location.href = 'login.html';
    }
}

function isAdmin() {
    return currentSession && currentSession.role === 'admin';
}

function isUser() {
    return currentSession && currentSession.role === 'user';
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const session = checkSession();
    if (!session) return;

    console.log(`👤 Benvenuto ${session.name} (${session.role})`);

    // Initialize UI based on role
    initializeUI();
    loadData();
    loadAnagraficaClienti();

    if (isAdmin()) {
        renderKanban();
        updateStats();
    } else {
        renderUserInterface();
    }

    populateAutocomplete();
    populateAnagraficaAutocomplete();
    console.log('✅ RBS Logistica Smart inizializzata');
});

function initializeUI() {
    // Update user info in header
    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl) {
        userInfoEl.innerHTML = `
            <span class="user-role-badge ${currentSession.role}">${currentSession.role === 'admin' ? '👑 Admin' : '👤 Utente'}</span>
            <span class="user-name">${escapeHtml(currentSession.name)}</span>
            <button class="btn btn-secondary btn-sm" onclick="logout()">🚪 Esci</button>
        `;
    }

    // Hide/show elements based on role
    if (isUser()) {
        // Hide kanban, top bar, and admin buttons for users
        const kanbanContainer = document.querySelector('.kanban-container');
        const topBar = document.querySelector('.top-bar-sticky');
        const sidebar = document.querySelector('.sidebar');
        const exportBtn = document.querySelector('[onclick="exportData()"]');
        const importBtn = document.querySelector('[onclick="importData()"]');
        const newViaggioBtn = document.querySelector('[onclick="openPostItForm()"]');

        if (kanbanContainer) kanbanContainer.style.display = 'none';
        if (topBar) topBar.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';
        if (newViaggioBtn) newViaggioBtn.style.display = 'none';

        // Create user interface
        createUserInterface();
    } else {
        // Admin - show user management and anagrafica buttons
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const anagraficaBtn = document.createElement('button');
            anagraficaBtn.className = 'btn btn-secondary';
            anagraficaBtn.innerHTML = '<span class="icon">📋</span> Anagrafica Clienti';
            anagraficaBtn.onclick = openAnagraficaManager;
            headerActions.insertBefore(anagraficaBtn, headerActions.firstChild);

            const userMgmtBtn = document.createElement('button');
            userMgmtBtn.className = 'btn btn-secondary';
            userMgmtBtn.innerHTML = '<span class="icon">👥</span> Gestisci Utenti';
            userMgmtBtn.onclick = openUserManagement;
            headerActions.insertBefore(userMgmtBtn, headerActions.firstChild);
        }
    }
}

function createUserInterface() {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = `
        <div class="user-container">
            <div class="user-welcome-card">
                <h2>👋 Benvenuto, ${escapeHtml(currentSession.name)}!</h2>
                <p>Utilizza il form qui sotto per creare una nuova richiesta di viaggio.</p>
                <p>Le tue richieste verranno inviate agli amministratori per l'approvazione.</p>
            </div>

            <div class="user-form-card">
                <h3>📝 Nuova Richiesta Viaggio</h3>
                <form id="userPostItForm" onsubmit="saveUserPostIt(event)">
                    <div class="form-grid">
                        <!-- Campo URGENTE -->
                        <div class="form-group full-width">
                            <label class="checkbox-label">
                                <input type="checkbox" id="userUrgente">
                                <span class="checkbox-custom">⚠️ URGENTE</span>
                            </label>
                        </div>

                        <!-- Campo AZIENDA -->
                        <div class="form-group">
                            <label for="userAzienda">Azienda/Cliente *</label>
                            <input type="text" id="userAzienda" required placeholder="es. CLIENTE BETA" list="aziendaList">
                            <datalist id="aziendaList"></datalist>
                        </div>

                        <!-- Campo LUOGO -->
                        <div class="form-group">
                            <label for="userLuogo">Luogo Destinazione *</label>
                            <input type="text" id="userLuogo" required placeholder="es. Milano, zona centro" list="luogoList">
                            <datalist id="luogoList"></datalist>
                        </div>

                        <!-- Campo DATA -->
                        <div class="form-group">
                            <label for="userData">Data Richiesta *</label>
                            <input type="date" id="userData" required>
                        </div>

                        <!-- Campo ORARIO -->
                        <div class="form-group">
                            <label for="userOrario">Orario Richiesto *</label>
                            <input type="time" id="userOrario" required>
                        </div>

                        <!-- Campo CIRCUITO -->
                        <div class="form-group">
                            <label for="userCircuito">Circuito Geografico *</label>
                            <select id="userCircuito" required>
                                <option value="">Seleziona circuito</option>
                                <option value="nord-est">🗺️ Nord-Est</option>
                                <option value="nord-ovest">🗺️ Nord-Ovest</option>
                                <option value="sud">🗺️ Sud</option>
                                <option value="corriere">📦 Corriere Esterno</option>
                            </select>
                        </div>

                        <!-- Campo MERCE -->
                        <div class="form-group full-width">
                            <label for="userMerce">Descrizione Merce *</label>
                            <textarea id="userMerce" required placeholder="es. Capi abbigliamento lusso" rows="2"></textarea>
                        </div>

                        <!-- Campo PESO -->
                        <div class="form-group">
                            <label for="userPeso">Peso (kg)</label>
                            <input type="number" id="userPeso" placeholder="es. 15" min="0" step="0.1">
                        </div>

                        <!-- Campo VOLUME -->
                        <div class="form-group">
                            <label for="userVolume">Numero Pacchi</label>
                            <input type="number" id="userVolume" placeholder="es. 3" min="0" step="1">
                        </div>

                        <!-- Campo MOTIVO -->
                        <div class="form-group full-width">
                            <label>Motivo Viaggio *</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="userMotivo" value="ritiro" required>
                                    <span>📥 Ritiro</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="userMotivo" value="consegna" required>
                                    <span>📤 Consegna</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="userMotivo" value="entrambi" required>
                                    <span>🔄 Ritiro + Consegna</span>
                                </label>
                            </div>
                        </div>

                        <!-- Note -->
                        <div class="form-group full-width">
                            <label for="userNote">Note Aggiuntive (opzionale)</label>
                            <textarea id="userNote" placeholder="Eventuali note aggiuntive..." rows="2"></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="reset" class="btn btn-secondary">Pulisci Form</button>
                        <button type="submit" class="btn btn-primary">📤 Invia Richiesta</button>
                    </div>
                </form>
            </div>

            <div class="user-requests-card">
                <h3>📋 Le Tue Richieste Recenti</h3>
                <div id="userRequestsList"></div>
            </div>
        </div>
    `;

    // Show user's requests
    renderUserRequests();

    // Setup autofill from anagrafica
    setTimeout(() => setupAnagraficaAutofill(), 100);
}

function renderUserInterface() {
    // This is called when user logs in
    renderUserRequests();
}

function renderUserRequests() {
    const listEl = document.getElementById('userRequestsList');
    if (!listEl) return;

    // Get user's viaggi
    const userViaggi = viaggi.filter(v =>
        v.createdBy === currentSession.userId ||
        v.column === 'richieste'
    ).slice(0, 10); // Last 10

    if (userViaggi.length === 0) {
        listEl.innerHTML = '<p class="empty-message">Nessuna richiesta ancora. Crea la tua prima richiesta!</p>';
        return;
    }

    listEl.innerHTML = userViaggi.map(v => {
        const statusBadge = {
            'richieste': '<span class="status-badge pending">⏳ In Attesa</span>',
            'pianificato': '<span class="status-badge approved">✅ Approvata</span>',
            'in-corso': '<span class="status-badge in-progress">🚚 In Corso</span>',
            'completato': '<span class="status-badge completed">✅ Completata</span>',
            'urgenze': '<span class="status-badge urgent">⚠️ Urgente</span>'
        };

        return `
            <div class="user-request-item">
                <div class="user-request-header">
                    <strong>${escapeHtml(v.azienda)}</strong>
                    ${statusBadge[v.column] || ''}
                </div>
                <div class="user-request-details">
                    📍 ${escapeHtml(v.luogo)} | ⏰ ${v.orario}
                </div>
                <div class="user-request-date">
                    Creata il: ${new Date(v.createdAt).toLocaleString('it-IT')}
                </div>
            </div>
        `;
    }).join('');
}

function saveUserPostIt(event) {
    event.preventDefault();

    const viaggioData = {
        urgente: document.getElementById('userUrgente').checked,
        azienda: document.getElementById('userAzienda').value.trim(),
        luogo: document.getElementById('userLuogo').value.trim(),
        data: document.getElementById('userData').value,
        orario: document.getElementById('userOrario').value,
        circuito: document.getElementById('userCircuito').value,
        merce: document.getElementById('userMerce').value.trim(),
        peso: parseFloat(document.getElementById('userPeso').value) || 0,
        volume: parseInt(document.getElementById('userVolume').value) || 0,
        motivo: document.querySelector('input[name="userMotivo"]:checked').value,
        note: document.getElementById('userNote').value.trim()
    };

    // Create new viaggio
    const newViaggio = {
        id: generateId(),
        ...viaggioData,
        column: 'richieste', // Goes to pending approval
        createdBy: currentSession.userId,
        createdByName: currentSession.name,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    viaggi.unshift(newViaggio);
    saveData();
    populateAutocomplete();

    // Reset form
    document.getElementById('userPostItForm').reset();

    // Update user requests list
    renderUserRequests();

    showToast('✅ Richiesta inviata con successo! Sarà approvata dagli amministratori.', 'success');
}

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
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    return [
        {
            id: generateId(),
            urgente: false,
            azienda: 'CLIENTE BETA',
            luogo: 'Milano, zona centro',
            data: today,
            orario: '09:30',
            circuito: 'nord-est',
            merce: 'Capi abbigliamento lusso',
            peso: 12,
            volume: 2,
            motivo: 'consegna',
            note: '',
            column: 'pianificato',
            createdAt: new Date().toISOString(),
            createdBy: 'admin1'
        },
        {
            id: generateId(),
            urgente: true,
            azienda: 'CLIENTE VIP',
            luogo: 'Torino',
            data: today,
            orario: '14:00',
            circuito: 'nord-ovest',
            merce: 'Collezione speciale',
            peso: 8,
            volume: 1,
            motivo: 'consegna',
            note: 'Urgente',
            column: 'urgenze',
            createdAt: new Date().toISOString(),
            createdBy: 'admin1'
        },
        {
            id: generateId(),
            urgente: false,
            azienda: 'FORNITORE TINTORIA',
            luogo: 'Alessandria',
            data: tomorrow,
            orario: '10:00',
            circuito: 'sud',
            merce: 'Tessuti tinti',
            peso: 35,
            volume: 4,
            motivo: 'ritiro',
            note: '',
            column: 'richieste',
            createdAt: new Date().toISOString(),
            createdBy: 'user1',
            createdByName: 'Utente Standard',
            status: 'pending'
        }
    ];
}

function generateId() {
    return 'VIA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// ANAGRAFICA CLIENTI
// ==========================================

function loadAnagraficaClienti() {
    const stored = localStorage.getItem('rbs_anagrafica');
    if (stored) {
        try {
            anagraficaClienti = JSON.parse(stored);
            console.log(`📋 Caricate ${anagraficaClienti.length} anagrafiche clienti`);
        } catch (e) {
            console.error('Errore nel caricamento anagrafica:', e);
            anagraficaClienti = [];
        }
    } else {
        // Dati di esempio per la demo
        anagraficaClienti = createSampleAnagrafica();
        saveAnagraficaClienti();
    }
}

function saveAnagraficaClienti() {
    try {
        localStorage.setItem('rbs_anagrafica', JSON.stringify(anagraficaClienti));
        console.log('💾 Anagrafica clienti salvata');
    } catch (e) {
        console.error('Errore nel salvataggio anagrafica:', e);
        showToast('Errore nel salvataggio anagrafica', 'error');
    }
}

function createSampleAnagrafica() {
    return [
        {
            id: 'ANA-' + Date.now() + '-1',
            azienda: 'CLIENTE BETA',
            luogo: 'Milano, zona centro',
            circuito: 'nord-est'
        },
        {
            id: 'ANA-' + Date.now() + '-2',
            azienda: 'CLIENTE VIP',
            luogo: 'Torino',
            circuito: 'nord-ovest'
        },
        {
            id: 'ANA-' + Date.now() + '-3',
            azienda: 'FORNITORE TINTORIA',
            luogo: 'Alessandria',
            circuito: 'sud'
        }
    ];
}

function addCliente(azienda, luogo, circuito) {
    const newCliente = {
        id: 'ANA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        azienda: azienda.trim(),
        luogo: luogo.trim(),
        circuito: circuito
    };

    anagraficaClienti.push(newCliente);
    saveAnagraficaClienti();
    return newCliente;
}

function updateCliente(id, azienda, luogo, circuito) {
    const cliente = anagraficaClienti.find(c => c.id === id);
    if (cliente) {
        cliente.azienda = azienda.trim();
        cliente.luogo = luogo.trim();
        cliente.circuito = circuito;
        saveAnagraficaClienti();
        return true;
    }
    return false;
}

function deleteCliente(id) {
    const index = anagraficaClienti.findIndex(c => c.id === id);
    if (index !== -1) {
        anagraficaClienti.splice(index, 1);
        saveAnagraficaClienti();
        return true;
    }
    return false;
}

function findClienteByAzienda(azienda) {
    return anagraficaClienti.find(c =>
        c.azienda.toLowerCase() === azienda.toLowerCase()
    );
}

function populateAnagraficaAutocomplete() {
    // Populate autocomplete lists with anagrafica data
    const aziende = anagraficaClienti.map(c => c.azienda);

    const aziendaLists = document.querySelectorAll('#aziendaList');
    aziendaLists.forEach(list => {
        list.innerHTML = aziende.map(a => `<option value="${escapeHtml(a)}">`).join('');
    });
}

function setupAnagraficaAutofill() {
    // Setup autofill for Admin form
    const aziendaInput = document.getElementById('azienda');
    if (aziendaInput) {
        aziendaInput.addEventListener('change', function() {
            autofillFromAnagrafica('azienda', 'luogo', 'circuito');
        });
    }

    // Setup autofill for User form
    const userAziendaInput = document.getElementById('userAzienda');
    if (userAziendaInput) {
        userAziendaInput.addEventListener('change', function() {
            autofillFromAnagrafica('userAzienda', 'userLuogo', 'userCircuito');
        });
    }
}

function autofillFromAnagrafica(aziendaFieldId, luogoFieldId, circuitoFieldId) {
    const aziendaInput = document.getElementById(aziendaFieldId);
    const luogoInput = document.getElementById(luogoFieldId);
    const circuitoInput = document.getElementById(circuitoFieldId);

    if (!aziendaInput || !luogoInput || !circuitoInput) return;

    const azienda = aziendaInput.value.trim();
    if (!azienda) return;

    const cliente = findClienteByAzienda(azienda);
    if (cliente) {
        luogoInput.value = cliente.luogo;
        circuitoInput.value = cliente.circuito;
        showToast('📋 Dati compilati automaticamente dall\'anagrafica', 'success');
    }
}

// ==========================================
// KANBAN RENDERING (ADMIN ONLY)
// ==========================================

function renderKanban() {
    if (!isAdmin()) return;

    const columns = ['richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

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
    div.className = `post-it ${viaggio.urgente ? 'urgente' : ''} ${viaggio.circuito === 'corriere' ? 'corriere' : ''} ${viaggio.column === 'richieste' ? 'pending' : ''}`;
    div.draggable = isAdmin();
    div.dataset.id = viaggio.id;

    if (isAdmin()) {
        div.addEventListener('dragstart', dragStart);
        div.addEventListener('dragend', dragEnd);
    }

    const circuitoIcon = {
        'nord-est': '🗺️ NE',
        'nord-ovest': '🗺️ NO',
        'sud': '🗺️ Sud',
        'corriere': '📦 Corr'
    };

    const motivoIcon = {
        'ritiro': '📥 Ritiro',
        'consegna': '📤 Consegna',
        'entrambi': '🔄 Ritiro+Consegna'
    };

    // Format data (YYYY-MM-DD -> DD/MM/YYYY)
    let dataFormatted = '';
    if (viaggio.data) {
        const dateParts = viaggio.data.split('-');
        if (dateParts.length === 3) {
            dataFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
    }

    // Ultra compact version with merce and motivo visible
    div.innerHTML = `
        <div class="post-it-header">
            ${viaggio.urgente ? '<span class="post-it-urgente-badge">⚠️</span>' : ''}
            ${viaggio.column === 'richieste' ? `<span class="post-it-user-badge">👤 ${escapeHtml(viaggio.createdByName || 'Utente')}</span>` : ''}
            <div class="post-it-actions">
                ${isAdmin() ? `
                    <button class="action-btn" onclick="editViaggio('${viaggio.id}')" title="Modifica">✏️</button>
                    <button class="action-btn" onclick="deleteViaggio('${viaggio.id}')" title="Elimina">🗑️</button>
                ` : ''}
            </div>
        </div>
        <div class="post-it-body">
            <div class="post-it-azienda">${escapeHtml(viaggio.azienda)}</div>
            <div class="post-it-info">
                <span class="post-it-info-item">📍 ${escapeHtml(viaggio.luogo)}</span>
                <span class="post-it-info-item">📅 ${dataFormatted} ⏰ ${viaggio.orario}</span>
                <span class="post-it-info-item">${circuitoIcon[viaggio.circuito]}</span>
            </div>
            <div class="post-it-merce">📦 ${escapeHtml(viaggio.merce)}</div>
            <div class="post-it-motivo">${motivoIcon[viaggio.motivo]} ${viaggio.volume || 0}pz / ${viaggio.peso || 0}kg</div>
            ${viaggio.note ? `<div class="post-it-note">📝 ${escapeHtml(viaggio.note)}</div>` : ''}
        </div>
    `;

    return div;
}

function updateColumnCounts() {
    if (!isAdmin()) return;

    const columns = ['richieste', 'pianificato', 'in-corso', 'corriere', 'urgenze', 'rimanda', 'completato'];

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
// DRAG & DROP (ADMIN ONLY)
// ==========================================

function allowDrop(ev) {
    if (!isAdmin()) return;
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
}

function dragStart(ev) {
    if (!isAdmin()) return;
    ev.dataTransfer.setData('text/plain', ev.target.dataset.id);
    ev.target.classList.add('dragging');
}

function dragEnd(ev) {
    if (!isAdmin()) return;
    ev.target.classList.remove('dragging');
    document.querySelectorAll('.column-content').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function drop(ev) {
    if (!isAdmin()) return;

    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');

    const id = ev.dataTransfer.getData('text/plain');
    const newColumn = ev.currentTarget.id.replace('col-', '');

    // Update viaggio column
    const viaggio = viaggi.find(v => v.id === id);
    if (viaggio) {
        viaggio.column = newColumn;

        // If moving from 'richieste', mark as approved
        if (viaggio.status === 'pending') {
            viaggio.status = 'approved';
            viaggio.approvedBy = currentSession.userId;
            viaggio.approvedAt = new Date().toISOString();
        }

        saveData();
        renderKanban();
        updateStats();

        const columnNames = {
            'richieste': 'RICHIESTE DA APPROVARE',
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
// POST-IT FORM MODAL (ADMIN ONLY)
// ==========================================

function openPostItForm() {
    if (!isAdmin()) return;

    document.getElementById('postItModal').classList.add('show');
    document.getElementById('postItForm').reset();
    document.getElementById('postItId').value = '';
    document.getElementById('modalTitle').textContent = '📝 Nuovo Viaggio - Post-it Virtuale';

    // Setup autofill from anagrafica
    setTimeout(() => setupAnagraficaAutofill(), 100);
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
    if (!isAdmin()) return;

    const form = document.getElementById('postItForm');
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
        // Edit existing
        const viaggio = viaggi.find(v => v.id === id);
        if (viaggio) {
            Object.assign(viaggio, viaggioData);
            showToast('Viaggio aggiornato con successo', 'success');
        }
    } else {
        // Create new - Admin viaggi also go to 'richieste' for approval workflow
        const newViaggio = {
            id: generateId(),
            ...viaggioData,
            column: 'richieste',
            createdAt: new Date().toISOString(),
            createdBy: currentSession.userId,
            createdByName: currentSession.name
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
    if (!isAdmin()) return;

    const viaggio = viaggi.find(v => v.id === id);
    if (!viaggio) return;

    document.getElementById('postItId').value = viaggio.id;
    document.getElementById('urgente').checked = viaggio.urgente;
    document.getElementById('azienda').value = viaggio.azienda;
    document.getElementById('luogo').value = viaggio.luogo;
    document.getElementById('data').value = viaggio.data || '';
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
    if (!isAdmin()) return;

    if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;

    viaggi = viaggi.filter(v => v.id !== id);
    saveData();
    renderKanban();
    updateStats();
    showToast('Viaggio eliminato', 'success');
}

// ==========================================
// STATISTICS (ADMIN ONLY)
// ==========================================

function updateStats() {
    if (!isAdmin()) return;

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
// FILTERS (ADMIN ONLY)
// ==========================================

function applyFilters() {
    if (!isAdmin()) return;

    currentFilters.search = document.getElementById('searchFilter').value.trim();
    currentFilters.circuit = document.getElementById('circuitFilter').value;
    currentFilters.urgentOnly = document.getElementById('urgentFilter').checked;

    renderKanban();
    updateStats();
}

function clearFilters() {
    if (!isAdmin()) return;

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

    if (aziendaList) {
        aziendaList.innerHTML = aziende.map(a => `<option value="${escapeHtml(a)}">`).join('');
    }
    if (luogoList) {
        luogoList.innerHTML = luoghi.map(l => `<option value="${escapeHtml(l)}">`).join('');
    }
}

// ==========================================
// EXPORT / IMPORT (ADMIN ONLY)
// ==========================================

function exportData() {
    if (!isAdmin()) return;

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
    if (!isAdmin()) return;

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
// GOOGLE MAPS EXPORT (ADMIN ONLY)
// ==========================================

function exportToGoogleMaps() {
    if (!isAdmin()) {
        showToast('Solo gli amministratori possono esportare i percorsi', 'error');
        return;
    }

    // Get all viaggi from "pianificato" column in DOM order
    const pianificatiColumn = document.getElementById('col-pianificato');
    if (!pianificatiColumn) {
        showToast('Errore: colonna Pianificato non trovata', 'error');
        return;
    }

    const postIts = pianificatiColumn.querySelectorAll('.post-it');

    if (postIts.length === 0) {
        showToast('Nessun viaggio pianificato da esportare', 'warning');
        return;
    }

    // Extract addresses (luogo) from each post-it in sequence
    const addresses = [];
    postIts.forEach(postIt => {
        const id = postIt.dataset.id;
        const viaggio = viaggi.find(v => v.id === id);
        if (viaggio && viaggio.luogo) {
            addresses.push(viaggio.luogo);
        }
    });

    if (addresses.length === 0) {
        showToast('Nessun indirizzo valido trovato', 'warning');
        return;
    }

    // Build Google Maps URL
    let mapsUrl;
    if (addresses.length === 1) {
        // Single destination
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addresses[0])}&travelmode=driving`;
    } else {
        // Multiple waypoints
        const origin = encodeURIComponent(addresses[0]);
        const destination = encodeURIComponent(addresses[addresses.length - 1]);

        if (addresses.length > 2) {
            // Middle waypoints
            const waypoints = addresses.slice(1, -1).map(addr => encodeURIComponent(addr)).join('|');
            mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
        } else {
            // Just origin and destination
            mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        }
    }

    // Show modal with link
    showMapsLinkModal(mapsUrl, addresses);
}

function showMapsLinkModal(mapsUrl, addresses) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'mapsModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>🗺️ Percorso Google Maps</h2>
                <button class="close-btn" onclick="closeMapsModal()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">📍 Tappe del Percorso:</h3>
                <ol style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
                    ${addresses.map((addr, idx) => `
                        <li style="margin-bottom: 0.5rem;">
                            ${idx === 0 ? '🚩 ' : idx === addresses.length - 1 ? '🏁 ' : '📍 '}
                            <strong>${escapeHtml(addr)}</strong>
                        </li>
                    `).join('')}
                </ol>

                <div style="background: var(--gray-100); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Link Google Maps:</label>
                    <input type="text" id="mapsUrlInput" readonly value="${escapeHtml(mapsUrl)}"
                           style="width: 100%; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: 4px; font-size: 0.9rem;">
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary" onclick="copyMapsLink()">
                        📋 Copia Link
                    </button>
                    <button class="btn btn-success" onclick="openMapsLink()">
                        🗺️ Apri in Google Maps
                    </button>
                    <button class="btn btn-secondary" onclick="closeMapsModal()">
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeMapsModal() {
    const modal = document.getElementById('mapsModal');
    if (modal) modal.remove();
}

function copyMapsLink() {
    const input = document.getElementById('mapsUrlInput');
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        showToast('✅ Link copiato negli appunti!', 'success');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('✅ Link copiato negli appunti!', 'success');
        }).catch(() => {
            showToast('Errore nella copia del link', 'error');
        });
    }
}

function openMapsLink() {
    const input = document.getElementById('mapsUrlInput');
    if (!input) return;

    window.open(input.value, '_blank');
    showToast('Apertura Google Maps...', 'success');
}

// ==========================================
// USER MANAGEMENT (ADMIN ONLY)
// ==========================================

function openUserManagement() {
    if (!isAdmin()) return;

    const usersJson = localStorage.getItem('rbs_users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'userMgmtModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>👥 Gestione Utenti</h2>
                <button class="close-btn" onclick="closeUserManagement()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Nome</th>
                            <th>Ruolo</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td>${escapeHtml(u.username)}</td>
                                <td>${escapeHtml(u.name)}</td>
                                <td><span class="user-role-badge ${u.role}">${u.role === 'admin' ? '👑 Admin' : '👤 Utente'}</span></td>
                                <td>
                                    ${u.id !== currentSession.userId ? `
                                        <button class="btn btn-sm btn-secondary" onclick="editUser('${u.id}')">✏️ Modifica</button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">🗑️ Elimina</button>
                                    ` : '<em>Utente corrente</em>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-primary" onclick="addNewUser()" style="margin-top: 1rem;">➕ Aggiungi Utente</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeUserManagement() {
    const modal = document.getElementById('userMgmtModal');
    if (modal) modal.remove();
}

function addNewUser() {
    const username = prompt('Inserisci username:');
    if (!username) return;

    const password = prompt('Inserisci password:');
    if (!password) return;

    const name = prompt('Inserisci nome completo:');
    if (!name) return;

    const role = confirm('Utente amministratore? (Annulla per utente standard)') ? 'admin' : 'user';

    const usersJson = localStorage.getItem('rbs_users');
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Check if username exists
    if (users.find(u => u.username === username)) {
        alert('Username già esistente!');
        return;
    }

    const newUser = {
        id: 'user-' + Date.now(),
        username,
        password,
        name,
        role
    };

    users.push(newUser);
    localStorage.setItem('rbs_users', JSON.stringify(users));

    showToast('Utente creato con successo', 'success');
    closeUserManagement();
    openUserManagement(); // Refresh
}

function deleteUser(userId) {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

    const usersJson = localStorage.getItem('rbs_users');
    let users = usersJson ? JSON.parse(usersJson) : [];

    users = users.filter(u => u.id !== userId);
    localStorage.setItem('rbs_users', JSON.stringify(users));

    showToast('Utente eliminato', 'success');
    closeUserManagement();
    openUserManagement(); // Refresh
}

// ==========================================
// ANAGRAFICA MANAGEMENT
// ==========================================

function openAnagraficaManager() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'anagraficaModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h2>📋 Gestione Anagrafica Clienti</h2>
                <button class="close-btn" onclick="closeAnagraficaManager()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <p style="margin-bottom: 1rem; color: var(--gray-600);">
                    Gestisci l'anagrafica dei clienti per auto-compilare i campi durante la creazione dei viaggi.
                </p>

                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Azienda/Cliente</th>
                            <th>Luogo Destinazione</th>
                            <th>Circuito Geografico</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="anagraficaTableBody">
                        ${renderAnagraficaTable()}
                    </tbody>
                </table>

                <button class="btn btn-primary" onclick="showAddClienteForm()" style="margin-top: 1rem;">
                    ➕ Aggiungi Cliente
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function renderAnagraficaTable() {
    if (anagraficaClienti.length === 0) {
        return '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--gray-500);">Nessun cliente in anagrafica. Aggiungi il primo cliente!</td></tr>';
    }

    return anagraficaClienti.map(c => `
        <tr>
            <td><strong>${escapeHtml(c.azienda)}</strong></td>
            <td>${escapeHtml(c.luogo)}</td>
            <td>
                ${c.circuito === 'nord-est' ? '🗺️ Nord-Est' :
                  c.circuito === 'nord-ovest' ? '🗺️ Nord-Ovest' :
                  c.circuito === 'sud' ? '🗺️ Sud' :
                  '📦 Corriere Esterno'}
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editClienteInAnagrafica('${c.id}')">✏️ Modifica</button>
                <button class="btn btn-sm btn-danger" onclick="deleteClienteFromAnagrafica('${c.id}')">🗑️ Elimina</button>
            </td>
        </tr>
    `).join('');
}

function refreshAnagraficaTable() {
    const tbody = document.getElementById('anagraficaTableBody');
    if (tbody) {
        tbody.innerHTML = renderAnagraficaTable();
    }
}

function closeAnagraficaManager() {
    const modal = document.getElementById('anagraficaModal');
    if (modal) modal.remove();
}

function showAddClienteForm() {
    const azienda = prompt('Inserisci nome Azienda/Cliente:');
    if (!azienda) return;

    const luogo = prompt('Inserisci luogo di destinazione:');
    if (!luogo) return;

    const circuitoMsg = 'Seleziona circuito geografico:\n1 = Nord-Est\n2 = Nord-Ovest\n3 = Sud\n4 = Corriere Esterno';
    const circuitoChoice = prompt(circuitoMsg);

    const circuitoMap = {
        '1': 'nord-est',
        '2': 'nord-ovest',
        '3': 'sud',
        '4': 'corriere'
    };

    const circuito = circuitoMap[circuitoChoice];
    if (!circuito) {
        alert('Scelta non valida!');
        return;
    }

    // Check if cliente already exists
    if (findClienteByAzienda(azienda)) {
        alert('Cliente già presente in anagrafica!');
        return;
    }

    addCliente(azienda, luogo, circuito);
    populateAnagraficaAutocomplete();
    refreshAnagraficaTable();
    showToast('✅ Cliente aggiunto all\'anagrafica', 'success');
}

function editClienteInAnagrafica(id) {
    const cliente = anagraficaClienti.find(c => c.id === id);
    if (!cliente) return;

    const azienda = prompt('Modifica nome Azienda/Cliente:', cliente.azienda);
    if (!azienda) return;

    const luogo = prompt('Modifica luogo di destinazione:', cliente.luogo);
    if (!luogo) return;

    const circuitoMsg = `Seleziona circuito geografico:\n1 = Nord-Est\n2 = Nord-Ovest\n3 = Sud\n4 = Corriere Esterno\n\nAttuale: ${cliente.circuito}`;
    const circuitoChoice = prompt(circuitoMsg);

    const circuitoMap = {
        '1': 'nord-est',
        '2': 'nord-ovest',
        '3': 'sud',
        '4': 'corriere'
    };

    const circuito = circuitoMap[circuitoChoice];
    if (!circuito) {
        alert('Scelta non valida!');
        return;
    }

    updateCliente(id, azienda, luogo, circuito);
    populateAnagraficaAutocomplete();
    refreshAnagraficaTable();
    showToast('✅ Cliente modificato', 'success');
}

function deleteClienteFromAnagrafica(id) {
    const cliente = anagraficaClienti.find(c => c.id === id);
    if (!cliente) return;

    if (!confirm(`Sei sicuro di voler eliminare "${cliente.azienda}" dall'anagrafica?`)) return;

    deleteCliente(id);
    populateAnagraficaAutocomplete();
    refreshAnagraficaTable();
    showToast('Cliente eliminato dall\'anagrafica', 'success');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

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
    if (!text) return '';
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

    const userMgmtModal = document.getElementById('userMgmtModal');
    if (event.target === userMgmtModal) {
        closeUserManagement();
    }

    const mapsModal = document.getElementById('mapsModal');
    if (event.target === mapsModal) {
        closeMapsModal();
    }

    const anagraficaModal = document.getElementById('anagraficaModal');
    if (event.target === anagraficaModal) {
        closeAnagraficaManager();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closePostItForm();
        closeUserManagement();
        closeMapsModal();
        closeAnagraficaManager();
    }

    // Ctrl/Cmd + N to create new post-it (admin only)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && isAdmin()) {
        e.preventDefault();
        openPostItForm();
    }
});

console.log('🚀 RBS Logistica Smart - App caricata con successo');
