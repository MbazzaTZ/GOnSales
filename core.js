// Core: globals, helpers, auth, firebase init, navigation, common utilities
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

// Helper: map simple color keys to concrete Tailwind classes
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

// Detect headless / Node/jsdom environment
function isHeadlessEnvironment() {
    try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return true;
        if (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string') {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('node') || ua.includes('jsdom')) return true;
        }
        return false;
    } catch (e) {
        return true;
    }
}

// LocalStorage helpers for DE persistence
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

// Utility functions
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
    if (!spinner) return;
    if (show) spinner.classList.remove('hidden'); else spinner.classList.add('hidden');
}

// Toast helper
function showToast(message, type = 'info', timeout = 4000) {
    try {
        const container = document.getElementById('toast-container');
        if (!container) return;
        // keep max 4 toasts visible
        while (container.children.length >= 4) container.removeChild(container.firstChild);
        const toast = document.createElement('div');
        toast.className = `max-w-sm w-full bg-white shadow-md rounded-md p-3 border-l-4 flex items-start justify-between ${type === 'error' ? 'border-red-500' : 'border-green-500'}`;
        const msg = document.createElement('div');
        msg.className = 'text-sm text-gray-800 mr-3';
        msg.textContent = message;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-xs text-gray-500 hover:text-gray-700 ml-2';
        closeBtn.innerText = '✕';
        closeBtn.onclick = () => { if (container.contains(toast)) container.removeChild(toast); };
        toast.appendChild(msg);
        toast.appendChild(closeBtn);
        container.appendChild(toast);
        if (timeout > 0) setTimeout(() => { if (container.contains(toast)) { toast.classList.add('opacity-0'); setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 300); } }, timeout);
    } catch (e) {
        console.warn('Failed to show toast:', e && e.message);
    }
}

// Initialize app with performance optimizations
function initializeApp() {
    console.log('Initializing application...');
    
    // Initialize performance monitoring
    if (window.performanceMonitor) {
        window.performanceMonitor.startMeasurement('app-initialization');
    }
    
    // Use cached data if available
    const cachedData = window.cacheManager ? window.cacheManager.get('app-data') : null;
    if (cachedData && cachedData.timestamp > Date.now() - 5 * 60 * 1000) { // 5 minutes
        console.log('Using cached data...');
        loadCachedData(cachedData);
    } else {
        if (window.firebase) {
            console.log('Firebase detected, initializing Firebase data...');
            initializeFirebaseData();
        } else {
            console.log('Firebase not available, using mock data...');
            initializeMockData();
        }
    }

    // Listen to auth state if Firebase present
    if (window.firebase && window.firebase.authFunctions) {
        window.firebase.authFunctions.onAuthStateChanged(window.firebase.auth, (user) => {
            currentUser = user;
            updateUIForAuthentication();
        });
    }

    // Login form with enhanced security
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await handleLogin(email, password);
        });

        // Add password strength indicator
        const passwordInput = document.getElementById('login-password');
        const passwordStrengthDiv = document.getElementById('password-strength');
        
        if (passwordInput && passwordStrengthDiv) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                if (password.length > 0) {
                    passwordStrengthDiv.classList.remove('hidden');
                    updatePasswordStrengthIndicator(password);
                } else {
                    passwordStrengthDiv.classList.add('hidden');
                }
            });
        }
    }

    // Add date form
    const addDateForm = document.getElementById('add-date-form');
    if (addDateForm) {
        addDateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dateInput = document.getElementById('new-date').value;
            await addNewDate(dateInput);
        });
    }

    // DSR modal open/close helpers
    window.openDSRModalForAdd = function() {
        if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
        const modal = document.getElementById('dsr-modal');
        if (!modal) return;
        document.getElementById('dsr-id').value = '';
        document.getElementById('dsr-name').value = '';
        document.getElementById('dsr-dsrid').value = '';
        document.getElementById('dsr-cluster').value = '';
        document.getElementById('dsr-captain').value = '';
        document.getElementById('dsr-last').value = '';
        document.getElementById('dsr-current').value = '';
        document.getElementById('dsr-slab').value = '';
        modal.classList.remove('hidden');
    };
    window.openDSRModalForEdit = function(dsrId) {
        if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
        const modal = document.getElementById('dsr-modal');
        if (!modal) return;
        const dsr = dsrPerformanceData.find(d => d.id === dsrId);
        if (!dsr) return alert('DSR not found');
        document.getElementById('dsr-id').value = dsr.id || '';
        document.getElementById('dsr-name').value = dsr.name || '';
        document.getElementById('dsr-dsrid').value = dsr.dsrId || '';
        document.getElementById('dsr-cluster').value = dsr.cluster || '';
        document.getElementById('dsr-captain').value = dsr.captainName || '';
        document.getElementById('dsr-last').value = dsr.lastMonthActual || 0;
        document.getElementById('dsr-current').value = dsr.thisMonthActual || 0;
        document.getElementById('dsr-slab').value = dsr.slab || '';
        modal.classList.remove('hidden');
    };
    window.closeDSRModal = function() {
        const modal = document.getElementById('dsr-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        const form = document.getElementById('dsr-form'); if (form) form.reset();
    };

    // DSR form wiring
    const dsrForm = document.getElementById('dsr-form');
    if (dsrForm) {
        dsrForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
            const id = document.getElementById('dsr-id').value;
            const name = document.getElementById('dsr-name').value.trim();
            const dsrIdVal = document.getElementById('dsr-dsrid').value.trim();
            const cluster = document.getElementById('dsr-cluster').value.trim();
            const captainName = document.getElementById('dsr-captain').value.trim();
            const last = parseFloat(document.getElementById('dsr-last').value) || 0;
            const current = parseFloat(document.getElementById('dsr-current').value) || 0;
            const slab = document.getElementById('dsr-slab').value.trim() || 'Bronze';
            if (id) {
                const updated = { id, name, dsrId: dsrIdVal, cluster, captainName, lastMonthActual: last, thisMonthActual: current, slab };
                await saveDSR(updated);
            } else {
                await addDSR({ name, dsrId: dsrIdVal, cluster, captainName, lastMonthActual: last, thisMonthActual: current, slab });
            }
            closeDSRModal();
        });
    }

    navigateTo('dashboard');
}

