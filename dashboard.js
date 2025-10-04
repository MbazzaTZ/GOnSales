// Dashboard-specific rendering and logic
function updateDashboard() {
    updateDashboardMetrics();
    updatePerformanceTable();
    updateDSRTrendChart();
    updateTopPerformers();
    updateDEDashboard();
}

function updatePerformanceTable() {
    const tableBody = document.getElementById('performance-table-body');
    const tableFooter = document.getElementById('performance-table-footer');
    
    if (!tableBody) return;
    
    // Calculate totals
    let monthlyTargetTotal = 0;
    let mtdTargetTotal = 0;
    let mtdActualTotal = 0;
    
    tableBody.innerHTML = salesData.map(person => {
        const monthlyTarget = parseInt(person.monthlyTarget) || 0;
        const mtdTarget = parseInt(person.mtdTarget) || 0;
        const mtdActual = parseInt(person.mtdActual) || 0;
        const performance = calculatePerformance(mtdActual, mtdTarget);
        const gap = mtdTarget - mtdActual;
        
        monthlyTargetTotal += monthlyTarget;
        mtdTargetTotal += mtdTarget;
        mtdActualTotal += mtdActual;
        
        return `
            <tr>
                <td>${person.name}</td>
                <td>${monthlyTarget.toLocaleString()}</td>
                <td>${mtdTarget.toLocaleString()}</td>
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

function updateTopPerformers() {
    const tableBody = document.getElementById('top-performers-body');
    
    if (!tableBody) return;
    
    // Sort DSR by performance
    const sortedDSR = [...dsrPerformanceData].sort((a, b) => {
        return (b.thisMonthActual || 0) - (a.thisMonthActual || 0);
    });
    
    tableBody.innerHTML = sortedDSR.map((dsr, index) => {
        const last = parseFloat(dsr.lastMonthActual) || 0;
        const current = parseFloat(dsr.thisMonthActual) || 0;
        const growth = last === 0 ? 0 : ((current - last) / last * 100);
        const growthRounded = growth.toFixed(1);
        const growthClass = growth >= 0 ? 'performance-excellent' : 'performance-poor';
        
        const slabClass = dsr.slab ? `slab-${String(dsr.slab).toLowerCase()}` : 'slab-silver';

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${dsr.name}</td>
                <td>${dsr.cluster}</td>
                <td>${dsr.captainName}</td>
                <td>${dsr.thisMonthActual}</td>
                <td>${dsr.lastMonthActual}</td>
                <td><span class="${growthClass}">${growthRounded}%</span></td>
                <td><span class="${slabClass}">${dsr.slab || 'N/A'}</span></td>
            </tr>
        `;
    }).join('');
}

