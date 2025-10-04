// Global state
let currentUser = null;
let currentView = 'dashboard';
let currentSalesLog = 'captain';
// When a protected view is requested without auth, we store it here and prompt for login
let pendingView = null;

// Views that require admin login
const protectedViews = new Set(['target-setting', 'sales-log', 'dsr-performance', 'de-performance']);
 
// Data collections
let salesData = [];
let infraData = [];
let salesLogData = [];
let salesPersonnel = {};
let dsrPerformanceData = [];
// DE (Dealer Executive) performance data mirrors DSR structure
let dePerformanceData = [];

// Chart instances
let salesTrendChart = null;
let slabDistributionChart = null;

// Helper: map simple color keys to concrete Tailwind classes (avoid runtime-generated class names)
function getColorClasses(key) {
    const map = {
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        pink: { bg: 'bg-pink-100', text: 'text-pink-600' }
    };
    return map[key] || { bg: 'bg-gray-100', text: 'text-gray-600' };
}

// Detect headless / Node/jsdom environment so we can skip canvas/chart creation there
function isHeadlessEnvironment() {
    try {
        // If there's no window/document, we're headless
        if (typeof window === 'undefined' || typeof document === 'undefined') return true;

        // Most headless environments (jsdom) set the navigator userAgent to include 'node' or 'jsdom'
        if (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string') {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('node') || ua.includes('jsdom')) return true;
        }

        return false;
    } catch (e) {
        return true;
    }
}

// LocalStorage helpers for DE (Dealer) persistence (simple, no external backend required)
function loadDEFromStorage() {
    try {
        const raw = localStorage.getItem('dePerformanceData');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        console.warn('Failed to load DE data from storage:', e && e.message);
    }
    return null;
}

function saveDEToStorage() {
    try {
        localStorage.setItem('dePerformanceData', JSON.stringify(dePerformanceData));
    } catch (e) {
        console.warn('Failed to save DE data to storage:', e && e.message);
    }
}

// Initialize application
function initializeApp() {
    console.log("Initializing application...");
    
    // Check if Firebase is available
    if (window.firebase) {
        console.log("Firebase detected, initializing Firebase data...");
        initializeFirebaseData();
    } else {
        console.log("Firebase not available, using mock data...");
        initializeMockData();
    }
    
    // Set up authentication state listener
    if (window.firebase && window.firebase.authFunctions) {
        window.firebase.authFunctions.onAuthStateChanged(window.firebase.auth, (user) => {
            currentUser = user;
            updateUIForAuthentication();
        });
    }
    
    // Set up login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await handleLogin(email, password);
    });
    
    // Set up add date form
    document.getElementById('add-date-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dateInput = document.getElementById('new-date').value;
        await addNewDate(dateInput);
    });
    
    // Initialize navigation
    navigateTo('dashboard');
}

// Firebase Functions
async function initializeFirebaseData() {
    showLoading(true);
    try {
        console.log("Loading data from Firebase...");
        
        // Load sales data
        const salesSnapshot = await window.firebase.firestore.getDocs(
            window.firebase.firestore.collection(window.firebase.db, 'salesData')
        );
        salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Sales data loaded:", salesData);
        
        // Load infrastructure data
        const infraSnapshot = await window.firebase.firestore.getDocs(
            window.firebase.firestore.collection(window.firebase.db, 'infrastructure')
        );
        infraData = infraSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Infrastructure data loaded:", infraData);
        
        // Load sales log data
        const logSnapshot = await window.firebase.firestore.getDocs(
            window.firebase.firestore.collection(window.firebase.db, 'salesLog')
        );
        salesLogData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Sales log data loaded:", salesLogData);
        
        // Load DSR performance data
        const dsrSnapshot = await window.firebase.firestore.getDocs(
            window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance')
        );
        dsrPerformanceData = dsrSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("DSR performance data loaded:", dsrPerformanceData);
        
        // Initialize sales personnel
        salesPersonnel.captain = salesData.map(person => ({ 
            id: person.id, 
            name: person.name, 
            shortName: person.name.split(' ')[0] 
        }));
        
        // Set up real-time listeners
        setupRealtimeListeners();
        
        // Update UI
        updateDashboard();
        updateTargetSetting();
        updateSalesLog();
        updateDSRPerformance();
        
    } catch (error) {
        console.error('Error loading data from Firebase:', error);
        // Fallback to mock data if Firebase fails
        initializeMockData();
    } finally {
        showLoading(false);
    }
}