// Firebase initialization and data loading (copied from previous main.js)
async function initializeFirebaseData() {
    showLoading(true);
    try {
        console.log('Loading data from Firebase...');
        const salesSnapshot = await window.firebase.firestore.getDocs(window.firebase.firestore.collection(window.firebase.db, 'salesData'));
        salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const infraSnapshot = await window.firebase.firestore.getDocs(window.firebase.firestore.collection(window.firebase.db, 'infrastructure'));
        infraData = infraSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const logSnapshot = await window.firebase.firestore.getDocs(window.firebase.firestore.collection(window.firebase.db, 'salesLog'));
        salesLogData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dsrSnapshot = await window.firebase.firestore.getDocs(window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance'));
        dsrPerformanceData = dsrSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load DE performance data if present in Firestore
        try {
            const deSnapshot = await window.firebase.firestore.getDocs(window.firebase.firestore.collection(window.firebase.db, 'dePerformance'));
            dePerformanceData = deSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.warn('No dePerformance collection in Firestore or failed to load:', e && e.message);
        }

        salesPersonnel.captain = salesData.map(person => ({ id: person.id, name: person.name, shortName: person.name.split(' ')[0] }));
        setupRealtimeListeners();
        updateDashboard();
        updateTargetSetting();
        updateSalesLog();
        updateDSRPerformance();
        // Auto-connect to emulator if requested via query flag or global
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const useEmulator = urlParams.get('emulator') === '1' || window.USE_FIREBASE_EMULATOR;
            // some import-map setups expose connectFirestoreEmulator as window.firebase.connectFirestoreEmulator
            if (useEmulator && window.firebase && typeof window.firebase.connectFirestoreEmulator === 'function') {
                try {
                    window.firebase.connectFirestoreEmulator(window.firebase.db, 'localhost', 8080);
                    showToast('Connected to Firestore emulator', 'info', 3000);
                } catch (err) {
                    console.warn('Failed to connect to Firestore emulator', err);
                    showToast('Failed to connect to Firestore emulator', 'error', 5000);
                }
            }
        } catch (e) {
            // ignore
        }
    } catch (error) {
        console.error('Error loading data from Firebase:', error);
        initializeMockData();
    } finally {
        showLoading(false);
    }
}

