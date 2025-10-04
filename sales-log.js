// Sales Log functions
function updateSalesLog() {
    updateSalesSummaryCards();
    updateSalesLogTable();
}

function updateSalesSummaryCards() {
    const cardsContainer = document.getElementById('sales-summary-cards');
    if (!cardsContainer) return;
    const dailySales = calculateDailySales();
    const cards = [ { title: "Today's Sales", value: dailySales.todaySales, unit: 'Units', color: 'indigo' }, { title: "Yesterday's Sales", value: dailySales.yesterdaySales, unit: 'Units', color: 'pink' }, { title: 'MTD Sales', value: salesData.reduce((sum, person) => sum + (parseInt(person.mtdActual) || 0), 0), unit: 'Units', color: 'green' } ];
    cardsContainer.innerHTML = cards.map(card => {
        const c = getColorClasses(card.color);
        return `
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 ${c.bg} rounded-md flex items-center justify-center">
                        <svg class="w-6 h-6 ${c.text}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">${card.title}</p>
                    <p class="text-2xl font-semibold text-gray-900">${card.value.toLocaleString()} ${card.unit}</p>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function updateSalesLogTable() {
    const captionRow = document.getElementById('sales-log-caption-row');
    const tableBody = document.getElementById('sales-log-table-body');
    const tableFooter = document.getElementById('sales-log-table-footer');
    if (!captionRow || !tableBody) return;
    // We'll render a fixed layout: Date | Captain | Captain | Captain | Captain | DE | Total
    const captains = Array.isArray(salesPersonnel.captain) ? salesPersonnel.captain.slice(0,4) : [];
    // Build header
    let headerHTML = '<th class="date-col">Date</th>';
    // Ensure we always output four captain headers (use placeholders if missing)
    for (let i = 0; i < 4; i++) {
        const person = captains[i];
        headerHTML += `<th>${person ? person.shortName : 'Captain'}</th>`;
    }
    headerHTML += '<th>DE</th><th class="total-col">Total Sales</th>';
    captionRow.innerHTML = headerHTML;

    // Determine 4-day rows: use existing salesLogData (first 4 entries) or build empty rows for the last 4 days
    const rows = [];
    if (salesLogData && salesLogData.length >= 4) {
        rows.push(...salesLogData.slice(0,4));
    } else {
        // If there isn't enough data, create placeholder rows (use today's date and previous days)
        const today = new Date();
        for (let i = 0; i < 4; i++) {
            const d = new Date(today); d.setDate(today.getDate() - i);
            const formatted = `${d.getDate()}-${d.toLocaleString('en', { month: 'short' })}`;
            const existing = salesLogData ? salesLogData[i] : null;
            rows.push(existing || { id: `date-${i}`, date: formatted });
        }
    }

    // Render body rows and accumulate totals
    let bodyHTML = '';
    const columnTotals = [0,0,0,0,0,0]; // 4 captains + DE + grand total at the end
    rows.forEach((day) => {
        let rowHTML = `<td class="date-col">${day.date || ''}</td>`;
        let rowTotal = 0;
        for (let i = 0; i < 4; i++) {
            const person = captains[i];
            const key = person ? person.shortName : `captain${i+1}`;
            const salesValue = parseInt(day[key]) || 0;
            rowTotal += salesValue; columnTotals[i] += salesValue;
            if (currentUser) {
                rowHTML += `<td class="sales-cell" onclick="startEditingSalesCell(this, '${day.id}', '${key}')">${salesValue}</td>`;
            } else {
                rowHTML += `<td>${salesValue}</td>`;
            }
        }
        // DE column
        const deValue = parseInt(day.DE) || 0; rowTotal += deValue; columnTotals[4] += deValue;
        if (currentUser) rowHTML += `<td class="sales-cell" onclick="startEditingSalesCell(this, '${day.id}', 'DE')">${deValue}</td>`; else rowHTML += `<td>${deValue}</td>`;

        columnTotals[5] += rowTotal;
        rowHTML += `<td class="total-col">${rowTotal}</td>`;
        bodyHTML += `<tr>${rowHTML}</tr>`;
    });

    tableBody.innerHTML = bodyHTML;

    // Footer totals row
    let footerHTML = '<th class="date-col">Total</th>';
    for (let i = 0; i < 5; i++) footerHTML += `<th class="total-col">${columnTotals[i]}</th>`;
    footerHTML += `<th class="total-col">${columnTotals[5]}</th>`;
    tableFooter.innerHTML = `<tr>${footerHTML}</tr>`;
}

function startEditingSalesCell(cell, dayId, captainName) {
    if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
    const currentValue = cell.textContent.trim(); cell.classList.add('editing'); cell.innerHTML = `<input type="number" class="sales-cell-input" value="${currentValue}" onblur="finishEditingSalesCell(this, '${dayId}', '${captainName}')" onkeypress="handleSalesCellKeypress(event, this, '${dayId}', '${captainName}')" autofocus>`; cell.querySelector('input').select();
}

function handleSalesCellKeypress(event, input, dayId, captainName) { if (event.key === 'Enter') finishEditingSalesCell(input, dayId, captainName); }

function finishEditingSalesCell(input, dayId, captainName) { const cell = input.parentElement; const newValue = parseInt(input.value) || 0; cell.classList.remove('editing'); cell.textContent = newValue; updateSalesLogData(dayId, captainName, newValue); }

function filterSalesLog(view) { currentSalesLog = view; updateSalesLog(); }

// Add Date modal helpers
function showAddDateModal() { if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; } const today = new Date(); const formattedDate = today.toISOString().split('T')[0]; document.getElementById('new-date').value = formattedDate; document.getElementById('add-date-modal').classList.remove('hidden'); }
function hideAddDateModal() { document.getElementById('add-date-modal').classList.add('hidden'); document.getElementById('add-date-form').reset(); }

async function addNewDate(dateString) {
    try {
        const date = new Date(dateString);
        const formattedDate = `${date.getDate()}-${date.toLocaleString('en', { month: 'short' })}`;
        const existingDate = salesLogData.find(day => day.date === formattedDate);
        if (existingDate) { alert('This date already exists in the sales log.'); return; }
        const newDateEntry = { id: `date-${Date.now()}`, date: formattedDate, total: 0 };
        salesPersonnel.captain.forEach(person => { newDateEntry[person.shortName] = 0; });
        if (window.firebase && window.firebase.db) { const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesLog', newDateEntry.id); await window.firebase.firestore.setDoc(docRef, newDateEntry); } else { salesLogData.unshift(newDateEntry); updateSalesLog(); }
        hideAddDateModal(); alert(`Date ${formattedDate} added successfully!`);
    } catch (error) { console.error('Error adding new date:', error); alert('Error adding new date. Please try again.'); }
}
