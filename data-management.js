// Enhanced Data Management and Validation Module
// This module provides advanced data management, validation, and data processing capabilities

/**
 * Advanced Data Manager with validation, transformation, and persistence
 */
class DataManager {
    constructor() {
        this.dataStores = new Map();
        this.validationRules = new Map();
        this.transformations = new Map();
        this.dataVersion = 1;
        this.init();
    }

    /**
     * Initialize data manager
     */
    init() {
        this.setupDataStores();
        this.setupValidationRules();
        this.setupDataTransformations();
        this.setupDataPersistence();
        this.setupDataSync();
    }

    /**
     * Setup data stores
     */
    setupDataStores() {
        // Sales data store
        this.dataStores.set('sales', {
            schema: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                monthlyTarget: { type: 'number', required: true, min: 0, max: 999999 },
                mtdTarget: { type: 'number', required: true, min: 0, max: 999999 },
                mtdActual: { type: 'number', required: true, min: 0, max: 999999 },
                createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true }
            },
            data: [],
            indexes: ['id', 'name'],
            relationships: []
        });

        // DSR performance data store
        this.dataStores.set('dsr', {
            schema: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                dsrId: { type: 'string', required: true, pattern: /^DSR\d{3}$/ },
                cluster: { type: 'string', required: true, enum: ['North', 'South', 'East', 'West'] },
                captainName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                lastMonthActual: { type: 'number', required: true, min: 0, max: 999999 },
                thisMonthActual: { type: 'number', required: true, min: 0, max: 999999 },
                slab: { type: 'string', required: true, enum: ['Gold', 'Silver', 'Bronze'] },
                createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true }
            },
            data: [],
            indexes: ['id', 'dsrId', 'cluster', 'captainName'],
            relationships: ['captainName -> sales.name']
        });

        // DE performance data store
        this.dataStores.set('de', {
            schema: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                deId: { type: 'string', required: true, pattern: /^DE\d{3}$/ },
                region: { type: 'string', required: true, enum: ['North', 'South', 'East', 'West'] },
                captainName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                lastMonthActual: { type: 'number', required: true, min: 0, max: 999999 },
                thisMonthActual: { type: 'number', required: true, min: 0, max: 999999 },
                slab: { type: 'string', required: true, enum: ['Gold', 'Silver', 'Bronze'] },
                createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true }
            },
            data: [],
            indexes: ['id', 'deId', 'region', 'captainName'],
            relationships: ['captainName -> sales.name']
        });

        // Sales log data store
        this.dataStores.set('salesLog', {
            schema: {
                id: { type: 'string', required: true },
                date: { type: 'string', required: true, pattern: /^\d{1,2}-[A-Za-z]{3}$/ },
                captainA: { type: 'number', required: true, min: 0, max: 999999 },
                captainB: { type: 'number', required: true, min: 0, max: 999999 },
                captainC: { type: 'number', required: true, min: 0, max: 999999 },
                captainD: { type: 'number', required: true, min: 0, max: 999999 },
                total: { type: 'number', required: true, min: 0, max: 999999 },
                createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true }
            },
            data: [],
            indexes: ['id', 'date'],
            relationships: []
        });
    }

    /**
     * Setup validation rules
     */
    setupValidationRules() {
        // Business rules
        this.validationRules.set('sales', {
            monthlyTarget: (value, record) => {
                if (value < record.mtdTarget) {
                    return { valid: false, message: 'Monthly target must be greater than or equal to MTD target' };
                }
                return { valid: true };
            },
            mtdActual: (value, record) => {
                if (value > record.monthlyTarget) {
                    return { valid: false, message: 'MTD actual cannot exceed monthly target' };
                }
                return { valid: true };
            }
        });

        this.validationRules.set('dsr', {
            thisMonthActual: (value, record) => {
                const growthRate = (value - record.lastMonthActual) / record.lastMonthActual;
                if (growthRate > 0.5) {
                    return { valid: false, message: 'Growth rate cannot exceed 50%' };
                }
                return { valid: true };
            }
        });
    }

    /**
     * Setup data transformations
     */
    setupDataTransformations() {
        // Data cleaning transformations
        this.transformations.set('clean', {
            trim: (value) => typeof value === 'string' ? value.trim() : value,
            toUpperCase: (value) => typeof value === 'string' ? value.toUpperCase() : value,
            toLowerCase: (value) => typeof value === 'string' ? value.toLowerCase() : value,
            removeSpecialChars: (value) => typeof value === 'string' ? value.replace(/[^a-zA-Z0-9\s]/g, '') : value
        });

        // Data formatting transformations
        this.transformations.set('format', {
            currency: (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value),
            percentage: (value) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100),
            date: (value) => new Intl.DateTimeFormat('en-US').format(new Date(value)),
            number: (value) => new Intl.NumberFormat('en-US').format(value)
        });

        // Data calculation transformations
        this.transformations.set('calculate', {
            growthRate: (current, previous) => ((current - previous) / previous * 100).toFixed(2),
            achievementRate: (actual, target) => ((actual / target) * 100).toFixed(2),
            variance: (actual, target) => actual - target,
            variancePercentage: (actual, target) => (((actual - target) / target) * 100).toFixed(2)
        });
    }

    /**
     * Setup data persistence
     */
    setupDataPersistence() {
        // Auto-save functionality
        this.autoSaveInterval = setInterval(() => {
            this.saveAllData();
        }, 30000); // Save every 30 seconds

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
    }

    /**
     * Setup data synchronization
     */
    setupDataSync() {
        // Sync with Firebase if available
        if (window.firebase && window.firebase.db) {
            this.syncWithFirebase();
        }

        // Sync with localStorage as backup
        this.syncWithLocalStorage();
    }

    /**
     * Validate data against schema
     */
    validateData(storeName, data) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            return { valid: false, errors: ['Store not found'] };
        }

        const errors = [];
        const schema = store.schema;

        // Validate required fields
        for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            if (data[field] !== undefined && data[field] !== null) {
                // Type validation
                if (rules.type === 'string' && typeof data[field] !== 'string') {
                    errors.push(`${field} must be a string`);
                } else if (rules.type === 'number' && typeof data[field] !== 'number') {
                    errors.push(`${field} must be a number`);
                } else if (rules.type === 'date' && !(data[field] instanceof Date)) {
                    errors.push(`${field} must be a date`);
                }

                // Length validation
                if (rules.minLength && data[field].length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                if (rules.maxLength && data[field].length > rules.maxLength) {
                    errors.push(`${field} must be at most ${rules.maxLength} characters`);
                }

                // Range validation
                if (rules.min !== undefined && data[field] < rules.min) {
                    errors.push(`${field} must be at least ${rules.min}`);
                }
                if (rules.max !== undefined && data[field] > rules.max) {
                    errors.push(`${field} must be at most ${rules.max}`);
                }

                // Pattern validation
                if (rules.pattern && !rules.pattern.test(data[field])) {
                    errors.push(`${field} format is invalid`);
                }

                // Enum validation
                if (rules.enum && !rules.enum.includes(data[field])) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }

        // Business rule validation
        const businessRules = this.validationRules.get(storeName);
        if (businessRules) {
            for (const [field, rule] of Object.entries(businessRules)) {
                if (data[field] !== undefined) {
                    const result = rule(data[field], data);
                    if (!result.valid) {
                        errors.push(result.message);
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Add data to store
     */
    addData(storeName, data) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        // Add metadata
        const enrichedData = {
            ...data,
            id: data.id || this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Validate data
        const validation = this.validateData(storeName, enrichedData);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Check for duplicates
        if (store.data.find(item => item.id === enrichedData.id)) {
            throw new Error(`Record with id ${enrichedData.id} already exists`);
        }

        // Add to store
        store.data.push(enrichedData);
        
        // Update indexes
        this.updateIndexes(storeName, enrichedData);

        // Cache the data
        if (window.cacheManager) {
            window.cacheManager.set(`${storeName}-data`, store.data, { strategy: 'memory', ttl: 5 * 60 * 1000 });
        }

        return enrichedData;
    }

    /**
     * Update data in store
     */
    updateData(storeName, id, updates) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        const index = store.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Record with id ${id} not found`);
        }

        // Merge updates with existing data
        const updatedData = {
            ...store.data[index],
            ...updates,
            updatedAt: new Date()
        };

        // Validate updated data
        const validation = this.validateData(storeName, updatedData);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Update the record
        store.data[index] = updatedData;

        // Update indexes
        this.updateIndexes(storeName, updatedData);

        // Cache the data
        if (window.cacheManager) {
            window.cacheManager.set(`${storeName}-data`, store.data, { strategy: 'memory', ttl: 5 * 60 * 1000 });
        }

        return updatedData;
    }

    /**
     * Delete data from store
     */
    deleteData(storeName, id) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        const index = store.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Record with id ${id} not found`);
        }

        const deletedData = store.data.splice(index, 1)[0];

        // Update indexes
        this.updateIndexes(storeName, deletedData, 'delete');

        // Cache the data
        if (window.cacheManager) {
            window.cacheManager.set(`${storeName}-data`, store.data, { strategy: 'memory', ttl: 5 * 60 * 1000 });
        }

        return deletedData;
    }

    /**
     * Query data from store
     */
    queryData(storeName, options = {}) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        let results = [...store.data];

        // Apply filters
        if (options.filter) {
            results = results.filter(options.filter);
        }

        // Apply sorting
        if (options.sort) {
            results.sort((a, b) => {
                for (const [field, direction] of Object.entries(options.sort)) {
                    const aVal = a[field];
                    const bVal = b[field];
                    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    if (comparison !== 0) {
                        return direction === 'desc' ? -comparison : comparison;
                    }
                }
                return 0;
            });
        }

        // Apply pagination
        if (options.limit || options.offset) {
            const offset = options.offset || 0;
            const limit = options.limit || results.length;
            results = results.slice(offset, offset + limit);
        }

        return results;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Update indexes
     */
    updateIndexes(storeName, data, operation = 'add') {
        const store = this.dataStores.get(storeName);
        if (!store) return;

        // This would implement actual indexing logic
        // For now, we'll just maintain the data structure
    }

    /**
     * Save all data
     */
    saveAllData() {
        for (const [storeName, store] of this.dataStores) {
            try {
                localStorage.setItem(`data-${storeName}`, JSON.stringify(store.data));
            } catch (error) {
                console.error(`Failed to save ${storeName} data:`, error);
            }
        }
    }

    /**
     * Load all data
     */
    loadAllData() {
        for (const [storeName, store] of this.dataStores) {
            try {
                const saved = localStorage.getItem(`data-${storeName}`);
                if (saved) {
                    store.data = JSON.parse(saved);
                }
            } catch (error) {
                console.error(`Failed to load ${storeName} data:`, error);
            }
        }
    }

    /**
     * Sync with Firebase
     */
    async syncWithFirebase() {
        if (!window.firebase || !window.firebase.db) return;

        try {
            for (const [storeName, store] of this.dataStores) {
                const collectionRef = window.firebase.firestore.collection(window.firebase.db, storeName);
                const snapshot = await window.firebase.firestore.getDocs(collectionRef);
                
                store.data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
        } catch (error) {
            console.error('Firebase sync failed:', error);
        }
    }

    /**
     * Sync with localStorage
     */
    syncWithLocalStorage() {
        this.loadAllData();
    }

    /**
     * Get data statistics
     */
    getDataStatistics() {
        const stats = {};
        
        for (const [storeName, store] of this.dataStores) {
            stats[storeName] = {
                count: store.data.length,
                lastUpdated: store.data.length > 0 ? 
                    Math.max(...store.data.map(item => new Date(item.updatedAt).getTime())) : null,
                schema: Object.keys(store.schema).length
            };
        }
        
        return stats;
    }

    /**
     * Export data
     */
    exportData(storeName, format = 'json') {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        switch (format) {
            case 'json':
                return JSON.stringify(store.data, null, 2);
            case 'csv':
                return this.convertToCSV(store.data);
            case 'excel':
                return this.convertToExcel(store.data);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Convert data to CSV
     */
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Convert data to Excel (simplified)
     */
    convertToExcel(data) {
        // This would use a library like SheetJS in a real implementation
        return this.convertToCSV(data);
    }

    /**
     * Import data
     */
    importData(storeName, data, options = {}) {
        const store = this.dataStores.get(storeName);
        if (!store) {
            throw new Error(`Store ${storeName} not found`);
        }

        const importedData = Array.isArray(data) ? data : [data];
        const results = {
            success: [],
            errors: []
        };

        for (const item of importedData) {
            try {
                const result = this.addData(storeName, item);
                results.success.push(result);
            } catch (error) {
                results.errors.push({
                    data: item,
                    error: error.message
                });
            }
        }

        return results;
    }
}

/**
 * Data Analytics and Reporting Manager
 */
class DataAnalyticsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.reports = new Map();
        this.init();
    }

    /**
     * Initialize analytics manager
     */
    init() {
        this.setupDefaultReports();
        this.setupDataAggregations();
    }

    /**
     * Setup default reports
     */
    setupDefaultReports() {
        // Sales performance report
        this.reports.set('sales-performance', {
            name: 'Sales Performance Report',
            description: 'Comprehensive sales performance analysis',
            dataSource: 'sales',
            metrics: ['monthlyTarget', 'mtdTarget', 'mtdActual'],
            aggregations: ['sum', 'avg', 'min', 'max'],
            groupings: ['name', 'createdAt'],
            filters: [],
            format: 'table'
        });

        // DSR performance report
        this.reports.set('dsr-performance', {
            name: 'DSR Performance Report',
            description: 'DSR performance analysis by cluster and captain',
            dataSource: 'dsr',
            metrics: ['lastMonthActual', 'thisMonthActual'],
            aggregations: ['sum', 'avg'],
            groupings: ['cluster', 'captainName', 'slab'],
            filters: [],
            format: 'chart'
        });

        // Growth analysis report
        this.reports.set('growth-analysis', {
            name: 'Growth Analysis Report',
            description: 'Month-over-month growth analysis',
            dataSource: 'dsr',
            metrics: ['growthRate'],
            aggregations: ['avg', 'min', 'max'],
            groupings: ['cluster', 'slab'],
            filters: [],
            format: 'chart'
        });
    }

    /**
     * Setup data aggregations
     */
    setupDataAggregations() {
        this.aggregations = {
            sum: (values) => values.reduce((sum, val) => sum + (val || 0), 0),
            avg: (values) => values.reduce((sum, val) => sum + (val || 0), 0) / values.length,
            min: (values) => Math.min(...values.filter(val => val !== null && val !== undefined)),
            max: (values) => Math.max(...values.filter(val => val !== null && val !== undefined)),
            count: (values) => values.length,
            median: (values) => {
                const sorted = values.filter(val => val !== null && val !== undefined).sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
            }
        };
    }

    /**
     * Generate report
     */
    generateReport(reportId, options = {}) {
        const report = this.reports.get(reportId);
        if (!report) {
            throw new Error(`Report ${reportId} not found`);
        }

        const data = this.dataManager.queryData(report.dataSource, {
            filter: options.filter,
            sort: options.sort
        });

        const result = {
            reportId,
            name: report.name,
            description: report.description,
            generatedAt: new Date(),
            data: data,
            summary: this.generateSummary(data, report),
            charts: this.generateCharts(data, report),
            insights: this.generateInsights(data, report)
        };

        return result;
    }

    /**
     * Generate summary statistics
     */
    generateSummary(data, report) {
        const summary = {};
        
        for (const metric of report.metrics) {
            const values = data.map(item => item[metric]).filter(val => val !== null && val !== undefined);
            
            summary[metric] = {};
            for (const [aggName, aggFunc] of Object.entries(this.aggregations)) {
                if (report.aggregations.includes(aggName)) {
                    summary[metric][aggName] = aggFunc(values);
                }
            }
        }
        
        return summary;
    }

    /**
     * Generate charts data
     */
    generateCharts(data, report) {
        const charts = {};
        
        // Group data for charts
        for (const group of report.groupings) {
            const grouped = {};
            data.forEach(item => {
                const key = item[group];
                if (!grouped[key]) {
                    grouped[key] = [];
                }
                grouped[key].push(item);
            });
            
            charts[group] = Object.entries(grouped).map(([key, items]) => ({
                label: key,
                data: items.map(item => item[report.metrics[0]] || 0)
            }));
        }
        
        return charts;
    }

    /**
     * Generate insights
     */
    generateInsights(data, report) {
        const insights = [];
        
        if (data.length === 0) {
            insights.push('No data available for analysis');
            return insights;
        }
        
        // Performance insights
        if (report.dataSource === 'sales') {
            const totalTarget = data.reduce((sum, item) => sum + (item.monthlyTarget || 0), 0);
            const totalActual = data.reduce((sum, item) => sum + (item.mtdActual || 0), 0);
            const achievementRate = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : 0;
            
            insights.push(`Overall achievement rate: ${achievementRate}%`);
            
            if (achievementRate > 100) {
                insights.push('🎉 Exceeding targets! Great performance.');
            } else if (achievementRate > 80) {
                insights.push('📈 Good progress towards targets.');
            } else {
                insights.push('⚠️ Below target performance. Review strategy.');
            }
        }
        
        // Growth insights
        if (report.dataSource === 'dsr') {
            const growthRates = data.map(item => {
                if (item.lastMonthActual > 0) {
                    return ((item.thisMonthActual - item.lastMonthActual) / item.lastMonthActual * 100);
                }
                return 0;
            });
            
            const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
            
            insights.push(`Average growth rate: ${avgGrowth.toFixed(1)}%`);
            
            if (avgGrowth > 10) {
                insights.push('🚀 Strong growth momentum!');
            } else if (avgGrowth > 0) {
                insights.push('📊 Positive growth trend.');
            } else {
                insights.push('📉 Negative growth. Focus on improvement.');
            }
        }
        
        return insights;
    }

    /**
     * Get available reports
     */
    getAvailableReports() {
        return Array.from(this.reports.values()).map(report => ({
            id: report.id,
            name: report.name,
            description: report.description,
            dataSource: report.dataSource
        }));
    }

    /**
     * Create custom report
     */
    createCustomReport(config) {
        const reportId = `custom-${Date.now()}`;
        this.reports.set(reportId, {
            ...config,
            id: reportId,
            createdAt: new Date()
        });
        
        return reportId;
    }
}

// Initialize managers
const dataManager = new DataManager();
const analyticsManager = new DataAnalyticsManager(dataManager);

// Export for global use
window.dataManager = dataManager;
window.analyticsManager = analyticsManager;

// Load existing data
dataManager.loadAllData();

console.log('📊 Enhanced Data Management module loaded');
console.log('🔍 Data validation and transformation active');
console.log('📈 Analytics and reporting capabilities enabled');
