// UI/UX Enhancement and Accessibility Module
// This module provides enhanced user experience, accessibility features, and modern UI components

/**
 * Accessibility Manager for WCAG 2.1 AA compliance
 */
class AccessibilityManager {
    constructor() {
        this.currentTheme = 'light';
        this.fontSize = 'medium';
        this.highContrast = false;
        this.reducedMotion = false;
        this.keyboardNavigation = false;
        this.screenReaderMode = false;
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.detectUserPreferences();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupARIALabels();
        this.createAccessibilityPanel();
    }

    /**
     * Detect user preferences from system settings
     */
    detectUserPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.reducedMotion = true;
            this.applyReducedMotion();
        }

        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.highContrast = true;
            this.applyHighContrast();
        }

        // Detect color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
            this.applyTheme('dark');
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation
            if (e.key === 'Tab') {
                this.keyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }

            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }

            // Arrow key navigation for custom components
            if (e.key.startsWith('Arrow')) {
                this.handleArrowNavigation(e);
            }

            // Enter key handling
            if (e.key === 'Enter') {
                this.handleEnterKey(e);
            }
        });

        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            this.keyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Announce page changes
        this.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modals
        this.trapFocus = (element) => {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        };

        // Restore focus after modal close
        this.restoreFocus = (element) => {
            if (element) {
                element.focus();
            }
        };
    }

    /**
     * Setup ARIA labels and roles
     */
    setupARIALabels() {
        // Add ARIA labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });

        // Add ARIA labels to form inputs
        const inputs = document.querySelectorAll('input:not([aria-label])');
        inputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-label', label.textContent.trim());
            }
        });

        // Add ARIA roles to custom components
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', 'Data table');
        });
    }

    /**
     * Create accessibility control panel
     */
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel hidden';
        panel.innerHTML = `
            <div class="accessibility-header">
                <h3>Accessibility Settings</h3>
                <button class="close-panel" aria-label="Close accessibility panel">×</button>
            </div>
            <div class="accessibility-content">
                <div class="setting-group">
                    <label for="theme-select">Theme:</label>
                    <select id="theme-select">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label for="font-size-select">Font Size:</label>
                    <select id="font-size-select">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="high-contrast-toggle">
                        High Contrast Mode
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="reduced-motion-toggle">
                        Reduced Motion
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="screen-reader-mode-toggle">
                        Screen Reader Mode
                    </label>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.setupAccessibilityControls();
    }

    /**
     * Setup accessibility control event listeners
     */
    setupAccessibilityControls() {
        const panel = document.getElementById('accessibility-panel');
        const closeBtn = panel.querySelector('.close-panel');
        const themeSelect = panel.querySelector('#theme-select');
        const fontSizeSelect = panel.querySelector('#font-size-select');
        const highContrastToggle = panel.querySelector('#high-contrast-toggle');
        const reducedMotionToggle = panel.querySelector('#reduced-motion-toggle');
        const screenReaderToggle = panel.querySelector('#screen-reader-mode-toggle');

        closeBtn.addEventListener('click', () => this.toggleAccessibilityPanel());
        
        themeSelect.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        fontSizeSelect.addEventListener('change', (e) => {
            this.applyFontSize(e.target.value);
        });

        highContrastToggle.addEventListener('change', (e) => {
            this.toggleHighContrast(e.target.checked);
        });

        reducedMotionToggle.addEventListener('change', (e) => {
            this.toggleReducedMotion(e.target.checked);
        });

        screenReaderToggle.addEventListener('change', (e) => {
            this.toggleScreenReaderMode(e.target.checked);
        });
    }

    /**
     * Toggle accessibility panel
     */
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.classList.toggle('hidden');
        
        if (!panel.classList.contains('hidden')) {
            panel.focus();
            this.trapFocus(panel);
        }
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        this.currentTheme = theme;
        this.savePreferences();
    }

    /**
     * Apply font size
     */
    applyFontSize(size) {
        document.body.className = document.body.className.replace(/font-size-\w+/g, '');
        document.body.classList.add(`font-size-${size}`);
        this.fontSize = size;
        this.savePreferences();
    }

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        this.highContrast = enabled;
        this.savePreferences();
    }

    /**
     * Toggle reduced motion
     */
    toggleReducedMotion(enabled) {
        if (enabled) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        this.reducedMotion = enabled;
        this.savePreferences();
    }

    /**
     * Toggle screen reader mode
     */
    toggleScreenReaderMode(enabled) {
        if (enabled) {
            document.body.classList.add('screen-reader-mode');
            this.announceToScreenReader('Screen reader mode enabled');
        } else {
            document.body.classList.remove('screen-reader-mode');
            this.announceToScreenReader('Screen reader mode disabled');
        }
        this.screenReaderMode = enabled;
        this.savePreferences();
    }

    /**
     * Apply reduced motion styles
     */
    applyReducedMotion() {
        document.body.classList.add('reduced-motion');
    }

    /**
     * Apply high contrast styles
     */
    applyHighContrast() {
        document.body.classList.add('high-contrast');
    }

    /**
     * Handle escape key
     */
    handleEscapeKey() {
        const openModals = document.querySelectorAll('.modal:not(.hidden)');
        if (openModals.length > 0) {
            const lastModal = openModals[openModals.length - 1];
            lastModal.classList.add('hidden');
            this.announceToScreenReader('Modal closed');
        }
    }

    /**
     * Handle arrow key navigation
     */
    handleArrowNavigation(e) {
        const focusedElement = document.activeElement;
        const parent = focusedElement.closest('[role="menu"], [role="tablist"], [role="grid"]');
        
        if (parent) {
            e.preventDefault();
            // Implement custom arrow navigation logic here
        }
    }

    /**
     * Handle enter key
     */
    handleEnterKey(e) {
        const focusedElement = document.activeElement;
        
        if (focusedElement.classList.contains('clickable')) {
            e.preventDefault();
            focusedElement.click();
        }
    }

    /**
     * Save accessibility preferences
     */
    savePreferences() {
        const preferences = {
            theme: this.currentTheme,
            fontSize: this.fontSize,
            highContrast: this.highContrast,
            reducedMotion: this.reducedMotion,
            screenReaderMode: this.screenReaderMode
        };
        
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }

    /**
     * Load accessibility preferences
     */
    loadPreferences() {
        const saved = localStorage.getItem('accessibility-preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            this.currentTheme = preferences.theme || 'light';
            this.fontSize = preferences.fontSize || 'medium';
            this.highContrast = preferences.highContrast || false;
            this.reducedMotion = preferences.reducedMotion || false;
            this.screenReaderMode = preferences.screenReaderMode || false;
            
            this.applyTheme(this.currentTheme);
            this.applyFontSize(this.fontSize);
            if (this.highContrast) this.toggleHighContrast(true);
            if (this.reducedMotion) this.toggleReducedMotion(true);
            if (this.screenReaderMode) this.toggleScreenReaderMode(true);
        }
    }
}

/**
 * Enhanced UI Components Manager
 */
class UIComponentsManager {
    constructor() {
        this.components = new Map();
        this.init();
    }

    /**
     * Initialize UI components
     */
    init() {
        this.createLoadingSpinner();
        this.createToastNotifications();
        this.createProgressBars();
        this.createTooltips();
        this.createDropdowns();
        this.createDataTables();
        this.createCharts();
    }

    /**
     * Create enhanced loading spinner
     */
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner hidden';
        spinner.innerHTML = `
            <div class="spinner-content">
                <div class="spinner"></div>
                <div class="spinner-text">Loading...</div>
                <div class="spinner-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
    }

    /**
     * Create enhanced toast notifications
     */
    createToastNotifications() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    /**
     * Show enhanced toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" aria-label="Close notification">×</button>
            </div>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-removing');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('toast-removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });

        // Announce to screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announceToScreenReader(message);
        }
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Create progress bars
     */
    createProgressBars() {
        // This will be used by other components
    }

    /**
     * Create tooltips
     */
    createTooltips() {
        document.addEventListener('mouseenter', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            }
        });

        document.addEventListener('mouseleave', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });
    }

    /**
     * Show tooltip
     */
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        this.currentTooltip = tooltip;
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * Create dropdowns
     */
    createDropdowns() {
        // Enhanced dropdown functionality
    }

    /**
     * Create data tables
     */
    createDataTables() {
        // Enhanced table functionality with sorting, filtering, pagination
    }

    /**
     * Create charts
     */
    createCharts() {
        // Enhanced chart functionality
    }
}