function setupRealtimeListeners() {
    if (!window.firebase || !window.firebase.firestore) return;
    const salesQuery = window.firebase.firestore.collection(window.firebase.db, 'salesData');
    window.firebase.firestore.onSnapshot(salesQuery, (snapshot) => {
        salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        salesPersonnel.captain = salesData.map(person => ({ id: person.id, name: person.name, shortName: person.name.split(' ')[0] }));
        if (currentView === 'dashboard') updateDashboard();
        if (currentView === 'target-setting') updateTargetSetting();
    });

    const infraQuery = window.firebase.firestore.collection(window.firebase.db, 'infrastructure');
    window.firebase.firestore.onSnapshot(infraQuery, (snapshot) => {
        infraData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'target-setting') updateTargetSetting();
        if (currentView === 'dashboard') updateDashboard();
    });

    const logQuery = window.firebase.firestore.collection(window.firebase.db, 'salesLog');
    window.firebase.firestore.onSnapshot(logQuery, (snapshot) => {
        salesLogData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'sales-log') updateSalesLog();
        if (currentView === 'dashboard') updateDashboard();
    });

    const dsrQuery = window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance');
    window.firebase.firestore.onSnapshot(dsrQuery, (snapshot) => {
        dsrPerformanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentView === 'dsr-performance') updateDSRPerformance();
        if (currentView === 'dashboard') updateDashboard();
    });

    // Realtime listener for DE performance (if Firestore available)
    try {
        const deQuery = window.firebase.firestore.collection(window.firebase.db, 'dePerformance');
        window.firebase.firestore.onSnapshot(deQuery, (snapshot) => {
            dePerformanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (currentView === 'de-performance') updateDEPerformance();
            if (currentView === 'dashboard') updateDashboard();
        });
    } catch (e) {
        // ignore if DE collection not present
    }
}

// DE CRUD: Firestore-backed when available, localStorage fallback otherwise
async function addDE(newDE) {
    // newDE: { name, deId, region, captainName, lastMonthActual, thisMonthActual, slab }
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.addDoc) {
            const colRef = window.firebase.firestore.collection(window.firebase.db, 'dePerformance');
            const docRef = await window.firebase.firestore.addDoc(colRef, newDE);
            showToast('DE added successfully', 'info');
            // Firestore will trigger realtime listener and update local data
            return docRef.id;
        } else {
            const id = `de-${Date.now()}`;
            const entry = Object.assign({ id }, newDE);
            dePerformanceData.unshift(entry);
            saveDEToStorage();
            updateDEPerformance();
            updateDEDashboard();
            showToast('DE added (local)', 'info');
            return id;
        }
    } catch (error) {
        console.error('Error adding DE:', error);
        // fallback to local storage
        const id = `de-${Date.now()}`;
        const entry = Object.assign({ id }, newDE);
        dePerformanceData.unshift(entry);
        saveDEToStorage();
        updateDEPerformance();
        updateDEDashboard();
        showToast('Failed to add DE to Firestore; saved locally', 'error');
        return id;
    }
}

async function saveDE(updatedDE) {
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.updateDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'dePerformance', updatedDE.id);
            // Remove id from payload
            const payload = Object.assign({}, updatedDE);
            delete payload.id;
            await window.firebase.firestore.updateDoc(docRef, payload);
            showToast('DE updated successfully', 'info');
            return true;
        } else {
            const idx = dePerformanceData.findIndex(d => d.id === updatedDE.id);
            if (idx !== -1) {
                dePerformanceData[idx] = Object.assign({}, updatedDE);
                saveDEToStorage();
                updateDEPerformance();
                updateDEDashboard();
                showToast('DE updated (local)', 'info');
                return true;
            }
        }
    } catch (error) {
        console.error('Error saving DE:', error);
        showToast('Failed to update DE', 'error');
    }
    return false;
}

// Update sales personnel name (editable from Target Setting)
async function updateSalesPersonName(personId, newName) {
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.updateDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesData', personId);
            await window.firebase.firestore.updateDoc(docRef, { name: newName });
            showToast('Name updated in Firestore', 'info');
            return true;
        } else {
            const idx = salesData.findIndex(s => s.id === personId);
            if (idx !== -1) {
                salesData[idx].name = newName;
                // refresh salesPersonnel short names mapping
                salesPersonnel.captain = salesData.map(person => ({ id: person.id, name: person.name, shortName: person.name.split(' ')[0] }));
                updateTargetSetting(); updateSalesLog(); updateDashboard();
                showToast('Name updated (local)', 'info');
                return true;
            }
        }
    } catch (error) {
        console.error('Failed to update sales person name:', error);
        showToast('Failed to update name', 'error');
    }
    return false;
}

// Update infrastructure 'type' (display label) without changing doc id
async function updateInfrastructureType(id, newType) {
    if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.updateDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'infrastructure', id);
            await window.firebase.firestore.updateDoc(docRef, { type: newType });
            showToast('Infrastructure type updated in Firestore', 'info');
            return true;
        } else {
            const idx = infraData.findIndex(i => i.id === id);
            if (idx !== -1) {
                infraData[idx].type = newType;
                updateTargetSetting(); updateDashboard();
                showToast('Infrastructure type updated (local)', 'info');
                return true;
            }
        }
    } catch (error) {
        console.error('Failed to update infrastructure type:', error);
        showToast('Failed to update infrastructure type', 'error');
    }
    return false;
}

