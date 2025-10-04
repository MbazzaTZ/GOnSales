// Comprehensive testing suite for GoNSales
// This module provides unit tests, integration tests, and performance tests

/**
 * Test framework for GoNSales application
 */
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentSuite = null;
        this.beforeEachHooks = [];
        this.afterEachHooks = [];
        this.beforeAllHooks = [];
        this.afterAllHooks = [];
    }

    /**
     * Describe a test suite
     * @param {string} name - Suite name
     * @param {Function} fn - Suite function
     */
    describe(name, fn) {
        const previousSuite = this.currentSuite;
        this.currentSuite = { name, tests: [], beforeEach: [], afterEach: [], beforeAll: [], afterAll: [] };
        
        try {
            fn();
        } catch (error) {
            console.error(`Error in test suite ${name}:`, error);
        }
        
        this.tests.push(this.currentSuite);
        this.currentSuite = previousSuite;
    }

    /**
     * Define a test case
     * @param {string} name - Test name
     * @param {Function} fn - Test function
     */
    it(name, fn) {
        if (!this.currentSuite) {
            throw new Error('Test must be inside a describe block');
        }
        
        this.currentSuite.tests.push({
            name,
            fn,
            suite: this.currentSuite.name
        });
    }

    /**
     * Setup before each test
     * @param {Function} fn - Setup function
     */
    beforeEach(fn) {
        if (!this.currentSuite) {
            throw new Error('beforeEach must be inside a describe block');
        }
        this.currentSuite.beforeEach.push(fn);
    }

    /**
     * Cleanup after each test
     * @param {Function} fn - Cleanup function
     */
    afterEach(fn) {
        if (!this.currentSuite) {
            throw new Error('afterEach must be inside a describe block');
        }
        this.currentSuite.afterEach.push(fn);
    }

    /**
     * Setup before all tests in suite
     * @param {Function} fn - Setup function
     */
    beforeAll(fn) {
        if (!this.currentSuite) {
            throw new Error('beforeAll must be inside a describe block');
        }
        this.currentSuite.beforeAll.push(fn);
    }

    /**
     * Cleanup after all tests in suite
     * @param {Function} fn - Cleanup function
     */
    afterAll(fn) {
        if (!this.currentSuite) {
            throw new Error('afterAll must be inside a describe block');
        }
        this.currentSuite.afterAll.push(fn);
    }

    /**
     * Run all tests
     * @returns {Promise<object>} - Test results
     */
    async run() {
        console.log('🧪 Starting test suite...');
        this.results = [];
        
        for (const suite of this.tests) {
            console.log(`\n📁 Running suite: ${suite.name}`);
            
            // Run beforeAll hooks
            for (const hook of suite.beforeAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error(`beforeAll hook failed in ${suite.name}:`, error);
                }
            }
            
            // Run tests
            for (const test of suite.tests) {
                await this.runTest(test, suite);
            }
            
            // Run afterAll hooks
            for (const hook of suite.afterAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error(`afterAll hook failed in ${suite.name}:`, error);
                }
            }
        }
        
        this.printResults();
        return this.getResults();
    }

    /**
     * Run a single test
     * @param {object} test - Test object
     * @param {object} suite - Suite object
     */
    async runTest(test, suite) {
        const startTime = performance.now();
        
        try {
            // Run beforeEach hooks
            for (const hook of suite.beforeEach) {
                await hook();
            }
            
            // Run the test
            await test.fn();
            
            // Run afterEach hooks
            for (const hook of suite.afterEach) {
                await hook();
            }
            
            const duration = performance.now() - startTime;
            this.results.push({
                suite: suite.name,
                test: test.name,
                status: 'passed',
                duration,
                error: null
            });
            
            console.log(`  ✅ ${test.name} (${duration.toFixed(2)}ms)`);
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.results.push({
                suite: suite.name,
                test: test.name,
                status: 'failed',
                duration,
                error: error.message
            });
            
            console.log(`  ❌ ${test.name} (${duration.toFixed(2)}ms) - ${error.message}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const total = this.results.length;
        
        console.log(`\n📊 Test Results:`);
        console.log(`  Total: ${total}`);
        console.log(`  Passed: ${passed}`);
        console.log(`  Failed: ${failed}`);
        console.log(`  Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.results.filter(r => r.status === 'failed').forEach(result => {
                console.log(`  ${result.suite} - ${result.test}: ${result.error}`);
            });
        }
    }

    /**
     * Get test results
     * @returns {object} - Test results
     */
    getResults() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        
        return {
            total: this.results.length,
            passed,
            failed,
            successRate: (passed / this.results.length) * 100,
            results: this.results
        };
    }
}

/**
 * Assertion utilities
 */