/**
 * User Experience Manager
 */
class UXManager {
    constructor() {
        this.userPreferences = {};
        this.interactionHistory = [];
        this.init();
    }

    /**
     * Initialize UX features
     */
    init() {
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.setupGestures();
        this.setupResponsiveDesign();
        this.trackUserInteractions();
    }

    /**
     * Setup smooth scrolling
     */
    setupSmoothScrolling() {
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    /**
     * Setup animations
     */
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Setup gestures
     */
    setupGestures() {
        // Touch gesture support
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) {
                    // Swipe left
                    this.handleSwipeLeft();
                } else if (diffX < -50) {
                    // Swipe right
                    this.handleSwipeRight();
                }
            }
            
            startX = startY = null;
        });
    }

    /**
     * Setup responsive design
     */
    setupResponsiveDesign() {
        const updateLayout = () => {
            const width = window.innerWidth;
            document.body.classList.toggle('mobile', width < 768);
            document.body.classList.toggle('tablet', width >= 768 && width < 1024);
            document.body.classList.toggle('desktop', width >= 1024);
        };

        window.addEventListener('resize', updateLayout);
        updateLayout();
    }

    /**
     * Track user interactions
     */
    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            this.interactionHistory.push({
                type: 'click',
                target: e.target.tagName,
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY
            });
        });

        document.addEventListener('keydown', (e) => {
            this.interactionHistory.push({
                type: 'keydown',
                key: e.key,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Handle swipe left
     */
    handleSwipeLeft() {
        // Navigate to next view
        const currentView = document.querySelector('.view.active');
        if (currentView) {
            const nextView = currentView.nextElementSibling;
            if (nextView && nextView.classList.contains('view')) {
                this.navigateToView(nextView);
            }
        }
    }

    /**
     * Handle swipe right
     */
    handleSwipeRight() {
        // Navigate to previous view
        const currentView = document.querySelector('.view.active');
        if (currentView) {
            const prevView = currentView.previousElementSibling;
            if (prevView && prevView.classList.contains('view')) {
                this.navigateToView(prevView);
            }
        }
    }

    /**
     * Navigate to view with animation
     */
    navigateToView(view) {
        const currentView = document.querySelector('.view.active');
        if (currentView) {
            currentView.classList.remove('active');
        }
        view.classList.add('active');
        
        // Announce navigation to screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announceToScreenReader(`Navigated to ${view.id}`);
        }
    }

    /**
     * Get user interaction analytics
     */
    getInteractionAnalytics() {
        const now = Date.now();
        const lastHour = this.interactionHistory.filter(i => now - i.timestamp < 3600000);
        
        return {
            totalInteractions: this.interactionHistory.length,
            lastHourInteractions: lastHour.length,
            clickCount: lastHour.filter(i => i.type === 'click').length,
            keyPressCount: lastHour.filter(i => i.type === 'keydown').length,
            mostClickedElement: this.getMostClickedElement(lastHour)
        };
    }

    /**
     * Get most clicked element
     */
    getMostClickedElement(interactions) {
        const clicks = interactions.filter(i => i.type === 'click');
        const elementCounts = {};
        
        clicks.forEach(click => {
            elementCounts[click.target] = (elementCounts[click.target] || 0) + 1;
        });
        
        return Object.entries(elementCounts).reduce((a, b) => 
            elementCounts[a[0]] > elementCounts[b[0]] ? a : b
        )[0];
    }
}

// Initialize managers
const accessibilityManager = new AccessibilityManager();
const uiComponentsManager = new UIComponentsManager();
const uxManager = new UXManager();

// Export for global use
window.accessibilityManager = accessibilityManager;
window.uiComponentsManager = uiComponentsManager;
window.uxManager = uxManager;

// Load saved preferences
accessibilityManager.loadPreferences();

console.log('🎨 UI/UX Enhancement module loaded');
console.log('♿ Accessibility features enabled');
console.log('📱 Responsive design active');
console.log('🎯 User experience tracking enabled');