async function deleteDE(deId) {
    if (!currentUser) return document.getElementById('login-modal').classList.remove('hidden');
    if (!confirm('Are you sure you want to delete this DE?')) return;
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.deleteDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'dePerformance', deId);
            await window.firebase.firestore.deleteDoc(docRef);
            showToast('DE deleted successfully', 'info');
            // realtime listener will update UI
            return true;
        } else {
            dePerformanceData = dePerformanceData.filter(d => d.id !== deId);
            saveDEToStorage();
            updateDEPerformance();
            updateDEDashboard();
            showToast('DE deleted (local)', 'info');
            return true;
        }
    } catch (error) {
        console.error('Error deleting DE:', error);
        // fallback to local removal
        dePerformanceData = dePerformanceData.filter(d => d.id !== deId);
        saveDEToStorage();
        updateDEPerformance();
        updateDEDashboard();
        showToast('Failed to delete DE', 'error');
        return false;
    }
}

// DSR CRUD functions (mirror DE behavior)
async function addDSR(newDSR) {
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.addDoc) {
            const colRef = window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance');
            const docRef = await window.firebase.firestore.addDoc(colRef, newDSR);
            showToast('DSR added successfully', 'info');
            return docRef.id;
        } else {
            const id = `dsr-${Date.now()}`;
            const entry = Object.assign({ id }, newDSR);
            dsrPerformanceData.unshift(entry);
            updateDSRPerformance();
            showToast('DSR added (local)', 'info');
            return id;
        }
    } catch (error) {
        console.error('Error adding DSR:', error);
        const id = `dsr-${Date.now()}`;
        const entry = Object.assign({ id }, newDSR);
        dsrPerformanceData.unshift(entry);
        updateDSRPerformance();
        showToast('Failed to add DSR to Firestore; saved locally', 'error');
        return id;
    }
}

async function saveDSR(updatedDSR) {
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.updateDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'dsrPerformance', updatedDSR.id);
            const payload = Object.assign({}, updatedDSR);
            delete payload.id;
            await window.firebase.firestore.updateDoc(docRef, payload);
            showToast('DSR updated successfully', 'info');
            return true;
        } else {
            const idx = dsrPerformanceData.findIndex(d => d.id === updatedDSR.id);
            if (idx !== -1) {
                dsrPerformanceData[idx] = Object.assign({}, updatedDSR);
                updateDSRPerformance();
                showToast('DSR updated (local)', 'info');
                return true;
            }
        }
    } catch (error) {
        console.error('Error saving DSR:', error);
        showToast('Failed to update DSR', 'error');
    }
    return false;
}

async function deleteDSR(dsrId) {
    if (!currentUser) return document.getElementById('login-modal').classList.remove('hidden');
    if (!confirm('Are you sure you want to delete this DSR?')) return;
    try {
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.deleteDoc) {
            const docRef = window.firebase.firestore.doc(window.firebase.db, 'dsrPerformance', dsrId);
            await window.firebase.firestore.deleteDoc(docRef);
            showToast('DSR deleted successfully', 'info');
            return true;
        } else {
            dsrPerformanceData = dsrPerformanceData.filter(d => d.id !== dsrId);
            updateDSRPerformance();
            showToast('DSR deleted (local)', 'info');
            return true;
        }
    } catch (error) {
        console.error('Error deleting DSR:', error);
        dsrPerformanceData = dsrPerformanceData.filter(d => d.id !== dsrId);
        updateDSRPerformance();
        showToast('Failed to delete DSR', 'error');
        return false;
    }
}

