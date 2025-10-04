// DE performance functions
function updateDEPerformance() {
    const tableBody = document.getElementById('de-table-body'); if (!tableBody) return;
    tableBody.innerHTML = dePerformanceData.map(de => {
        const last = parseFloat(de.lastMonthActual) || 0;
        const current = parseFloat(de.thisMonthActual) || 0;
        const slabClass = de.slab ? `slab-${String(de.slab).toLowerCase()}` : 'slab-silver';
        return `
            <tr>
                <td>${de.name || ''}</td>
                <td>${de.region || ''}</td>
                <td>${de.captainName || ''}</td>
                <td>${last}</td>
                <td>${current}</td>
                <td><span class="${slabClass}">${de.slab || 'N/A'}</span></td>
                <td>${currentUser ? `<button class="edit-button" onclick="editDE('${de.id}')">Edit</button> <button class="cancel-button" onclick="deleteDE('${de.id}')">Delete</button>` : ''}</td>
            </tr>
        `;
    }).join('');
}

function filterDETable() {
    const searchTerm = document.getElementById('de-search').value.toLowerCase();
    const rows = document.querySelectorAll('#de-table-body tr'); rows.forEach(row => { const text = row.textContent.toLowerCase(); row.style.display = text.includes(searchTerm) ? '' : 'none'; });
}

// Modal helpers: openDEModalForAdd, openDEModalForEdit, closeDEModal, addDE/editDE/deleteDE are in core.js or main shim