class Assert {
    /**
     * Assert that a condition is true
     * @param {boolean} condition - Condition to test
     * @param {string} message - Error message
     */
    static assertTrue(condition, message = 'Expected condition to be true') {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a condition is false
     * @param {boolean} condition - Condition to test
     * @param {string} message - Error message
     */
    static assertFalse(condition, message = 'Expected condition to be false') {
        if (condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert that two values are equal
     * @param {any} actual - Actual value
     * @param {any} expected - Expected value
     * @param {string} message - Error message
     */
    static assertEquals(actual, expected, message = `Expected ${expected}, but got ${actual}`) {
        if (actual !== expected) {
            throw new Error(message);
        }
    }

    /**
     * Assert that two values are not equal
     * @param {any} actual - Actual value
     * @param {any} expected - Expected value
     * @param {string} message - Error message
     */
    static assertNotEquals(actual, expected, message = `Expected values to be different`) {
        if (actual === expected) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is null
     * @param {any} value - Value to test
     * @param {string} message - Error message
     */
    static assertNull(value, message = `Expected null, but got ${value}`) {
        if (value !== null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is not null
     * @param {any} value - Value to test
     * @param {string} message - Error message
     */
    static assertNotNull(value, message = 'Expected value to not be null') {
        if (value === null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is undefined
     * @param {any} value - Value to test
     * @param {string} message - Error message
     */
    static assertUndefined(value, message = `Expected undefined, but got ${value}`) {
        if (value !== undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is not undefined
     * @param {any} value - Value to test
     * @param {string} message - Error message
     */
    static assertNotUndefined(value, message = 'Expected value to not be undefined') {
        if (value === undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that an array contains a value
     * @param {Array} array - Array to test
     * @param {any} value - Value to find
     * @param {string} message - Error message
     */
    static assertContains(array, value, message = `Expected array to contain ${value}`) {
        if (!array.includes(value)) {
            throw new Error(message);
        }
    }

    /**
     * Assert that an array does not contain a value
     * @param {Array} array - Array to test
     * @param {any} value - Value to find
     * @param {string} message - Error message
     */
    static assertNotContains(array, value, message = `Expected array to not contain ${value}`) {
        if (array.includes(value)) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a function throws an error
     * @param {Function} fn - Function to test
     * @param {string} expectedError - Expected error message
     */
    static assertThrows(fn, expectedError = null) {
        try {
            fn();
            throw new Error('Expected function to throw an error');
        } catch (error) {
            if (expectedError && error.message !== expectedError) {
                throw new Error(`Expected error "${expectedError}", but got "${error.message}"`);
            }
        }
    }

    /**
     * Assert that a function does not throw an error
     * @param {Function} fn - Function to test
     * @param {string} message - Error message
     */
    static assertDoesNotThrow(fn, message = 'Expected function to not throw an error') {
        try {
            fn();
        } catch (error) {
            throw new Error(`${message}: ${error.message}`);
        }
    }
}

/**
 * Mock utilities for testing
 */
class MockUtils {
    /**
     * Create a mock function
     * @param {any} returnValue - Return value
     * @returns {Function} - Mock function
     */
    static createMockFunction(returnValue = undefined) {
        const calls = [];
        const mockFn = (...args) => {
            calls.push(args);
            return returnValue;
        };
        
        mockFn.calls = calls;
        mockFn.callCount = () => calls.length;
        mockFn.lastCall = () => calls[calls.length - 1];
        mockFn.reset = () => calls.length = 0;
        
        return mockFn;
    }

    /**
     * Create a mock object
     * @param {object} methods - Methods to mock
     * @returns {object} - Mock object
     */
    static createMockObject(methods = {}) {
        const mock = {};
        for (const [name, returnValue] of Object.entries(methods)) {
            mock[name] = this.createMockFunction(returnValue);
        }
        return mock;
    }

    /**
     * Mock localStorage
     * @returns {object} - Mock localStorage
     */
    static mockLocalStorage() {
        const store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value; },
            removeItem: (key) => { delete store[key]; },
            clear: () => { Object.keys(store).forEach(key => delete store[key]); },
            length: Object.keys(store).length,
            key: (index) => Object.keys(store)[index] || null
        };
    }

    /**
     * Mock sessionStorage
     * @returns {object} - Mock sessionStorage
     */
    static mockSessionStorage() {
        return this.mockLocalStorage();
    }
}

/**
 * Performance testing utilities
 */
class PerformanceTests {
    constructor() {
        this.benchmarks = [];
    }

    /**
     * Benchmark a function
     * @param {string} name - Benchmark name
     * @param {Function} fn - Function to benchmark
     * @param {number} iterations - Number of iterations
     * @returns {object} - Benchmark results
     */
    benchmark(name, fn, iterations = 1000) {
        const times = [];
        
        // Warm up
        for (let i = 0; i < 10; i++) {
            fn();
        }
        
        // Benchmark
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push(end - start);
        }
        
        const results = {
            name,
            iterations,
            min: Math.min(...times),
            max: Math.max(...times),
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            median: this.median(times),
            p95: this.percentile(times, 95),
            p99: this.percentile(times, 99)
        };
        
        this.benchmarks.push(results);
        return results;
    }

    /**
     * Calculate median
     * @param {Array} values - Values array
     * @returns {number} - Median value
     */
    median(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    /**
     * Calculate percentile
     * @param {Array} values - Values array
     * @param {number} percentile - Percentile (0-100)
     * @returns {number} - Percentile value
     */
    percentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }

    /**
     * Get all benchmark results
     * @returns {Array} - Benchmark results
     */
    getResults() {
        return this.benchmarks;
    }

    /**
     * Clear benchmark results
     */
    clear() {
        this.benchmarks = [];
    }
}

// Initialize global instances
const testFramework = new TestFramework();
const performanceTests = new PerformanceTests();

// Export for use in other modules
window.TestFramework = TestFramework;
window.Assert = Assert;
window.MockUtils = MockUtils;
window.PerformanceTests = PerformanceTests;
window.testFramework = testFramework;
window.performanceTests = performanceTests;

// Global test functions for convenience
window.describe = (name, fn) => testFramework.describe(name, fn);
window.it = (name, fn) => testFramework.it(name, fn);
window.beforeEach = (fn) => testFramework.beforeEach(fn);
window.afterEach = (fn) => testFramework.afterEach(fn);
window.beforeAll = (fn) => testFramework.beforeAll(fn);
window.afterAll = (fn) => testFramework.afterAll(fn);
window.expect = Assert;
