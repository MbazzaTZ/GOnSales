// DSR performance functions
function updateDSRPerformance() {
    const tableBody = document.getElementById('dsr-table-body'); if (!tableBody) return;
    console.log('updateDSRPerformance called, dsrPerformanceData length:', Array.isArray(dsrPerformanceData) ? dsrPerformanceData.length : typeof dsrPerformanceData);
    if (!Array.isArray(dsrPerformanceData) || dsrPerformanceData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:1rem">No DSR records available.</td></tr>';
    } else {
        tableBody.innerHTML = dsrPerformanceData.map(dsr => {
            const last = parseFloat(dsr.lastMonthActual) || 0;
            const current = parseFloat(dsr.thisMonthActual) || 0;
            const growth = last === 0 ? 0 : ((current - last) / last * 100);
            const growthRounded = growth.toFixed(1);
            const slab = (dsr.slab || '').toString();
            const slabClass = slab ? `slab-${slab.toLowerCase()}` : '';
            return `
                <tr>
                    <td>${dsr.name || ''}</td>
                    <td>${dsr.dsrId || ''}</td>
                    <td>${dsr.cluster || ''}</td>
                    <td>${dsr.captainName || ''}</td>
                    <td>${dsr.lastMonthActual || 0}</td>
                    <td>${currentUser ? `<input type="number" class="editable-input" value="${dsr.thisMonthActual || 0}" data-id="${dsr.id}" data-field="thisMonthActual" onchange="updateDSRData('${dsr.id}', 'thisMonthActual', this.value)">` : `<input type="number" class="readonly-input" value="${dsr.thisMonthActual || 0}" readonly>`}</td>
                    <td><span class="${slabClass}">${slab}</span></td>
                    ${currentUser ? `<td><button class="edit-button" onclick="editDSR('${dsr.id}')">Edit</button> <button class="cancel-button" onclick="deleteDSR('${dsr.id}')">Delete</button></td>` : ''}
                </tr>
            `;
        }).join('');
    }
    console.log('dsr-table-body innerHTML length:', tableBody.innerHTML.length);
}

function filterDSRTable() {
    const searchTerm = document.getElementById('dsr-search').value.toLowerCase();
    const rows = document.querySelectorAll('#dsr-table-body tr');
    rows.forEach(row => { const text = row.textContent.toLowerCase(); row.style.display = text.includes(searchTerm) ? '' : 'none'; });
}

function showAddDSRModal() { alert('Add DSR functionality would be implemented here'); }
function editDSR(dsrId) { alert(`Edit DSR ${dsrId} functionality would be implemented here`); }
function deleteDSR(dsrId) { if (confirm('Are you sure you want to delete this DSR?')) { alert(`Delete DSR ${dsrId} functionality would be implemented here`); } }