function setupRealtimeListeners() {
    // Real-time listener for sales data
    const salesQuery = window.firebase.firestore.collection(window.firebase.db, 'salesData');
    window.firebase.firestore.onSnapshot(salesQuery, (snapshot) => {
        salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        salesPersonnel.captain = salesData.map(person => ({ 
            id: person.id, 
            name: person.name, 
            shortName: person.name.split(' ')[0] 
        }));
        
        if (currentView === 'dashboard') updateDashboard();
        if (currentView === 'target-setting') updateTargetSetting();
    });

    // Real-time listener for infrastructure data
    const infraQuery = window.firebase.firestore.collection(window.firebase.db, 'infrastructure');
    window.firebase.firestore.onSnapshot(infraQuery, (snapshot) => {
        infraData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'target-setting') updateTargetSetting();
        if (currentView === 'dashboard') updateDashboard();
    });

    // Real-time listener for sales log
    const logQuery = window.firebase.firestore.collection(window.firebase.db, 'salesLog');
    window.firebase.firestore.onSnapshot(logQuery, (snapshot) => {
        salesLogData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'sales-log') updateSalesLog();
        if (currentView === 'dashboard') updateDashboard();
    });

    // Real-time listener for DSR performance
    const dsrQuery = window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance');
    window.firebase.firestore.onSnapshot(dsrQuery, (snapshot) => {
        dsrPerformanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'dsr-performance') updateDSRPerformance();
        if (currentView === 'dashboard') updateDashboard();
    });
}

// Calculate Today's and Yesterday's Sales
function calculateDailySales() {
    const today = new Date();
    const todayFormatted = `${today.getDate()}-${today.toLocaleString('en', { month: 'short' })}`;
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = `${yesterday.getDate()}-${yesterday.toLocaleString('en', { month: 'short' })}`;

    // Find today's and yesterday's data in the sales log
    const todayData = salesLogData.find(day => day.date === todayFormatted);
    const yesterdayData = salesLogData.find(day => day.date === yesterdayFormatted);

    return {
        todaySales: todayData ? (todayData.total || 0) : 0,
        yesterdaySales: yesterdayData ? (yesterdayData.total || 0) : 0
    };
}