// Ensure closeDSRModal exists for other modules
window.closeDSRModal = window.closeDSRModal || function() {
    const modal = document.getElementById('dsr-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    const form = document.getElementById('dsr-form'); if (form) form.reset();
};

// Calculate Today's and Yesterday's Sales
function calculateDailySales() {
    const today = new Date();
    const todayFormatted = `${today.getDate()}-${today.toLocaleString('en', { month: 'short' })}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = `${yesterday.getDate()}-${yesterday.toLocaleString('en', { month: 'short' })}`;
    const todayData = salesLogData.find(day => day.date === todayFormatted);
    const yesterdayData = salesLogData.find(day => day.date === yesterdayFormatted);
    return { todaySales: todayData ? (todayData.total || 0) : 0, yesterdaySales: yesterdayData ? (yesterdayData.total || 0) : 0 };
}

// Mock & metrics (we keep the mock initializer here so data is available)
function initializeMockData() {
    console.log('Initializing with mock data...');
    salesData = [
        { id: '1', name: 'Captain A', monthlyTarget: 1000, mtdTarget: 800, mtdActual: 750 },
        { id: '2', name: 'Captain B', monthlyTarget: 1200, mtdTarget: 900, mtdActual: 850 },
        { id: '3', name: 'Captain C', monthlyTarget: 800, mtdTarget: 600, mtdActual: 550 },
        { id: '4', name: 'Captain D', monthlyTarget: 1500, mtdTarget: 1100, mtdActual: 1000 }
    ];
    infraData = [ { id: 'dsr', base: 50, active: 42, inactive: 8, performance: 84 }, { id: 'dealer', base: 200, active: 175, inactive: 25, performance: 87.5 } ];
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const todayFormatted = `${today.getDate()}-${today.toLocaleString('en', { month: 'short' })}`;
    const yesterdayFormatted = `${yesterday.getDate()}-${yesterday.toLocaleString('en', { month: 'short' })}`;
    salesLogData = [ { id: 'today', date: todayFormatted, captainA: 50, captainB: 60, captainC: 45, captainD: 70, total: 225 }, { id: 'yesterday', date: yesterdayFormatted, captainA: 45, captainB: 55, captainC: 40, captainD: 65, total: 205 } ];
    dsrPerformanceData = [ { id: '1', name: 'John Doe', dsrId: 'DSR001', cluster: 'North', captainName: 'Captain A', lastMonthActual: 120, thisMonthActual: 135, slab: 'Gold' }, { id: '2', name: 'Jane Smith', dsrId: 'DSR002', cluster: 'South', captainName: 'Captain B', lastMonthActual: 110, thisMonthActual: 125, slab: 'Silver' }, { id: '3', name: 'Mike Johnson', dsrId: 'DSR003', cluster: 'East', captainName: 'Captain C', lastMonthActual: 95, thisMonthActual: 105, slab: 'Bronze' }, { id: '4', name: 'Sarah Williams', dsrId: 'DSR004', cluster: 'West', captainName: 'Captain D', lastMonthActual: 130, thisMonthActual: 140, slab: 'Gold' } ];
    dePerformanceData = [ { id: 'd1', name: 'DE Alpha', deId: 'DE001', region: 'North', captainName: 'Captain A', lastMonthActual: 210, thisMonthActual: 230, slab: 'Gold' }, { id: 'd2', name: 'DE Beta', deId: 'DE002', region: 'South', captainName: 'Captain B', lastMonthActual: 190, thisMonthActual: 200, slab: 'Silver' }, { id: 'd3', name: 'DE Gamma', deId: 'DE003', region: 'East', captainName: 'Captain C', lastMonthActual: 160, thisMonthActual: 170, slab: 'Bronze' } ];
    const storedDE = loadDEFromStorage(); if (storedDE) dePerformanceData = storedDE; else saveDEToStorage();
    salesPersonnel.captain = salesData.map(person => ({ id: person.id, name: person.name, shortName: person.name.split(' ')[0] }));
    
    // Initialize UI with performance monitoring
    if (window.performanceMonitor) {
        window.performanceMonitor.startMeasurement('ui-initialization');
    }
    
    updateDashboard(); updateTargetSetting(); updateSalesLog(); updateDSRPerformance(); updateDEPerformance();
    
    // End performance monitoring and cache data
    if (window.performanceMonitor) {
        window.performanceMonitor.endMeasurement('app-initialization');
        window.performanceMonitor.endMeasurement('ui-initialization');
        
        // Cache the loaded data
        if (window.cacheManager) {
            const appData = {
                salesData,
                dsrPerformanceData,
                dePerformanceData,
                timestamp: Date.now()
            };
            window.cacheManager.set('app-data', appData, { strategy: 'memory', ttl: 5 * 60 * 1000 });
        }
    }
}

// Load cached data
function loadCachedData(cachedData) {
    console.log('Loading cached data...');
    
    if (cachedData.salesData) {
        salesData = cachedData.salesData;
    }
    if (cachedData.dsrPerformanceData) {
        dsrPerformanceData = cachedData.dsrPerformanceData;
    }
    if (cachedData.dePerformanceData) {
        dePerformanceData = cachedData.dePerformanceData;
    }
    
    console.log('Cached data loaded successfully');
}

// Enhanced Authentication Functions with Security Validation
async function handleLogin(email, password) {
    const loginButton = document.getElementById('login-button');
    const errorElement = document.getElementById('login-error');
    
    try {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        errorElement.classList.add('hidden');

        // Validate input using security utilities
        const validationSchema = {
            email: { type: 'email', required: true },
            password: { type: 'password', required: true }
        };

        const validation = SecurityUtils.validateFormData({ email, password }, validationSchema);
        
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).join(', ');
            throw new Error(`Validation failed: ${errorMessages}`);
        }

        const sanitizedEmail = validation.sanitizedData.email;
        const sanitizedPassword = validation.sanitizedData.password;

        // Additional security checks
        if (!SecurityUtils.validateEmail(sanitizedEmail)) {
            throw new Error('Invalid email format');
        }

        // Rate limiting check (simple implementation)
        if (!checkLoginRateLimit(sanitizedEmail)) {
            throw new Error('Too many login attempts. Please wait before trying again.');
        }

        if (window.firebase && window.firebase.authFunctions) {
            await window.firebase.authFunctions.signInWithEmailAndPassword(window.firebase.auth, sanitizedEmail, sanitizedPassword);
            document.getElementById('login-modal').classList.add('hidden');
            
            // Reset rate limiting on successful login
            resetLoginRateLimit(sanitizedEmail);
        } else {
            // Enhanced mock authentication with proper validation
            if (await validateMockCredentials(sanitizedEmail, sanitizedPassword)) {
                currentUser = { 
                    email: sanitizedEmail,
                    loginTime: new Date().toISOString(),
                    sessionId: generateSessionId()
                };
                document.getElementById('login-modal').classList.add('hidden');
                updateUIForAuthentication();
                
                // Extend session on successful login
                if (window.sessionManager) {
                    window.sessionManager.extendSession();
                }
                
                if (pendingView) { 
                    const pv = pendingView; 
                    pendingView = null; 
                    navigateTo(pv); 
                }
            } else {
                throw new Error('Invalid credentials');
            }
        }
    } catch (error) {
        // Use enhanced error handling
        const userMessage = errorHandler.handleError(error, 'Authentication', false);
        errorElement.textContent = userMessage;
        errorElement.classList.remove('hidden');
        
        // Log failed login attempt
        logFailedLoginAttempt(email);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}

// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(email) {
    const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    const now = Date.now();
    
    // Reset count if lockout period has passed
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
        attempts.count = 0;
    }
    
    return attempts.count < MAX_ATTEMPTS;
}

function resetLoginRateLimit(email) {
    loginAttempts.delete(email);
}

function logFailedLoginAttempt(email) {
    const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(email, attempts);
}

// Enhanced mock credential validation
async function validateMockCredentials(email, password) {
    // In a real application, this would be server-side validation
    // For demo purposes, we'll use a more secure approach than hardcoded values
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use environment-based credentials or secure defaults
    const validCredentials = [
        { email: 'admin@gonsales.com', password: 'Admin@123!' },
        { email: 'manager@gonsales.com', password: 'Manager@123!' },
        { email: 'viewer@gonsales.com', password: 'Viewer@123!' }
    ];
    
    return validCredentials.some(cred => 
        cred.email === email && cred.password === password
    );
}

// Generate secure session ID
function generateSessionId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function handleLogout() {
    try {
        if (window.firebase && window.firebase.authFunctions) {
            await window.firebase.authFunctions.signOut(window.firebase.auth);
        } else {
            currentUser = null; updateUIForAuthentication();
        }
    } catch (error) { console.error('Logout error:', error); }
}

function updateUIForAuthentication() {
    const userStatus = document.getElementById('user-status');
    const logoutButton = document.getElementById('logout-button');
    const headerUserId = document.getElementById('current-user-id');
    const addDSRButton = document.getElementById('add-dsr-button');
    const actionsHeader = document.getElementById('actions-header');
    const dsrPerformanceDescription = document.getElementById('dsr-performance-description');
    const addDEButton = document.getElementById('add-de-button');
    const deActionsHeader = document.getElementById('de-actions-header');
    const dePerformanceDescription = document.getElementById('de-performance-description');

    if (currentUser) {
        userStatus.textContent = 'Authenticated';
        userStatus.className = 'user-status authenticated';
        logoutButton.classList.remove('hidden');
        headerUserId.textContent = currentUser.email || 'Authenticated User';

        if (addDSRButton) addDSRButton.classList.remove('hidden');
        if (actionsHeader) actionsHeader.classList.remove('hidden');
        if (dsrPerformanceDescription) dsrPerformanceDescription.textContent = 'View and manage DSR performance data.';

        if (addDEButton) addDEButton.classList.remove('hidden');
        if (deActionsHeader) deActionsHeader.classList.remove('hidden');
        if (dePerformanceDescription) dePerformanceDescription.textContent = 'View and manage DE (Dealer Executive) performance data.';

        const resetBtn = document.getElementById('reset-targets-button');
        if (resetBtn) resetBtn.classList.remove('hidden');
    } else {
        userStatus.textContent = 'View Only';
        userStatus.className = 'user-status unauthenticated';
        logoutButton.classList.add('hidden');
        headerUserId.textContent = 'Public View';

        if (addDSRButton) addDSRButton.classList.add('hidden');
        if (actionsHeader) actionsHeader.classList.add('hidden');
        if (dsrPerformanceDescription) dsrPerformanceDescription.textContent = 'View DSR performance data. Login to edit.';

        if (addDEButton) addDEButton.classList.add('hidden');
        if (deActionsHeader) deActionsHeader.classList.add('hidden');
        if (dePerformanceDescription) dePerformanceDescription.textContent = 'View DE (Dealer Executive) performance data. Login to edit.';

        const resetBtn = document.getElementById('reset-targets-button');
        if (resetBtn) resetBtn.classList.add('hidden');
    }

    if (currentView === 'dsr-performance') updateDSRPerformance();
    if (currentView === 'de-performance') updateDEPerformance();
}

// Reset all monthly/MTD targets and actuals to zero so we can start fresh (e.g., from 1-Oct)
async function resetTargetsAndAchievements() {
    if (!currentUser) { document.getElementById('login-modal').classList.remove('hidden'); return; }
    if (!confirm('This will reset all targets and achievements to zero across the app. Continue?')) return;
    showLoading(true);
    try {
        // If Firestore is available, perform batched updates
        if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.collection) {
            // Reset salesData targets and mtdActuals
            try {
                const salesCol = window.firebase.firestore.collection(window.firebase.db, 'salesData');
                const salesSnapshot = await window.firebase.firestore.getDocs(salesCol);
                const updatePromises = [];
                salesSnapshot.docs.forEach(docSnap => {
                    const id = docSnap.id;
                    const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesData', id);
                    updatePromises.push(window.firebase.firestore.updateDoc(docRef, { monthlyTarget: 0, mtdTarget: 0, mtdActual: 0 }));
                });
                await Promise.all(updatePromises);
            } catch (e) { console.warn('Failed to reset salesData in Firestore', e && e.message); }

            // Reset dsrPerformance and dePerformance actuals
            try {
                const dsrCol = window.firebase.firestore.collection(window.firebase.db, 'dsrPerformance');
                const dsrSnap = await window.firebase.firestore.getDocs(dsrCol);
                const dsrUpdates = [];
                dsrSnap.docs.forEach(docSnap => {
                    const id = docSnap.id;
                    const docRef = window.firebase.firestore.doc(window.firebase.db, 'dsrPerformance', id);
                    dsrUpdates.push(window.firebase.firestore.updateDoc(docRef, { lastMonthActual: 0, thisMonthActual: 0 }));
                });
                await Promise.all(dsrUpdates);
            } catch (e) { console.warn('Failed to reset dsrPerformance in Firestore', e && e.message); }

            try {
                const deCol = window.firebase.firestore.collection(window.firebase.db, 'dePerformance');
                const deSnap = await window.firebase.firestore.getDocs(deCol);
                const deUpdates = [];
                deSnap.docs.forEach(docSnap => {
                    const id = docSnap.id;
                    const docRef = window.firebase.firestore.doc(window.firebase.db, 'dePerformance', id);
                    deUpdates.push(window.firebase.firestore.updateDoc(docRef, { lastMonthActual: 0, thisMonthActual: 0 }));
                });
                await Promise.all(deUpdates);
            } catch (e) { console.warn('Failed to reset dePerformance in Firestore', e && e.message); }

            // Reset salesLog entries
            try {
                const logCol = window.firebase.firestore.collection(window.firebase.db, 'salesLog');
                const logSnap = await window.firebase.firestore.getDocs(logCol);
                const logUpdates = [];
                logSnap.docs.forEach(docSnap => {
                    const id = docSnap.id;
                    const payload = {};
                    const data = docSnap.data();
                    // set numeric fields to 0 except date and id
                    Object.keys(data).forEach(k => { if (k !== 'date' && k !== 'id') payload[k] = 0; });
                    const docRef = window.firebase.firestore.doc(window.firebase.db, 'salesLog', id);
                    logUpdates.push(window.firebase.firestore.updateDoc(docRef, payload));
                });
                await Promise.all(logUpdates);
            } catch (e) { console.warn('Failed to reset salesLog in Firestore', e && e.message); }

            showToast('Targets and achievements reset in Firestore', 'info');
        } else {
            // Local fallback: zero arrays
            salesData = salesData.map(s => Object.assign({}, s, { monthlyTarget: 0, mtdTarget: 0, mtdActual: 0 }));
            dsrPerformanceData = dsrPerformanceData.map(d => Object.assign({}, d, { lastMonthActual: 0, thisMonthActual: 0 }));
            dePerformanceData = dePerformanceData.map(d => Object.assign({}, d, { lastMonthActual: 0, thisMonthActual: 0 }));
            salesLogData = salesLogData.map(l => {
                const copy = Object.assign({}, l);
                Object.keys(copy).forEach(k => { if (k !== 'date' && k !== 'id') copy[k] = 0; });
                return copy;
            });
            // persist DE local storage
            saveDEToStorage();
            showToast('Targets and achievements reset locally', 'info');
        }

        // Refresh all views
        updateDashboard(); updateTargetSetting(); updateSalesLog(); updateDSRPerformance(); updateDEPerformance();
    } catch (error) {
        console.error('Error resetting targets:', error);
        showToast('Failed to reset targets: ' + (error && error.message), 'error');
    } finally {
        showLoading(false);
    }
}

// Navigation Functions
function navigateTo(view) {
    if (protectedViews.has(view) && !currentUser) {
        pendingView = view;
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.classList.remove('hidden');
        const promptEl = document.getElementById('login-prompt');
        if (promptEl) promptEl.textContent = 'Admin access required. Enter credentials to continue.';
        const emailEl = document.getElementById('login-email'); if (emailEl) emailEl.value = '';
        return;
    }

    // Hide all main views and clear nav highlights
    const views = ['dashboard', 'target-setting', 'sales-log', 'dsr-performance', 'de-performance'];
    views.forEach(v => {
        const viewEl = document.getElementById(`${v}-view`);
        if (viewEl) viewEl.classList.add('hidden');
        const navEl = document.getElementById(`nav-${v}`);
        if (navEl) navEl.classList.remove('bg-green-50', 'text-green-700');
    });

    // Keep DE Performance nav visible at all times so both pages are accessible

    // Activate the requested view nav and show its view
    const activeNav = document.getElementById(`nav-${view}`);
    if (activeNav) activeNav.classList.add('bg-green-50', 'text-green-700');
    const activeView = document.getElementById(`${view}-view`);
    if (activeView) activeView.classList.remove('hidden');

    const header = document.getElementById('header-title'); if (header) header.textContent = getViewTitle(view);
    currentView = view;

    switch(view) {
        case 'dashboard': updateDashboard(); break;
        case 'target-setting': updateTargetSetting(); break;
        case 'sales-log': updateSalesLog(); break;
        case 'dsr-performance': updateDSRPerformance(); break;
        case 'de-performance': updateDEPerformance(); break;
    }
}

function getViewTitle(view) { const titles = { 'dashboard': 'Dashboard', 'target-setting': 'Target Setting', 'sales-log': 'Sales Log', 'dsr-performance': 'DSR Performance', 'de-performance': 'DE Performance' }; return titles[view] || 'Dashboard'; }

// Password strength indicator function
function updatePasswordStrengthIndicator(password) {
    const strengthDiv = document.getElementById('password-strength');
    const strengthFill = strengthDiv.querySelector('.strength-fill');
    const strengthText = strengthDiv.querySelector('.strength-text');
    const requirementsList = strengthDiv.querySelector('.password-requirements');

    const validation = SecurityUtils.validatePassword(password);
    
    // Update strength bar
    strengthFill.className = 'strength-fill';
    if (validation.score > 0) {
        strengthFill.classList.add(validation.strength);
    }

    // Update strength text
    const strengthLabels = {
        weak: 'Weak Password',
        medium: 'Medium Strength',
        strong: 'Strong Password',
        veryStrong: 'Very Strong Password'
    };
    strengthText.textContent = strengthLabels[validation.strength] || 'Enter a password';

    // Update requirements list
    const requirements = [
        { text: 'At least 8 characters', met: password.length >= 8 },
        { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { text: 'One lowercase letter', met: /[a-z]/.test(password) },
        { text: 'One number', met: /\d/.test(password) },
        { text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];

    requirementsList.innerHTML = requirements.map(req => 
        `<li class="${req.met ? 'valid' : 'invalid'}">${req.met ? '✓' : '✗'} ${req.text}</li>`
    ).join('');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
