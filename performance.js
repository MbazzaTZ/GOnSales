// Performance optimization and caching utilities
// This module handles caching, lazy loading, and performance optimizations

/**
 * Advanced caching system with multiple strategies
 */
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.localStorageCache = new Map();
        this.sessionStorageCache = new Map();
        this.cacheConfig = {
            memory: { maxSize: 100, ttl: 5 * 60 * 1000 }, // 5 minutes
            localStorage: { maxSize: 50, ttl: 60 * 60 * 1000 }, // 1 hour
            sessionStorage: { maxSize: 25, ttl: 30 * 60 * 1000 } // 30 minutes
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }

    /**
     * Set cache entry with automatic strategy selection
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {object} options - Cache options
     */
    set(key, value, options = {}) {
        const {
            strategy = 'auto',
            ttl = null,
            priority = 'normal'
        } = options;

        const cacheEntry = {
            value: this.serialize(value),
            timestamp: Date.now(),
            ttl: ttl || this.getDefaultTTL(strategy),
            priority,
            accessCount: 0,
            lastAccess: Date.now()
        };

        switch (strategy) {
            case 'memory':
                this.setMemoryCache(key, cacheEntry);
                break;
            case 'localStorage':
                this.setLocalStorageCache(key, cacheEntry);
                break;
            case 'sessionStorage':
                this.setSessionStorageCache(key, cacheEntry);
                break;
            case 'auto':
                this.setAutoCache(key, cacheEntry);
                break;
        }
    }

    /**
     * Get cache entry with automatic strategy selection
     * @param {string} key - Cache key
     * @param {string} strategy - Cache strategy
     * @returns {any} - Cached value or null
     */
    get(key, strategy = 'auto') {
        let cacheEntry = null;

        if (strategy === 'auto') {
            // Try memory first, then sessionStorage, then localStorage
            cacheEntry = this.getMemoryCache(key) || 
                        this.getSessionStorageCache(key) || 
                        this.getLocalStorageCache(key);
        } else {
            switch (strategy) {
                case 'memory':
                    cacheEntry = this.getMemoryCache(key);
                    break;
                case 'localStorage':
                    cacheEntry = this.getLocalStorageCache(key);
                    break;
                case 'sessionStorage':
                    cacheEntry = this.getSessionStorageCache(key);
                    break;
            }
        }

        if (cacheEntry && this.isValid(cacheEntry)) {
            cacheEntry.accessCount++;
            cacheEntry.lastAccess = Date.now();
            return this.deserialize(cacheEntry.value);
        }

        return null;
    }

    /**
     * Check if cache entry is valid
     * @param {object} entry - Cache entry
     * @returns {boolean} - Is valid
     */
    isValid(entry) {
        return Date.now() - entry.timestamp < entry.ttl;
    }

    /**
     * Set memory cache entry
     * @param {string} key - Cache key
     * @param {object} entry - Cache entry
     */
    setMemoryCache(key, entry) {
        if (this.memoryCache.size >= this.cacheConfig.memory.maxSize) {
            this.evictMemoryCache();
        }
        this.memoryCache.set(key, entry);
    }

    /**
     * Set localStorage cache entry
     * @param {string} key - Cache key
     * @param {object} entry - Cache entry
     */
    setLocalStorageCache(key, entry) {
        try {
            const existing = this.getLocalStorageKeys();
            if (existing.length >= this.cacheConfig.localStorage.maxSize) {
                this.evictLocalStorageCache();
            }
            localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
        } catch (e) {
            console.warn('localStorage cache failed:', e);
        }
    }

    /**
     * Set sessionStorage cache entry
     * @param {string} key - Cache key
     * @param {object} entry - Cache entry
     */
    setSessionStorageCache(key, entry) {
        try {
            const existing = this.getSessionStorageKeys();
            if (existing.length >= this.cacheConfig.sessionStorage.maxSize) {
                this.evictSessionStorageCache();
            }
            sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
        } catch (e) {
            console.warn('sessionStorage cache failed:', e);
        }
    }

    /**
     * Auto-select cache strategy based on data size and type
     * @param {string} key - Cache key
     * @param {object} entry - Cache entry
     */
    setAutoCache(key, entry) {
        const dataSize = JSON.stringify(entry.value).length;
        
        if (dataSize < 1024) { // < 1KB
            this.setMemoryCache(key, entry);
        } else if (dataSize < 10240) { // < 10KB
            this.setSessionStorageCache(key, entry);
        } else { // >= 10KB
            this.setLocalStorageCache(key, entry);
        }
    }

    /**
     * Get memory cache entry
     * @param {string} key - Cache key
     * @returns {object|null} - Cache entry
     */
    getMemoryCache(key) {
        return this.memoryCache.get(key) || null;
    }

    /**
     * Get localStorage cache entry
     * @param {string} key - Cache key
     * @returns {object|null} - Cache entry
     */
    getLocalStorageCache(key) {
        try {
            const item = localStorage.getItem(`cache_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Get sessionStorage cache entry
     * @param {string} key - Cache key
     * @returns {object|null} - Cache entry
     */
    getSessionStorageCache(key) {
        try {
            const item = sessionStorage.getItem(`cache_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Evict least recently used memory cache entry
     */
    evictMemoryCache() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.memoryCache) {
            if (entry.lastAccess < oldestTime) {
                oldestTime = entry.lastAccess;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
        }
    }

    /**
     * Evict localStorage cache entries
     */
    evictLocalStorageCache() {
        try {
            const keys = this.getLocalStorageKeys();
            const entries = keys.map(key => ({
                key: key.replace('cache_', ''),
                entry: JSON.parse(localStorage.getItem(key))
            })).sort((a, b) => a.entry.lastAccess - b.entry.lastAccess);

            // Remove oldest 25%
            const toRemove = Math.ceil(entries.length * 0.25);
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(`cache_${entries[i].key}`);
            }
        } catch (e) {
            console.warn('localStorage eviction failed:', e);
        }
    }

    /**
     * Evict sessionStorage cache entries
     */
    evictSessionStorageCache() {
        try {
            const keys = this.getSessionStorageKeys();
            const entries = keys.map(key => ({
                key: key.replace('cache_', ''),
                entry: JSON.parse(sessionStorage.getItem(key))
            })).sort((a, b) => a.entry.lastAccess - b.entry.lastAccess);

            // Remove oldest 25%
            const toRemove = Math.ceil(entries.length * 0.25);
            for (let i = 0; i < toRemove; i++) {
                sessionStorage.removeItem(`cache_${entries[i].key}`);
            }
        } catch (e) {
            console.warn('sessionStorage eviction failed:', e);
        }
    }

    /**
     * Get localStorage cache keys
     * @returns {Array} - Cache keys
     */
    getLocalStorageKeys() {
        return Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    }

    /**
     * Get sessionStorage cache keys
     * @returns {Array} - Cache keys
     */
    getSessionStorageKeys() {
        return Object.keys(sessionStorage).filter(key => key.startsWith('cache_'));
    }

    /**
     * Get default TTL for strategy
     * @param {string} strategy - Cache strategy
     * @returns {number} - TTL in milliseconds
     */
    getDefaultTTL(strategy) {
        return this.cacheConfig[strategy]?.ttl || 5 * 60 * 1000;
    }

    /**
     * Serialize value for storage
     * @param {any} value - Value to serialize
     * @returns {string} - Serialized value
     */
    serialize(value) {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return String(value);
        }
    }

    /**
     * Deserialize value from storage
     * @param {string} value - Serialized value
     * @returns {any} - Deserialized value
     */
    deserialize(value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    /**
     * Cleanup expired cache entries
     */
    cleanup() {
        const now = Date.now();

        // Cleanup memory cache
        for (const [key, entry] of this.memoryCache) {
            if (!this.isValid(entry)) {
                this.memoryCache.delete(key);
            }
        }

        // Cleanup localStorage cache
        try {
            const localStorageKeys = this.getLocalStorageKeys();
            localStorageKeys.forEach(key => {
                const entry = JSON.parse(localStorage.getItem(key));
                if (!this.isValid(entry)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('localStorage cleanup failed:', e);
        }

        // Cleanup sessionStorage cache
        try {
            const sessionStorageKeys = this.getSessionStorageKeys();
            sessionStorageKeys.forEach(key => {
                const entry = JSON.parse(sessionStorage.getItem(key));
                if (!this.isValid(entry)) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('sessionStorage cleanup failed:', e);
        }
    }

    /**
     * Clear all caches
     */
    clear() {
        this.memoryCache.clear();
        
        try {
            this.getLocalStorageKeys().forEach(key => localStorage.removeItem(key));
            this.getSessionStorageKeys().forEach(key => sessionStorage.removeItem(key));
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache statistics
     */
    getStats() {
        return {
            memory: {
                size: this.memoryCache.size,
                maxSize: this.cacheConfig.memory.maxSize
            },
            localStorage: {
                size: this.getLocalStorageKeys().length,
                maxSize: this.cacheConfig.localStorage.maxSize
            },
            sessionStorage: {
                size: this.getSessionStorageKeys().length,
                maxSize: this.cacheConfig.sessionStorage.maxSize
            }
        };
    }
}

/**
 * Performance monitoring and optimization utilities
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.startTime = performance.now();
    }

    /**
     * Start performance measurement
     * @param {string} name - Measurement name
     * @returns {object} - Measurement object
     */
    startMeasurement(name) {
        const measurement = {
            name,
            startTime: performance.now(),
            endTime: null,
            duration: null,
            memory: this.getMemoryUsage()
        };

        this.metrics.set(name, measurement);
        return measurement;
    }

    /**
     * End performance measurement
     * @param {string} name - Measurement name
     * @returns {object} - Measurement result
     */
    endMeasurement(name) {
        const measurement = this.metrics.get(name);
        if (!measurement) {
            console.warn(`Measurement ${name} not found`);
            return null;
        }

        measurement.endTime = performance.now();
        measurement.duration = measurement.endTime - measurement.startTime;
        measurement.memoryEnd = this.getMemoryUsage();

        return measurement;
    }

    /**
     * Get memory usage information
     * @returns {object} - Memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    /**
     * Measure function execution time
     * @param {Function} fn - Function to measure
     * @param {string} name - Measurement name
     * @returns {any} - Function result
     */
    measureFunction(fn, name) {
        const measurement = this.startMeasurement(name);
        try {
            const result = fn();
            this.endMeasurement(name);
            return result;
        } catch (error) {
            this.endMeasurement(name);
            throw error;
        }
    }

    /**
     * Measure async function execution time
     * @param {Function} fn - Async function to measure
     * @param {string} name - Measurement name
     * @returns {any} - Function result
     */
    async measureAsyncFunction(fn, name) {
        const measurement = this.startMeasurement(name);
        try {
            const result = await fn();
            this.endMeasurement(name);
            return result;
        } catch (error) {
            this.endMeasurement(name);
            throw error;
        }
    }

    /**
     * Get performance metrics
     * @returns {object} - Performance metrics
     */
    getMetrics() {
        const metrics = {};
        for (const [name, measurement] of this.metrics) {
            metrics[name] = {
                duration: measurement.duration,
                memory: measurement.memory,
                memoryEnd: measurement.memoryEnd
            };
        }
        return metrics;
    }

    /**
     * Clear performance metrics
     */
    clearMetrics() {
        this.metrics.clear();
    }
}

/**
 * Lazy loading utilities
 */
class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
    }

    /**
     * Load module lazily
     * @param {string} moduleName - Module name
     * @param {Function} loader - Loader function
     * @returns {Promise} - Loading promise
     */
    async loadModule(moduleName, loader) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const promise = loader().then(() => {
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
        });

        this.loadingPromises.set(moduleName, promise);
        return promise;
    }

    /**
     * Load view lazily
     * @param {string} viewName - View name
     * @returns {Promise} - Loading promise
     */
    async loadView(viewName) {
        const loader = () => {
            return new Promise((resolve) => {
                // Simulate view loading
                setTimeout(() => {
                    console.log(`View ${viewName} loaded`);
                    resolve();
                }, 100);
            });
        };

        return this.loadModule(`view_${viewName}`, loader);
    }
}

/**
 * Data optimization utilities
 */
class DataOptimizer {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
    }

    /**
     * Debounce function execution
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @param {string} key - Unique key for the debounced function
     * @returns {Function} - Debounced function
     */
    debounce(fn, delay, key) {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            const timer = setTimeout(() => {
                fn.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Throttle function execution
     * @param {Function} fn - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @param {string} key - Unique key for the throttled function
     * @returns {Function} - Throttled function
     */
    throttle(fn, delay, key) {
        return (...args) => {
            if (this.throttleTimers.has(key)) {
                return;
            }

            fn.apply(this, args);
            this.throttleTimers.set(key, true);

            setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
        };
    }

    /**
     * Optimize data for display
     * @param {Array} data - Data array
     * @param {object} options - Optimization options
     * @returns {Array} - Optimized data
     */
    optimizeData(data, options = {}) {
        const {
            limit = 100,
            sortBy = null,
            filterBy = null,
            groupBy = null
        } = options;

        let optimized = [...data];

        // Apply filtering
        if (filterBy) {
            optimized = optimized.filter(filterBy);
        }

        // Apply sorting
        if (sortBy) {
            optimized.sort(sortBy);
        }

        // Apply grouping
        if (groupBy) {
            const groups = {};
            optimized.forEach(item => {
                const key = groupBy(item);
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(item);
            });
            optimized = Object.values(groups).flat();
        }

        // Apply limit
        if (limit && optimized.length > limit) {
            optimized = optimized.slice(0, limit);
        }

        return optimized;
    }
}

// Initialize global instances
const cacheManager = new CacheManager();
const performanceMonitor = new PerformanceMonitor();
const lazyLoader = new LazyLoader();
const dataOptimizer = new DataOptimizer();

// Export for use in other modules
window.CacheManager = CacheManager;
window.PerformanceMonitor = PerformanceMonitor;
window.LazyLoader = LazyLoader;
window.DataOptimizer = DataOptimizer;
window.cacheManager = cacheManager;
window.performanceMonitor = performanceMonitor;
window.lazyLoader = lazyLoader;
window.dataOptimizer = dataOptimizer;