function updateDashboardMetrics() {
    const metricsContainer = document.getElementById('dashboard-metrics');
    if (!metricsContainer) return;
    // Calculate metrics
    const monthlyTargetTotal = salesData.reduce((sum, person) => sum + (parseInt(person.monthlyTarget) || 0), 0);
    const mtdTargetTotal = salesData.reduce((sum, person) => sum + (parseInt(person.mtdTarget) || 0), 0);
    const mtdActualTotal = salesData.reduce((sum, person) => sum + (parseInt(person.mtdActual) || 0), 0);
    const runningRate = calculatePerformance(mtdActualTotal, mtdTargetTotal);
    const gapToTarget = mtdTargetTotal - mtdActualTotal;
    const dsrData = infraData.find(item => item.id === 'dsr') || {};
    const activeDSR = parseInt(dsrData.active) || 0;
    const dailySales = calculateDailySales();
    const metrics = [
        { title: 'Monthly Target', value: monthlyTargetTotal, unit: 'Units', color: 'green', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'MTD Target', value: mtdTargetTotal, unit: 'Units', color: 'blue', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'MTD Sales Actual', value: mtdActualTotal, unit: 'Units', color: 'purple', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'Running Rate', value: runningRate, unit: '%', color: 'indigo', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { title: 'Gap to MTD Target', value: gapToTarget, unit: 'Units', color: 'red', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { title: 'Active DSR', value: activeDSR, unit: 'DSR', color: 'yellow', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { title: "Today's Sales", value: dailySales.todaySales, unit: 'Units', color: 'indigo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { title: "Yesterday's Sales", value: dailySales.yesterdaySales, unit: 'Units', color: 'pink', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
    ];
    metricsContainer.innerHTML = metrics.map(metric => {
        const c = getColorClasses(metric.color);
        return `
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 ${c.bg} rounded-md flex items-center justify-center">
                        <svg class="w-5 h-5 ${c.text}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${metric.icon}"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">${metric.title}</p>
                    <p class="text-2xl font-semibold text-gray-900">${metric.value.toLocaleString()} ${metric.unit}</p>
                </div>
            </div>
        </div>
    `
    }).join('');
}

function updateDEDashboard() {
    const tbody = document.getElementById('de-dashboard-table-body');
    if (!tbody) return;
    tbody.innerHTML = dePerformanceData.map(de => {
        const last = parseFloat(de.lastMonthActual) || 0;
        const current = parseFloat(de.thisMonthActual) || 0;
        const growth = last === 0 ? 0 : ((current - last) / last * 100);
        const growthRounded = growth.toFixed(1);
        const slabClass = de.slab ? `slab-${String(de.slab).toLowerCase()}` : 'slab-silver';
        return `
            <tr>
                <td>${de.name}</td>
                <td>${de.deId}</td>
                <td>${de.region}</td>
                <td>${current}</td>
                <td>${last}</td>
                <td><span class="${getPerformanceClass(Math.round(growth))}">${growthRounded}%</span></td>
                <td><span class="${slabClass}">${de.slab || 'N/A'}</span></td>
            </tr>
        `;
    }).join('');
}

// Chart and top performers live here (kept compact)
function updateDSRTrendChart() {
    const periodEl = document.getElementById('trend-period');
    const metricEl = document.getElementById('trend-metric');
    if (!periodEl || !metricEl) return;
    const period = parseInt(periodEl.value);
    const metric = metricEl.value;
    if (isHeadlessEnvironment()) {
        console.warn('Headless environment detected - skipping chart creation for updateDSRTrendChart');
        return;
    }
    const labels = Array.from({length: period}, (_, i) => {
        const date = new Date(); date.setDate(date.getDate() - (period - i - 1));
        return `${date.getDate()}-${date.toLocaleString('en', { month: 'short' })}`;
    });
    const salesSamples = Array.from({length: period}, () => Math.floor(Math.random() * 100) + 50);
    try {
        const salesCanvas = document.getElementById('salesTrendChart');
        if (salesCanvas && typeof salesCanvas.getContext === 'function' && typeof Chart !== 'undefined') {
            const salesCtx = salesCanvas.getContext('2d');
            if (salesTrendChart) salesTrendChart.destroy();
            salesTrendChart = new Chart(salesCtx, { type: 'line', data: { labels: labels, datasets: [{ label: 'Sales Trend', data: salesSamples, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { drawBorder: false } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } } });
        } else { console.warn('Skipping salesTrendChart: canvas/getContext not available or Chart not loaded'); }
    } catch (err) { console.warn('Failed to create salesTrendChart:', err && err.message); }
    try {
        const slabCanvas = document.getElementById('slabDistributionChart');
        if (slabCanvas && typeof slabCanvas.getContext === 'function' && typeof Chart !== 'undefined') {
            const slabCtx = slabCanvas.getContext('2d');
            if (slabDistributionChart) slabDistributionChart.destroy();
            slabDistributionChart = new Chart(slabCtx, { type: 'doughnut', data: { labels: ['Gold', 'Silver', 'Bronze'], datasets: [{ data: [25, 35, 40], backgroundColor: ['#fcd34d', '#e5e7eb', '#f59e0b'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
        } else { console.warn('Skipping slabDistributionChart: canvas/getContext not available or Chart not loaded'); }
    } catch (err) { console.warn('Failed to create slabDistributionChart:', err && err.message); }
}
