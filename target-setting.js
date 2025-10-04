// Target setting functions
function updateTargetSetting() {
    updateTargetTable();
    updateInfrastructureTable();
}

function updateTargetTable() {
    const tableBody = document.getElementById('target-table-body');
    const tableFooter = document.getElementById('target-table-footer');
    if (!tableBody) return;
    let monthlyTargetTotal = 0; let mtdTargetTotal = 0; let mtdActualTotal = 0;
    tableBody.innerHTML = salesData.map(person => {
        const monthlyTarget = parseInt(person.monthlyTarget) || 0;
        const mtdTarget = parseInt(person.mtdTarget) || 0;
        const mtdActual = parseInt(person.mtdActual) || 0;
        const performance = calculatePerformance(mtdActual, mtdTarget);
        const gap = mtdTarget - mtdActual;
        monthlyTargetTotal += monthlyTarget; mtdTargetTotal += mtdTarget; mtdActualTotal += mtdActual;
        return `
            <tr>
                <td>
                    ${currentUser ? `<input type="text" class="editable-text" value="${person.name}" data-id="${person.id}" data-field="name" onchange="updateSalesPersonName('${person.id}', this.value)">` : `${person.name}`}
                </td>
                <td>
                    ${currentUser ? `<input type="number" class="editable-input" value="${monthlyTarget}" data-id="${person.id}" data-field="monthlyTarget" onchange="updateSalesData('${person.id}', 'monthlyTarget', this.value)">` : `<input type="number" class="readonly-input" value="${monthlyTarget}" readonly>`}
                </td>
                <td>
                    ${currentUser ? `<input type="number" class="editable-input" value="${mtdTarget}" data-id="${person.id}" data-field="mtdTarget" onchange="updateSalesData('${person.id}', 'mtdTarget', this.value)">` : `<input type="number" class="readonly-input" value="${mtdTarget}" readonly>`}
                </td>
                <td>${mtdActual.toLocaleString()}</td>
                <td><span class="${getPerformanceClass(performance)}">${performance}%</span></td>
                <td>${gap.toLocaleString()}</td>
            </tr>
        `;
    }).join('');
    const totalPerformance = calculatePerformance(mtdActualTotal, mtdTargetTotal);
    const totalGap = mtdTargetTotal - mtdActualTotal;
    tableFooter.innerHTML = `
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>${monthlyTargetTotal.toLocaleString()}</strong></td>
            <td><strong>${mtdTargetTotal.toLocaleString()}</strong></td>
            <td><strong>${mtdActualTotal.toLocaleString()}</strong></td>
            <td><strong><span class="${getPerformanceClass(totalPerformance)}">${totalPerformance}%</span></strong></td>
            <td><strong>${totalGap.toLocaleString()}</strong></td>
        </tr>
    `;
}

function updateInfrastructureTable() {
    const tableBody = document.getElementById('infra-table-body');
    const tableFooter = document.getElementById('infra-table-footer');
    if (!tableBody) return;
    let baseTotal = 0; let activeTotal = 0; let inactiveTotal = 0;
    tableBody.innerHTML = infraData.map(item => {
        const base = parseInt(item.base) || 0; const active = parseInt(item.active) || 0; const inactive = parseInt(item.inactive) || 0; const performance = parseInt(item.performance) || 0;
        baseTotal += base; activeTotal += active; inactiveTotal += inactive;
        const displayType = item.type || (item.id.charAt(0).toUpperCase() + item.id.slice(1));
        return `
            <tr>
                <td>
                    ${currentUser ? `<input type="text" class="editable-text" value="${displayType}" data-id="${item.id}" onchange="updateInfrastructureType('${item.id}', this.value)">` : `${displayType}`}
                </td>
                <td>
                    ${currentUser ? `<input type="number" class="editable-input" value="${base}" data-id="${item.id}" data-field="base" onchange="updateInfrastructureData('${item.id}', 'base', this.value)">` : `${base.toLocaleString()}`}
                </td>
                <td>
                    ${currentUser ? `<input type="number" class="editable-input" value="${active}" data-id="${item.id}" data-field="active" onchange="updateInfrastructureData('${item.id}', 'active', this.value)">` : `<input type="number" class="readonly-input" value="${active}" readonly>`}
                </td>
                <td>${inactive.toLocaleString()}</td>
                <td><span class="${getPerformanceClass(performance)}">${performance}%</span></td>
            </tr>
        `;
    }).join('');
    const totalPerformance = calculatePerformance(activeTotal, baseTotal);
    tableFooter.innerHTML = `
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>${baseTotal.toLocaleString()}</strong></td>
            <td><strong>${activeTotal.toLocaleString()}</strong></td>
            <td><strong>${inactiveTotal.toLocaleString()}</strong></td>
            <td><strong><span class="${getPerformanceClass(totalPerformance)}">${totalPerformance}%</span></strong></td>
        </tr>
    `;
}
