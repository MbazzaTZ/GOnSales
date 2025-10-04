// Monitoring and Analytics Module
// This module provides comprehensive monitoring, analytics, and performance tracking capabilities

/**
 * Application Monitoring Manager
 */
class MonitoringManager {
    constructor() {
        this.metrics = new Map();
        this.events = [];
        this.alerts = [];
        this.performanceData = [];
        this.userSessions = new Map();
        this.init();
    }

    /**
     * Initialize monitoring
     */
    init() {
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupUserAnalytics();
        this.setupBusinessMetrics();
        this.setupRealTimeMonitoring();
        this.setupAlerting();
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Core Web Vitals monitoring
        this.monitorCoreWebVitals();
        
        // Custom performance metrics
        this.setupCustomMetrics();
        
        // Performance observer
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordPerformanceMetric(entry);
                }
            });
            
            observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.recordMetric('lcp', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric('fid', entry.processingStart - entry.startTime);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        if ('PerformanceObserver' in window) {
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.recordMetric('cls', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    /**
     * Setup custom metrics
     */
    setupCustomMetrics() {
        // Page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.recordMetric('pageLoadTime', loadTime);
        });

        // Time to interactive
        this.measureTimeToInteractive();

        // Memory usage
        this.monitorMemoryUsage();

        // Network performance
        this.monitorNetworkPerformance();
    }

    /**
     * Measure time to interactive
     */
    measureTimeToInteractive() {
        const startTime = performance.now();
        let interactiveTime = null;

        const checkInteractive = () => {
            if (document.readyState === 'complete' && !interactiveTime) {
                interactiveTime = performance.now() - startTime;
                this.recordMetric('timeToInteractive', interactiveTime);
            } else if (!interactiveTime) {
                setTimeout(checkInteractive, 100);
            }
        };

        checkInteractive();
    }

    /**
     * Monitor memory usage
     */
    monitorMemoryUsage() {
        if (performance.memory) {
            setInterval(() => {
                const memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
                this.recordMetric('memoryUsage', memory);
            }, 30000); // Every 30 seconds
        }
    }

    /**
     * Monitor network performance
     */
    monitorNetworkPerformance() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.recordMetric('networkType', connection.effectiveType);
            this.recordMetric('networkSpeed', connection.downlink);
            this.recordMetric('networkRTT', connection.rtt);
        }
    }

    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date()
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError({
                    type: 'resource',
                    message: `Failed to load ${event.target.tagName}`,
                    src: event.target.src || event.target.href,
                    timestamp: new Date()
                });
            }
        }, true);
    }

    /**
     * Setup user analytics
     */
    setupUserAnalytics() {
        // Track user sessions
        this.trackUserSession();

        // Track user interactions
        this.trackUserInteractions();

        // Track page views
        this.trackPageViews();

        // Track user engagement
        this.trackUserEngagement();
    }

    /**
     * Track user session
     */
    trackUserSession() {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            startTime: new Date(),
            pageViews: 0,
            interactions: 0,
            errors: 0,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.userSessions.set(sessionId, session);

        // Update session on page unload
        window.addEventListener('beforeunload', () => {
            const currentSession = this.userSessions.get(sessionId);
            if (currentSession) {
                currentSession.endTime = new Date();
                currentSession.duration = currentSession.endTime - currentSession.startTime;
                this.saveSessionData(currentSession);
            }
        });
    }

    /**
     * Track user interactions
     */
    trackUserInteractions() {
        const events = ['click', 'scroll', 'keydown', 'mousemove'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.recordUserEvent({
                    type: eventType,
                    target: event.target.tagName,
                    timestamp: new Date(),
                    x: event.clientX,
                    y: event.clientY
                });
            }, { passive: true });
        });
    }

    /**
     * Track page views
     */
    trackPageViews() {
        this.recordUserEvent({
            type: 'pageview',
            url: window.location.href,
            title: document.title,
            timestamp: new Date()
        });
    }

    /**
     * Track user engagement
     */
    trackUserEngagement() {
        let engagementTime = 0;
        let lastActiveTime = Date.now();
        let isActive = true;

        // Track active time
        const trackActivity = () => {
            if (isActive) {
                engagementTime += 1000; // 1 second
            }
            setTimeout(trackActivity, 1000);
        };

        // Detect user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                lastActiveTime = Date.now();
                isActive = true;
            }, { passive: true });
        });

        // Detect inactivity
        setInterval(() => {
            if (Date.now() - lastActiveTime > 30000) { // 30 seconds
                isActive = false;
            }
        }, 5000);

        trackActivity();
    }

    /**
     * Setup business metrics
     */
    setupBusinessMetrics() {
        // Track data operations
        this.trackDataOperations();

        // Track user authentication
        this.trackAuthentication();

        // Track feature usage
        this.trackFeatureUsage();
    }

    /**
     * Track data operations
     */
    trackDataOperations() {
        // This would be integrated with the data manager
        const originalAddData = window.dataManager?.addData;
        if (originalAddData) {
            window.dataManager.addData = (...args) => {
                this.recordBusinessMetric('dataOperation', { type: 'add', store: args[0] });
                return originalAddData.apply(window.dataManager, args);
            };
        }
    }

    /**
     * Track authentication
     */
    trackAuthentication() {
        // Track login attempts
        const originalHandleLogin = window.handleLogin;
        if (originalHandleLogin) {
            window.handleLogin = async (...args) => {
                this.recordBusinessMetric('authentication', { type: 'login_attempt', email: args[0] });
                try {
                    const result = await originalHandleLogin.apply(this, args);
                    this.recordBusinessMetric('authentication', { type: 'login_success', email: args[0] });
                    return result;
                } catch (error) {
                    this.recordBusinessMetric('authentication', { type: 'login_failed', email: args[0], error: error.message });
                    throw error;
                }
            };
        }
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage() {
        // Track navigation
        const originalNavigateTo = window.navigateTo;
        if (originalNavigateTo) {
            window.navigateTo = (...args) => {
                this.recordBusinessMetric('featureUsage', { type: 'navigation', view: args[0] });
                return originalNavigateTo.apply(this, args);
            };
        }
    }

    /**
     * Setup real-time monitoring
     */
    setupRealTimeMonitoring() {
        // Real-time dashboard updates
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000); // Every 5 seconds

        // Real-time alerts
        setInterval(() => {
            this.checkAlerts();
        }, 10000); // Every 10 seconds
    }

    /**
     * Setup alerting
     */
    setupAlerting() {
        // Performance alerts
        this.alerts.push({
            id: 'high-memory-usage',
            name: 'High Memory Usage',
            condition: (metrics) => {
                const memory = metrics.get('memoryUsage');
                return memory && memory.used > memory.limit * 0.8;
            },
            severity: 'warning',
            message: 'Memory usage is above 80%'
        });

        // Error rate alerts
        this.alerts.push({
            id: 'high-error-rate',
            name: 'High Error Rate',
            condition: (metrics) => {
                const errors = this.events.filter(e => e.type === 'error');
                const recentErrors = errors.filter(e => Date.now() - e.timestamp < 300000); // Last 5 minutes
                return recentErrors.length > 10;
            },
            severity: 'critical',
            message: 'Error rate is unusually high'
        });

        // Performance alerts
        this.alerts.push({
            id: 'slow-page-load',
            name: 'Slow Page Load',
            condition: (metrics) => {
                const loadTime = metrics.get('pageLoadTime');
                return loadTime && loadTime > 3000; // 3 seconds
            },
            severity: 'warning',
            message: 'Page load time is above 3 seconds'
        });
    }

    /**
     * Record performance metric
     */
    recordPerformanceMetric(entry) {
        const metric = {
            name: entry.name,
            type: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: new Date()
        };

        this.performanceData.push(metric);
        this.recordMetric(entry.name, entry.duration);
    }

    /**
     * Record metric
     */
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        const metricData = {
            value,
            timestamp: new Date()
        };
        
        this.metrics.get(name).push(metricData);
        
        // Keep only last 1000 entries per metric
        if (this.metrics.get(name).length > 1000) {
            this.metrics.get(name).shift();
        }
    }

    /**
     * Record error
     */
    recordError(error) {
        this.events.push(error);
        
        // Update session error count
        const currentSession = Array.from(this.userSessions.values()).find(s => !s.endTime);
        if (currentSession) {
            currentSession.errors++;
        }
        
        // Keep only last 1000 errors
        if (this.events.length > 1000) {
            this.events.shift();
        }
    }

    /**
     * Record user event
     */
    recordUserEvent(event) {
        this.events.push(event);
        
        // Update session interaction count
        const currentSession = Array.from(this.userSessions.values()).find(s => !s.endTime);
        if (currentSession) {
            currentSession.interactions++;
        }
    }

    /**
     * Record business metric
     */
    recordBusinessMetric(category, data) {
        this.recordUserEvent({
            type: 'business',
            category,
            data,
            timestamp: new Date()
        });
    }

    /**
     * Update real-time metrics
     */
    updateRealTimeMetrics() {
        const realTimeData = {
            activeUsers: this.userSessions.size,
            errorRate: this.getErrorRate(),
            averageResponseTime: this.getAverageResponseTime(),
            memoryUsage: this.getCurrentMemoryUsage(),
            timestamp: new Date()
        };

        // Emit real-time data (would integrate with WebSocket in production)
        this.emitRealTimeData(realTimeData);
    }

    /**
     * Check alerts
     */
    checkAlerts() {
        for (const alert of this.alerts) {
            if (alert.condition(this.metrics)) {
                this.triggerAlert(alert);
            }
        }
    }

    /**
     * Trigger alert
     */
    triggerAlert(alert) {
        console.warn(`🚨 Alert: ${alert.name} - ${alert.message}`);
        
        // Show user notification
        if (window.uiComponentsManager) {
            window.uiComponentsManager.showToast(alert.message, alert.severity === 'critical' ? 'error' : 'warning');
        }
        
        // Store alert
        this.alerts.push({
            ...alert,
            triggeredAt: new Date(),
            resolved: false
        });
    }

    /**
     * Get error rate
     */
    getErrorRate() {
        const now = Date.now();
        const last5Minutes = this.events.filter(e => 
            e.type === 'error' && now - e.timestamp < 300000
        );
        return last5Minutes.length;
    }

    /**
     * Get average response time
     */
    getAverageResponseTime() {
        const responseTimes = this.metrics.get('pageLoadTime') || [];
        if (responseTimes.length === 0) return 0;
        
        const sum = responseTimes.reduce((acc, metric) => acc + metric.value, 0);
        return sum / responseTimes.length;
    }

    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Emit real-time data
     */
    emitRealTimeData(data) {
        // This would integrate with WebSocket or Server-Sent Events
        if (window.realTimeDashboard) {
            window.realTimeDashboard.updateData(data);
        }
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Save session data
     */
    saveSessionData(session) {
        try {
            const sessions = JSON.parse(localStorage.getItem('user-sessions') || '[]');
            sessions.push(session);
            localStorage.setItem('user-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Failed to save session data:', error);
        }
    }

    /**
     * Get monitoring dashboard data
     */
    getDashboardData() {
        return {
            performance: {
                pageLoadTime: this.getMetricAverage('pageLoadTime'),
                timeToInteractive: this.getMetricAverage('timeToInteractive'),
                lcp: this.getMetricAverage('lcp'),
                fid: this.getMetricAverage('fid'),
                cls: this.getMetricAverage('cls')
            },
            errors: {
                total: this.events.filter(e => e.type === 'error').length,
                last5Minutes: this.getErrorRate(),
                byType: this.getErrorsByType()
            },
            users: {
                active: this.userSessions.size,
                total: this.getTotalUsers(),
                engagement: this.getUserEngagement()
            },
            business: {
                dataOperations: this.getBusinessMetricCount('dataOperation'),
                authentications: this.getBusinessMetricCount('authentication'),
                featureUsage: this.getBusinessMetricCount('featureUsage')
            }
        };
    }

    /**
     * Get metric average
     */
    getMetricAverage(metricName) {
        const metrics = this.metrics.get(metricName) || [];
        if (metrics.length === 0) return 0;
        
        const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
        return sum / metrics.length;
    }

    /**
     * Get errors by type
     */
    getErrorsByType() {
        const errors = this.events.filter(e => e.type === 'error');
        const types = {};
        
        errors.forEach(error => {
            types[error.type] = (types[error.type] || 0) + 1;
        });
        
        return types;
    }

    /**
     * Get total users
     */
    getTotalUsers() {
        try {
            const sessions = JSON.parse(localStorage.getItem('user-sessions') || '[]');
            return sessions.length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get user engagement
     */
    getUserEngagement() {
        // This would calculate engagement metrics
        return {
            averageSessionDuration: 0,
            pagesPerSession: 0,
            bounceRate: 0
        };
    }

    /**
     * Get business metric count
     */
    getBusinessMetricCount(category) {
        return this.events.filter(e => 
            e.type === 'business' && e.category === category
        ).length;
    }

    /**
     * Export monitoring data
     */
    exportData(format = 'json') {
        const data = {
            metrics: Object.fromEntries(this.metrics),
            events: this.events,
            performanceData: this.performanceData,
            sessions: Array.from(this.userSessions.values()),
            alerts: this.alerts,
            exportedAt: new Date()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Convert data to CSV
     */
    convertToCSV(data) {
        // Simplified CSV conversion
        const csv = [];
        csv.push('Metric,Value,Timestamp');
        
        for (const [metricName, metrics] of data.metrics) {
            metrics.forEach(metric => {
                csv.push(`${metricName},${metric.value},${metric.timestamp}`);
            });
        }
        
        return csv.join('\n');
    }
}

/**
 * Analytics Dashboard Manager
 */
class AnalyticsDashboardManager {
    constructor(monitoringManager) {
        this.monitoringManager = monitoringManager;
        this.dashboards = new Map();
        this.widgets = new Map();
        this.init();
    }

    /**
     * Initialize analytics dashboard
     */
    init() {
        this.setupDefaultDashboards();
        this.setupDefaultWidgets();
        this.setupRealTimeUpdates();
    }

    /**
     * Setup default dashboards
     */
    setupDefaultDashboards() {
        // Performance dashboard
        this.dashboards.set('performance', {
            id: 'performance',
            name: 'Performance Dashboard',
            description: 'Application performance metrics',
            widgets: ['page-load-time', 'memory-usage', 'error-rate', 'user-activity'],
            layout: 'grid',
            refreshInterval: 5000
        });

        // Business dashboard
        this.dashboards.set('business', {
            id: 'business',
            name: 'Business Dashboard',
            description: 'Business metrics and KPIs',
            widgets: ['data-operations', 'user-authentication', 'feature-usage', 'growth-metrics'],
            layout: 'grid',
            refreshInterval: 10000
        });

        // User analytics dashboard
        this.dashboards.set('users', {
            id: 'users',
            name: 'User Analytics Dashboard',
            description: 'User behavior and engagement',
            widgets: ['active-users', 'session-duration', 'page-views', 'user-engagement'],
            layout: 'grid',
            refreshInterval: 15000
        });
    }

    /**
     * Setup default widgets
     */
    setupDefaultWidgets() {
        // Page load time widget
        this.widgets.set('page-load-time', {
            id: 'page-load-time',
            name: 'Page Load Time',
            type: 'metric',
            dataSource: 'performance.pageLoadTime',
            format: 'duration',
            threshold: { warning: 2000, critical: 3000 }
        });

        // Memory usage widget
        this.widgets.set('memory-usage', {
            id: 'memory-usage',
            name: 'Memory Usage',
            type: 'chart',
            dataSource: 'performance.memoryUsage',
            format: 'percentage',
            chartType: 'line'
        });

        // Error rate widget
        this.widgets.set('error-rate', {
            id: 'error-rate',
            name: 'Error Rate',
            type: 'metric',
            dataSource: 'errors.last5Minutes',
            format: 'number',
            threshold: { warning: 5, critical: 10 }
        });

        // Active users widget
        this.widgets.set('active-users', {
            id: 'active-users',
            name: 'Active Users',
            type: 'metric',
            dataSource: 'users.active',
            format: 'number'
        });
    }

    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        setInterval(() => {
            this.updateAllDashboards();
        }, 5000);
    }

    /**
     * Update all dashboards
     */
    updateAllDashboards() {
        for (const [dashboardId, dashboard] of this.dashboards) {
            this.updateDashboard(dashboardId);
        }
    }

    /**
     * Update specific dashboard
     */
    updateDashboard(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return;

        const data = this.monitoringManager.getDashboardData();
        
        // Update widgets
        dashboard.widgets.forEach(widgetId => {
            this.updateWidget(widgetId, data);
        });
    }

    /**
     * Update widget
     */
    updateWidget(widgetId, data) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return;

        // Get widget data based on dataSource
        const widgetData = this.getWidgetData(widget.dataSource, data);
        
        // Emit widget update event
        this.emitWidgetUpdate(widgetId, widgetData);
    }

    /**
     * Get widget data
     */
    getWidgetData(dataSource, data) {
        const parts = dataSource.split('.');
        let result = data;
        
        for (const part of parts) {
            result = result[part];
            if (result === undefined) return null;
        }
        
        return result;
    }

    /**
     * Emit widget update event
     */
    emitWidgetUpdate(widgetId, data) {
        const event = new CustomEvent('widgetUpdate', {
            detail: { widgetId, data }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get dashboard data
     */
    getDashboardData(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return null;

        const data = this.monitoringManager.getDashboardData();
        const widgetData = {};

        dashboard.widgets.forEach(widgetId => {
            const widget = this.widgets.get(widgetId);
            if (widget) {
                widgetData[widgetId] = this.getWidgetData(widget.dataSource, data);
            }
        });

        return {
            dashboard,
            widgetData,
            lastUpdated: new Date()
        };
    }

    /**
     * Create custom dashboard
     */
    createCustomDashboard(config) {
        const dashboardId = `custom-${Date.now()}`;
        this.dashboards.set(dashboardId, {
            ...config,
            id: dashboardId,
            createdAt: new Date()
        });
        
        return dashboardId;
    }

    /**
     * Create custom widget
     */
    createCustomWidget(config) {
        const widgetId = `custom-${Date.now()}`;
        this.widgets.set(widgetId, {
            ...config,
            id: widgetId,
            createdAt: new Date()
        });
        
        return widgetId;
    }
}

// Initialize managers
const monitoringManager = new MonitoringManager();
const analyticsDashboardManager = new AnalyticsDashboardManager(monitoringManager);

// Export for global use
window.monitoringManager = monitoringManager;
window.analyticsDashboardManager = analyticsDashboardManager;

console.log('📊 Monitoring and Analytics module loaded');
console.log('🔍 Real-time monitoring active');
console.log('📈 Analytics dashboard ready');
console.log('🚨 Alerting system enabled');