// Update Dashboard Metrics with Today's and Yesterday's Sales
function updateDashboardMetrics() {
    const metricsContainer = document.getElementById('dashboard-metrics');
    if (!metricsContainer) {
        console.error("Dashboard metrics container not found!");
        return;
    }

    console.log("Updating dashboard metrics with data:", salesData);

    // Calculate metrics
    const monthlyTargetTotal = salesData.reduce((sum, person) => sum + (parseInt(person.monthlyTarget) || 0), 0);
    const mtdTargetTotal = salesData.reduce((sum, person) => sum + (parseInt(person.mtdTarget) || 0), 0);
    const mtdActualTotal = salesData.reduce((sum, person) => sum + (parseInt(person.mtdActual) || 0), 0);
    const runningRate = calculatePerformance(mtdActualTotal, mtdTargetTotal);
    const gapToTarget = mtdTargetTotal - mtdActualTotal;

    // Get DSR data
    const dsrData = infraData.find(item => item.id === 'dsr') || {};
    const activeDSR = parseInt(dsrData.active) || 0;
    const dsrPerformance = calculatePerformance(activeDSR, parseInt(dsrData.base) || 1);

    // Calculate daily sales
    const dailySales = calculateDailySales();

    const metrics = [
        { title: 'Monthly Target', value: monthlyTargetTotal, unit: 'Units', color: 'green', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'MTD Target', value: mtdTargetTotal, unit: 'Units', color: 'blue', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'MTD Sales Actual', value: mtdActualTotal, unit: 'Units', color: 'purple', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'Running Rate', value: runningRate, unit: '%', color: 'indigo', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { title: 'Gap to MTD Target', value: gapToTarget, unit: 'Units', color: 'red', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { title: 'Active DSR', value: activeDSR, unit: 'DSR', color: 'yellow', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { title: 'Today\'s Sales', value: dailySales.todaySales, unit: 'Units', color: 'indigo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { title: 'Yesterday\'s Sales', value: dailySales.yesterdaySales, unit: 'Units', color: 'pink', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
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

// Mock Data Functions (fallback)
function initializeMockData() {
    console.log("Initializing with mock data...");
    
    // Mock sales data
    salesData = [
        { id: '1', name: 'Captain A', monthlyTarget: 1000, mtdTarget: 800, mtdActual: 750 },
        { id: '2', name: 'Captain B', monthlyTarget: 1200, mtdTarget: 900, mtdActual: 850 },
        { id: '3', name: 'Captain C', monthlyTarget: 800, mtdTarget: 600, mtdActual: 550 },
        { id: '4', name: 'Captain D', monthlyTarget: 1500, mtdTarget: 1100, mtdActual: 1000 }
    ];
    
    // Mock infrastructure data
    infraData = [
        { id: 'dsr', base: 50, active: 42, inactive: 8, performance: 84 },
        { id: 'dealer', base: 200, active: 175, inactive: 25, performance: 87.5 }
    ];
    
    // Mock sales log data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayFormatted = `${today.getDate()}-${today.toLocaleString('en', { month: 'short' })}`;
    const yesterdayFormatted = `${yesterday.getDate()}-${yesterday.toLocaleString('en', { month: 'short' })}`;
    
    salesLogData = [
        { 
            id: 'today', 
            date: todayFormatted, 
            captainA: 50, 
            captainB: 60, 
            captainC: 45, 
            captainD: 70, 
            total: 225 
        },
        { 
            id: 'yesterday', 
            date: yesterdayFormatted, 
            captainA: 45, 
            captainB: 55, 
            captainC: 40, 
            captainD: 65, 
            total: 205 
        }
    ];
    
    // Mock DSR performance data
    dsrPerformanceData = [
        { id: '1', name: 'John Doe', dsrId: 'DSR001', cluster: 'North', captainName: 'Captain A', lastMonthActual: 120, thisMonthActual: 135, slab: 'Gold' },
        { id: '2', name: 'Jane Smith', dsrId: 'DSR002', cluster: 'South', captainName: 'Captain B', lastMonthActual: 110, thisMonthActual: 125, slab: 'Silver' },
        { id: '3', name: 'Mike Johnson', dsrId: 'DSR003', cluster: 'East', captainName: 'Captain C', lastMonthActual: 95, thisMonthActual: 105, slab: 'Bronze' },
        { id: '4', name: 'Sarah Williams', dsrId: 'DSR004', cluster: 'West', captainName: 'Captain D', lastMonthActual: 130, thisMonthActual: 140, slab: 'Gold' }
    ];
    
    // Mock DE performance data (mimic of DSR performance)
    dePerformanceData = [
        { id: 'd1', name: 'DE Alpha', deId: 'DE001', region: 'North', captainName: 'Captain A', lastMonthActual: 210, thisMonthActual: 230, slab: 'Gold' },
        { id: 'd2', name: 'DE Beta', deId: 'DE002', region: 'South', captainName: 'Captain B', lastMonthActual: 190, thisMonthActual: 200, slab: 'Silver' },
        { id: 'd3', name: 'DE Gamma', deId: 'DE003', region: 'East', captainName: 'Captain C', lastMonthActual: 160, thisMonthActual: 170, slab: 'Bronze' }
    ];
    // If localStorage has DE data, load and override
    const storedDE = loadDEFromStorage();
    if (storedDE) {
        dePerformanceData = storedDE;
    } else {
        // Save initial mock into storage for persistence across reloads
        saveDEToStorage();
    }
    
    // Initialize sales personnel
    salesPersonnel.captain = salesData.map(person => ({ 
        id: person.id, 
        name: person.name, 
        shortName: person.name.split(' ')[0] 
    }));
    
    // Update UI
    updateDashboard();
    updateTargetSetting();
    updateSalesLog();
    updateDSRPerformance();
    updateDEPerformance();
}

// Authentication Functions
async function handleLogin(email, password) {
    const loginButton = document.getElementById('login-button');
    const errorElement = document.getElementById('login-error');
    
    try {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        errorElement.classList.add('hidden');
        
        if (window.firebase && window.firebase.authFunctions) {
            await window.firebase.authFunctions.signInWithEmailAndPassword(window.firebase.auth, email, password);
            document.getElementById('login-modal').classList.add('hidden');
        } else {
            // Mock login for demo purposes
            currentUser = { email: email };
            document.getElementById('login-modal').classList.add('hidden');
            updateUIForAuthentication();
            // If a pending view was requested, navigate there
            if (pendingView) {
                const pv = pendingView;
                pendingView = null;
                navigateTo(pv);
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.classList.remove('hidden');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}

async function handleLogout() {
    try {
        if (window.firebase && window.firebase.authFunctions) {
            await window.firebase.authFunctions.signOut(window.firebase.auth);
        } else {
            // Mock logout for demo purposes
            currentUser = null;
            updateUIForAuthentication();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function updateUIForAuthentication() {
    const userStatus = document.getElementById('user-status');
    const logoutButton = document.getElementById('logout-button');
    const headerUserId = document.getElementById('current-user-id');
    const addDSRButton = document.getElementById('add-dsr-button');
    const actionsHeader = document.getElementById('actions-header');
    const dsrPerformanceDescription = document.getElementById('dsr-performance-description');
    
    if (currentUser) {
        userStatus.textContent = 'Authenticated';
        userStatus.className = 'user-status authenticated';
        logoutButton.classList.remove('hidden');
        headerUserId.textContent = currentUser.email || 'Authenticated User';
        addDSRButton.classList.remove('hidden');
        actionsHeader.classList.remove('hidden');
        dsrPerformanceDescription.textContent = 'View and manage DSR performance data.';
    } else {
        userStatus.textContent = 'View Only';
        userStatus.className = 'user-status unauthenticated';
        logoutButton.classList.add('hidden');
        headerUserId.textContent = 'Public View';
        addDSRButton.classList.add('hidden');
        actionsHeader.classList.add('hidden');
        dsrPerformanceDescription.textContent = 'View DSR performance data. Login to edit.';
    }
    
    // Update current view to reflect authentication changes
    if (currentView === 'dsr-performance') {
        updateDSRPerformance();
    }
}

// Navigation Functions
function navigateTo(view) {
    // If view is protected and user not authenticated, prompt login and save pending view
    if (protectedViews.has(view) && !currentUser) {
        pendingView = view;
        // Show login modal and prefill email hint
        document.getElementById('login-modal').classList.remove('hidden');
        const promptEl = document.getElementById('login-prompt');
        if (promptEl) promptEl.textContent = 'Admin access required. Enter credentials to continue.';
        document.getElementById('login-email').value = 'admin@gosales.com';
        return;
    }

    // Hide all views
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('target-setting-view').classList.add('hidden');
    document.getElementById('sales-log-view').classList.add('hidden');
    document.getElementById('dsr-performance-view').classList.add('hidden');
    
    // Remove active class from all nav items
    document.getElementById('nav-dashboard').classList.remove('bg-green-50', 'text-green-700');
    document.getElementById('nav-target-setting').classList.remove('bg-green-50', 'text-green-700');
    document.getElementById('nav-sales-log').classList.remove('bg-green-50', 'text-green-700');
    document.getElementById('nav-dsr-performance').classList.remove('bg-green-50', 'text-green-700');
    document.getElementById('nav-de-performance')?.classList.remove('bg-green-50', 'text-green-700');
    
    // Add active class to current nav item
    document.getElementById(`nav-${view}`).classList.add('bg-green-50', 'text-green-700');
    
    // Show current view
    document.getElementById(`${view}-view`).classList.remove('hidden');
    
    // Update header title
    document.getElementById('header-title').textContent = getViewTitle(view);
    
    // Update current view
    currentView = view;
    
    // Update the view content
    switch(view) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'target-setting':
            updateTargetSetting();
            break;
        case 'sales-log':
            updateSalesLog();
            break;
        case 'dsr-performance':
            updateDSRPerformance();
            break;
        case 'de-performance':
            updateDEPerformance();
            break;
    }
}

function getViewTitle(view) {
    const titles = {
        'dashboard': 'Dashboard',
        'target-setting': 'Target Setting',
        'sales-log': 'Sales Log',
        'dsr-performance': 'DSR Performance'
    };
    return titles[view] || 'Dashboard';
}

// Dashboard Functions
function updateDashboard() {
    updateDashboardMetrics();
    updatePerformanceTable();
    updateDSRTrendChart();
    updateTopPerformers();
    updateDEDashboard();
}

// Dashboard: DE list
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

// DE CRUD: localStorage-backed simple implementations (used when Firebase is not available)
function addDE(newDE) {
    // newDE should be an object with fields: name, deId, region, captainName, lastMonthActual, thisMonthActual, slab
    const id = `de-${Date.now()}`;
    const entry = Object.assign({ id }, newDE);
    dePerformanceData.unshift(entry);
    saveDEToStorage();
    updateDEPerformance();
    updateDEDashboard();
}

function editDE(deId) {
    openDEModalForEdit(deId);
}

function deleteDE(deId) {
    if (!currentUser) return document.getElementById('login-modal').classList.remove('hidden');
    if (!confirm('Are you sure you want to delete this DE?')) return;
    dePerformanceData = dePerformanceData.filter(d => d.id !== deId);
    saveDEToStorage();
    updateDEPerformance();
    updateDEDashboard();
}

function showAddDEModal() {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    openDEModalForAdd();
}

// Modal helpers for DE add/edit
function openDEModalForAdd() {
    const modal = document.getElementById('de-modal');
    if (!modal) return;
    document.getElementById('de-id').value = '';
    document.getElementById('de-name').value = '';
    document.getElementById('de-deid').value = '';
    document.getElementById('de-region').value = '';
    document.getElementById('de-captain').value = '';
    document.getElementById('de-last').value = '';
    document.getElementById('de-current').value = '';
    document.getElementById('de-slab').value = '';
    modal.classList.remove('hidden');
}

function openDEModalForEdit(deId) {
    const modal = document.getElementById('de-modal');
    if (!modal) return;
    const de = dePerformanceData.find(d => d.id === deId);
    if (!de) return alert('DE not found');
    document.getElementById('de-id').value = de.id;
    document.getElementById('de-name').value = de.name || '';
    document.getElementById('de-deid').value = de.deId || '';
    document.getElementById('de-region').value = de.region || '';
    document.getElementById('de-captain').value = de.captainName || '';
    document.getElementById('de-last').value = de.lastMonthActual || 0;
    document.getElementById('de-current').value = de.thisMonthActual || 0;
    document.getElementById('de-slab').value = de.slab || '';
    modal.classList.remove('hidden');
}

function closeDEModal() {
    const modal = document.getElementById('de-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.getElementById('de-form').reset();
}

// Handle DE form submit
document.addEventListener('DOMContentLoaded', () => {
    const deForm = document.getElementById('de-form');
    if (!deForm) return;
    deForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            document.getElementById('login-modal').classList.remove('hidden');
            return;
        }

        const id = document.getElementById('de-id').value;
        const name = document.getElementById('de-name').value.trim();
        const deIdVal = document.getElementById('de-deid').value.trim();
        const region = document.getElementById('de-region').value.trim();
        const captainName = document.getElementById('de-captain').value.trim();
        const last = parseFloat(document.getElementById('de-last').value) || 0;
        const current = parseFloat(document.getElementById('de-current').value) || 0;
        const slab = document.getElementById('de-slab').value.trim() || 'Bronze';

        (async () => {
            if (id) {
                // Edit existing - save via saveDE which will use Firestore when available
                const updated = {
                    id,
                    name,
                    deId: deIdVal,
                    region,
                    captainName,
                    lastMonthActual: last,
                    thisMonthActual: current,
                    slab
                };
                await saveDE(updated);
            } else {
                await addDE({ name, deId: deIdVal, region, captainName, lastMonthActual: last, thisMonthActual: current, slab });
            }

            closeDEModal();
        })();
    });
});

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

function updateDSRTrendChart() {
    const period = parseInt(document.getElementById('trend-period').value);
    const metric = document.getElementById('trend-metric').value;

    // If running in a headless environment (jsdom/node), skip chart creation entirely
    if (isHeadlessEnvironment()) {
        console.warn('Headless environment detected - skipping chart creation for updateDSRTrendChart');
        return;
    }
    
    // Mock data for charts
    const labels = Array.from({length: period}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (period - i - 1));
        return `${date.getDate()}-${date.toLocaleString('en', { month: 'short' })}`;
    });
    
    const salesSamples = Array.from({length: period}, () => Math.floor(Math.random() * 100) + 50);
    const slabData = {
        gold: Array.from({length: period}, () => Math.floor(Math.random() * 20) + 10),
        silver: Array.from({length: period}, () => Math.floor(Math.random() * 30) + 15),
        bronze: Array.from({length: period}, () => Math.floor(Math.random() * 40) + 20)
    };
    
    // Update Sales Trend Chart (guarded: some environments like jsdom don't implement canvas)
    try {
        const salesCanvas = document.getElementById('salesTrendChart');
        if (salesCanvas && typeof salesCanvas.getContext === 'function' && typeof Chart !== 'undefined') {
            const salesCtx = salesCanvas.getContext('2d');
            if (salesTrendChart) salesTrendChart.destroy();
            salesTrendChart = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Sales Trend',
                        data: salesSamples,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { drawBorder: false } },
                        x: { grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        } else {
            console.warn('Skipping salesTrendChart: canvas/getContext not available or Chart not loaded');
        }
    } catch (err) {
        console.warn('Failed to create salesTrendChart:', err && err.message);
    }
    
    // Update Slab Distribution Chart (guarded)
    try {
        const slabCanvas = document.getElementById('slabDistributionChart');
        if (slabCanvas && typeof slabCanvas.getContext === 'function' && typeof Chart !== 'undefined') {
            const slabCtx = slabCanvas.getContext('2d');
            if (slabDistributionChart) slabDistributionChart.destroy();
            slabDistributionChart = new Chart(slabCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Gold', 'Silver', 'Bronze'],
                    datasets: [{ data: [25, 35, 40], backgroundColor: ['#fcd34d', '#e5e7eb', '#f59e0b'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        } else {
            console.warn('Skipping slabDistributionChart: canvas/getContext not available or Chart not loaded');
        }
    } catch (err) {
        console.warn('Failed to create slabDistributionChart:', err && err.message);
    }
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

// Target Setting Functions
function updateTargetSetting() {
    updateTargetTable();
    updateInfrastructureTable();
}

function updateTargetTable() {
    const tableBody = document.getElementById('target-table-body');
    const tableFooter = document.getElementById('target-table-footer');
    
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
                <td>
                    ${currentUser ? 
                        `<input type="number" class="editable-input" value="${monthlyTarget}" data-id="${person.id}" data-field="monthlyTarget" onchange="updateSalesData('${person.id}', 'monthlyTarget', this.value)">` :
                        `<input type="number" class="readonly-input" value="${monthlyTarget}" readonly>`
                    }
                </td>
                <td>
                    ${currentUser ? 
                        `<input type="number" class="editable-input" value="${mtdTarget}" data-id="${person.id}" data-field="mtdTarget" onchange="updateSalesData('${person.id}', 'mtdTarget', this.value)">` :
                        `<input type="number" class="readonly-input" value="${mtdTarget}" readonly>`
                    }
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
    
    // Calculate totals
    let baseTotal = 0;
    let activeTotal = 0;
    let inactiveTotal = 0;
    
    tableBody.innerHTML = infraData.map(item => {
        const base = parseInt(item.base) || 0;
        const active = parseInt(item.active) || 0;
        const inactive = parseInt(item.inactive) || 0;
        const performance = parseInt(item.performance) || 0;
        
        baseTotal += base;
        activeTotal += active;
        inactiveTotal += inactive;
        
        return `
            <tr>
                <td>${item.id.charAt(0).toUpperCase() + item.id.slice(1)}</td>
                <td>${base.toLocaleString()}</td>
                <td>
                    ${currentUser ? 
                        `<input type="number" class="editable-input" value="${active}" data-id="${item.id}" data-field="active" onchange="updateInfrastructureData('${item.id}', 'active', this.value)">` :
                        `<input type="number" class="readonly-input" value="${active}" readonly>`
                    }
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

// Sales Log Functions
function updateSalesLog() {
    updateSalesSummaryCards();
    updateSalesLogTable();
}

function updateSalesSummaryCards() {
    const cardsContainer = document.getElementById('sales-summary-cards');
    
    if (!cardsContainer) return;
    
    // Calculate daily sales
    const dailySales = calculateDailySales();
    
    const cards = [
        { title: 'Today\'s Sales', value: dailySales.todaySales, unit: 'Units', color: 'indigo' },
        { title: 'Yesterday\'s Sales', value: dailySales.yesterdaySales, unit: 'Units', color: 'pink' },
        { title: 'MTD Sales', value: salesData.reduce((sum, person) => sum + (parseInt(person.mtdActual) || 0), 0), unit: 'Units', color: 'green' }
    ];
    
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
    `
    }).join('');
}

function updateSalesLogTable() {
    const captionRow = document.getElementById('sales-log-caption-row');
    const tableBody = document.getElementById('sales-log-table-body');
    const tableFooter = document.getElementById('sales-log-table-footer');
    
    if (!captionRow || !tableBody) return;
    
    // Ensure salesPersonnel.captain exists
    const captains = Array.isArray(salesPersonnel.captain) ? salesPersonnel.captain : [];

    // Create header row
    let headerHTML = '<th class="date-col">Date</th>';
    captains.forEach(person => {
        headerHTML += `<th>${person.shortName}</th>`;
    });
    headerHTML += '<th class="total-col">Total</th>';
    captionRow.innerHTML = headerHTML;
    
    // Create table body
    let bodyHTML = '';
    let columnTotals = Array(captains.length + 1).fill(0);
    
    salesLogData.forEach(day => {
        let rowHTML = `<td class="date-col">${day.date}</td>`;
        let rowTotal = 0;
        
        captains.forEach((person, index) => {
            const salesValue = day[person.shortName] || 0;
            rowTotal += salesValue;
            columnTotals[index] += salesValue;
            
            if (currentUser) {
                rowHTML += `
                    <td class="sales-cell" onclick="startEditingSalesCell(this, '${day.id}', '${person.shortName}')">
                        ${salesValue}
                    </td>
                `;
            } else {
                rowHTML += `<td>${salesValue}</td>`;
            }
        });
        
        columnTotals[captains.length] += rowTotal;
        
        rowHTML += `<td class="total-col">${rowTotal}</td>`;
        bodyHTML += `<tr>${rowHTML}</tr>`;
    });
    
    tableBody.innerHTML = bodyHTML;
    
    // Create footer row
    let footerHTML = '<th class="date-col">Total</th>';
    columnTotals.forEach((total, index) => {
        if (index < captains.length) {
            footerHTML += `<th class="total-col">${total}</th>`;
        } else if (index === captains.length) {
            footerHTML += `<th class="total-col">${total}</th>`;
        }
    });
    tableFooter.innerHTML = `<tr>${footerHTML}</tr>`;
}

function startEditingSalesCell(cell, dayId, captainName) {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    const currentValue = cell.textContent.trim();
    cell.classList.add('editing');
    cell.innerHTML = `<input type="number" class="sales-cell-input" value="${currentValue}" onblur="finishEditingSalesCell(this, '${dayId}', '${captainName}')" onkeypress="handleSalesCellKeypress(event, this, '${dayId}', '${captainName}')" autofocus>`;
    cell.querySelector('input').select();
}

function handleSalesCellKeypress(event, input, dayId, captainName) {
    if (event.key === 'Enter') {
        finishEditingSalesCell(input, dayId, captainName);
    }
}

function finishEditingSalesCell(input, dayId, captainName) {
    const cell = input.parentElement;
    const newValue = parseInt(input.value) || 0;
    
    cell.classList.remove('editing');
    cell.textContent = newValue;
    
    // Update data
    updateSalesLogData(dayId, captainName, newValue);
}

function filterSalesLog(view) {
    currentSalesLog = view;
    updateSalesLog();
}

// Add Date Functions
function showAddDateModal() {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('new-date').value = formattedDate;
    
    document.getElementById('add-date-modal').classList.remove('hidden');
}

function hideAddDateModal() {
    document.getElementById('add-date-modal').classList.add('hidden');
    document.getElementById('add-date-form').reset();
}

async function addNewDate(dateString) {
    try {
        const date = new Date(dateString);
        const formattedDate = `${date.getDate()}-${date.toLocaleString('en', { month: 'short' })}`;
        
        // Check if date already exists
        const existingDate = salesLogData.find(day => day.date === formattedDate);
        if (existingDate) {
            alert('This date already exists in the sales log.');
            return;
        }
        
        // Create new date entry
        const newDateEntry = {
            id: `date-${Date.now()}`,
            date: formattedDate,
            total: 0
        };
        
        // Initialize sales for each captain
        salesPersonnel.captain.forEach(person => {
            newDateEntry[person.shortName] = 0;
        });
        
        if (window.firebase && window.firebase.db) {
            // Add to Firebase
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesLog', newDateEntry.id);
            await window.firebase.firestore.setDoc(docRef, newDateEntry);
        } else {
            // Add to mock data
            salesLogData.unshift(newDateEntry);
            updateSalesLog();
        }
        
        hideAddDateModal();
        alert(`Date ${formattedDate} added successfully!`);
        
    } catch (error) {
        console.error('Error adding new date:', error);
        alert('Error adding new date. Please try again.');
    }
}

// DSR Performance Functions
function updateDSRPerformance() {
    const tableBody = document.getElementById('dsr-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = dsrPerformanceData.map(dsr => {
        const growth = ((dsr.thisMonthActual - dsr.lastMonthActual) / dsr.lastMonthActual * 100).toFixed(1);
        
        return `
            <tr>
                <td>${dsr.name}</td>
                <td>${dsr.dsrId}</td>
                <td>${dsr.cluster}</td>
                <td>${dsr.captainName}</td>
                <td>${dsr.lastMonthActual}</td>
                <td>
                    ${currentUser ? 
                        `<input type="number" class="editable-input" value="${dsr.thisMonthActual}" data-id="${dsr.id}" data-field="thisMonthActual" onchange="updateDSRData('${dsr.id}', 'thisMonthActual', this.value)">` :
                        `<input type="number" class="readonly-input" value="${dsr.thisMonthActual}" readonly>`
                    }
                </td>
                <td><span class="slab-${dsr.slab.toLowerCase()}">${dsr.slab}</span></td>
                ${currentUser ? 
                    `<td>
                        <button class="edit-button" onclick="editDSR('${dsr.id}')">Edit</button>
                        <button class="cancel-button" onclick="deleteDSR('${dsr.id}')">Delete</button>
                    </td>` : 
                    ''
                }
            </tr>
        `;
    }).join('');
}

// DE Performance Functions (mirror of DSR)
function updateDEPerformance() {
    const tableBody = document.getElementById('de-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = dePerformanceData.map(de => {
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
                <td>${de.captainName}</td>
                <td>${de.lastMonthActual}</td>
                <td>${current}</td>
                <td><span class="${slabClass}">${de.slab || 'N/A'}</span></td>
                ${currentUser ? `<td><button class="edit-button" onclick="editDE('${de.id}')">Edit</button> <button class="cancel-button" onclick="deleteDE('${de.id}')">Delete</button></td>` : ''}
            </tr>
        `;
    }).join('');
}

function filterDETable() {
    const searchTerm = document.getElementById('de-search').value.toLowerCase();
    const rows = document.querySelectorAll('#de-table-body tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showAddDEModal() {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    alert('Add DE functionality would be implemented here');
}

function editDE(deId) {
    alert(`Edit DE ${deId} functionality would be implemented here`);
}

function deleteDE(deId) {
    if (confirm('Are you sure you want to delete this DE?')) {
        alert(`Delete DE ${deId} functionality would be implemented here`);
    }
}

function filterDSRTable() {
    const searchTerm = document.getElementById('dsr-search').value.toLowerCase();
    const rows = document.querySelectorAll('#dsr-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showAddDSRModal() {
    // This would show a modal to add a new DSR
    alert('Add DSR functionality would be implemented here');
}

function editDSR(dsrId) {
    // This would show a modal to edit the DSR
    alert(`Edit DSR ${dsrId} functionality would be implemented here`);
}

function deleteDSR(dsrId) {
    if (confirm('Are you sure you want to delete this DSR?')) {
        // This would delete the DSR from the database
        alert(`Delete DSR ${dsrId} functionality would be implemented here`);
    }
}

// Data Update Functions
async function updateSalesData(id, field, value) {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    try {
        if (window.firebase && window.firebase.db) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesData', id);
            await window.firebase.firestore.updateDoc(docRef, { [field]: parseInt(value) || 0 });
            showToast('Sales data updated', 'info');
        } else {
            // Update mock data
            const person = salesData.find(p => p.id === id);
            if (person) {
                person[field] = parseInt(value) || 0;
            }
            updateTargetSetting();
            updateDashboard();
            showToast('Sales data updated (local)', 'info');
        }
    } catch (error) {
        console.error('Error updating sales data:', error);
        showToast('Failed to update sales data', 'error');
    }
}

async function updateInfrastructureData(id, field, value) {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    try {
        if (window.firebase && window.firebase.db) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'infrastructure', id);
            await window.firebase.firestore.updateDoc(docRef, { [field]: parseInt(value) || 0 });
            showToast('Infrastructure updated', 'info');
        } else {
            // Update mock data
            const item = infraData.find(i => i.id === id);
            if (item) {
                item[field] = parseInt(value) || 0;
            }
            updateTargetSetting();
            updateDashboard();
            showToast('Infrastructure updated (local)', 'info');
        }
    } catch (error) {
        console.error('Error updating infrastructure data:', error);
        showToast('Failed to update infrastructure data', 'error');
    }
}

async function updateSalesLogData(dayId, captainName, value) {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    try {
        if (window.firebase && window.firebase.db) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesLog', dayId);
            await window.firebase.firestore.updateDoc(docRef, { [captainName]: parseInt(value) || 0 });
            showToast('Sales log updated', 'info');
        } else {
            // Update mock data
            const day = salesLogData.find(d => d.id === dayId);
            if (day) {
                day[captainName] = parseInt(value) || 0;
                
                // Recalculate total
                let total = 0;
                salesPersonnel.captain.forEach(person => {
                    total += day[person.shortName] || 0;
                });
                day.total = total;
            }
            updateSalesLog();
            updateDashboard();
            showToast('Sales log updated (local)', 'info');
        }
    } catch (error) {
        console.error('Error updating sales log data:', error);
        showToast('Failed to update sales log', 'error');
    }
}

async function updateDSRData(id, field, value) {
    if (!currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    try {
        if (window.firebase && window.firebase.db) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'dsrPerformance', id);
            await window.firebase.firestore.updateDoc(docRef, { [field]: parseInt(value) || 0 });
            showToast('DSR updated', 'info');
        } else {
            // Update mock data
            const dsr = dsrPerformanceData.find(d => d.id === id);
            if (dsr) {
                dsr[field] = parseInt(value) || 0;
            }
            updateDSRPerformance();
            updateDashboard();
            showToast('DSR updated (local)', 'info');
        }
    } catch (error) {
        console.error('Error updating DSR data:', error);
        showToast('Failed to update DSR data', 'error');
    }
}

// Utility Functions
function calculatePerformance(actual, target) {
    if (!target || target === 0) return 0;
    return Math.round((actual / target) * 100);
}

function getPerformanceClass(percentage) {
    if (percentage >= 100) return 'performance-excellent';
    if (percentage >= 80) return 'performance-good';
    if (percentage >= 60) return 'performance-neutral';
    return 'performance-poor';
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
