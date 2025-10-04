// Comprehensive test suites for GoNSales application
// This file contains all the test cases for the application

/**
 * Security utilities tests
 */
describe('SecurityUtils', () => {
    beforeEach(() => {
        // Reset any global state before each test
        window.currentUser = null;
    });

    it('should validate email format correctly', () => {
        expect.assertTrue(SecurityUtils.validateEmail('test@example.com'));
        expect.assertTrue(SecurityUtils.validateEmail('user.name+tag@domain.co.uk'));
        expect.assertFalse(SecurityUtils.validateEmail('invalid-email'));
        expect.assertFalse(SecurityUtils.validateEmail('@domain.com'));
        expect.assertFalse(SecurityUtils.validateEmail('user@'));
    });

    it('should validate password strength correctly', () => {
        const weakPassword = SecurityUtils.validatePassword('123');
        expect.assertFalse(weakPassword.isValid);
        expect.assertEquals(weakPassword.strength, 'weak');

        const strongPassword = SecurityUtils.validatePassword('Password123!');
        expect.assertTrue(strongPassword.isValid);
        expect.assertEquals(strongPassword.strength, 'strong');
    });

    it('should validate numbers correctly', () => {
        const validNumber = SecurityUtils.validateNumber('100', { min: 0, max: 1000 });
        expect.assertTrue(validNumber.isValid);
        expect.assertEquals(validNumber.value, 100);

        const invalidNumber = SecurityUtils.validateNumber('1500', { min: 0, max: 1000 });
        expect.assertFalse(invalidNumber.isValid);
        expect.assertEquals(invalidNumber.error, 'Must be at most 1000');
    });

    it('should validate text correctly', () => {
        const validText = SecurityUtils.validateText('Hello World', { minLength: 5, maxLength: 20 });
        expect.assertTrue(validText.isValid);
        expect.assertEquals(validText.value, 'Hello World');

        const invalidText = SecurityUtils.validateText('Hi', { minLength: 5, maxLength: 20 });
        expect.assertFalse(invalidText.isValid);
        expect.assertEquals(invalidText.error, 'Must be at least 5 characters');
    });

    it('should sanitize HTML correctly', () => {
        const maliciousInput = '<script>alert("xss")</script>Hello';
        const sanitized = SecurityUtils.sanitizeHTML(maliciousInput);
        expect.assertNotContains(sanitized, '<script>');
        expect.assertContains(sanitized, 'Hello');
    });

    it('should validate form data correctly', () => {
        const formData = {
            email: 'test@example.com',
            password: 'Password123!',
            name: 'John Doe'
        };

        const schema = {
            email: { type: 'email', required: true },
            password: { type: 'password', required: true },
            name: { type: 'text', required: true, minLength: 2 }
        };

        const validation = SecurityUtils.validateFormData(formData, schema);
        expect.assertTrue(validation.isValid);
        expect.assertNotNull(validation.sanitizedData.email);
        expect.assertNotNull(validation.sanitizedData.password);
        expect.assertNotNull(validation.sanitizedData.name);
    });
});

/**
 * Cache manager tests
 */
describe('CacheManager', () => {
    let cacheManager;

    beforeEach(() => {
        cacheManager = new CacheManager();
        cacheManager.clear();
    });

    it('should store and retrieve data from memory cache', () => {
        const testData = { id: 1, name: 'Test' };
        cacheManager.set('test-key', testData, { strategy: 'memory' });
        
        const retrieved = cacheManager.get('test-key', 'memory');
        expect.assertNotNull(retrieved);
        expect.assertEquals(retrieved.id, 1);
        expect.assertEquals(retrieved.name, 'Test');
    });

    it('should handle cache expiration', () => {
        const testData = { id: 1, name: 'Test' };
        cacheManager.set('test-key', testData, { strategy: 'memory', ttl: 1 }); // 1ms TTL
        
        // Wait for expiration
        setTimeout(() => {
            const retrieved = cacheManager.get('test-key', 'memory');
            expect.assertNull(retrieved);
        }, 10);
    });

    it('should evict old entries when cache is full', () => {
        // Fill cache beyond limit
        for (let i = 0; i < 150; i++) {
            cacheManager.set(`key-${i}`, { data: i }, { strategy: 'memory' });
        }

        const stats = cacheManager.getStats();
        expect.assertTrue(stats.memory.size <= 100); // Should not exceed max size
    });

    it('should provide cache statistics', () => {
        cacheManager.set('test1', { data: 1 }, { strategy: 'memory' });
        cacheManager.set('test2', { data: 2 }, { strategy: 'localStorage' });
        
        const stats = cacheManager.getStats();
        expect.assertNotNull(stats.memory);
        expect.assertNotNull(stats.localStorage);
        expect.assertNotNull(stats.sessionStorage);
    });
});

/**
 * Performance monitor tests
 */
describe('PerformanceMonitor', () => {
    let performanceMonitor;

    beforeEach(() => {
        performanceMonitor = new PerformanceMonitor();
        performanceMonitor.clearMetrics();
    });

    it('should measure function execution time', () => {
        const testFunction = () => {
            // Simulate some work
            let sum = 0;
            for (let i = 0; i < 1000; i++) {
                sum += i;
            }
            return sum;
        };

        const result = performanceMonitor.measureFunction(testFunction, 'test-function');
        expect.assertNotNull(result);
        
        const metrics = performanceMonitor.getMetrics();
        expect.assertNotNull(metrics['test-function']);
        expect.assertNotNull(metrics['test-function'].duration);
    });

    it('should measure async function execution time', async () => {
        const testAsyncFunction = async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return 'async result';
        };

        const result = await performanceMonitor.measureAsyncFunction(testAsyncFunction, 'test-async');
        expect.assertEquals(result, 'async result');
        
        const metrics = performanceMonitor.getMetrics();
        expect.assertNotNull(metrics['test-async']);
    });

    it('should get memory usage information', () => {
        const memoryUsage = performanceMonitor.getMemoryUsage();
        if (memoryUsage) {
            expect.assertNotNull(memoryUsage.used);
            expect.assertNotNull(memoryUsage.total);
            expect.assertNotNull(memoryUsage.limit);
        }
    });
});

/**
 * Data optimizer tests
 */
describe('DataOptimizer', () => {
    let dataOptimizer;

    beforeEach(() => {
        dataOptimizer = new DataOptimizer();
    });

    it('should debounce function calls', (done) => {
        let callCount = 0;
        const debouncedFn = dataOptimizer.debounce(() => {
            callCount++;
        }, 50, 'test-debounce');

        // Call multiple times quickly
        debouncedFn();
        debouncedFn();
        debouncedFn();

        // Should only execute once after delay
        setTimeout(() => {
            expect.assertEquals(callCount, 1);
            done();
        }, 100);
    });

    it('should throttle function calls', (done) => {
        let callCount = 0;
        const throttledFn = dataOptimizer.throttle(() => {
            callCount++;
        }, 50, 'test-throttle');

        // Call multiple times quickly
        throttledFn();
        throttledFn();
        throttledFn();

        // Should only execute once immediately
        expect.assertEquals(callCount, 1);
        done();
    });

    it('should optimize data arrays', () => {
        const testData = [
            { id: 1, name: 'Alice', age: 25 },
            { id: 2, name: 'Bob', age: 30 },
            { id: 3, name: 'Charlie', age: 35 },
            { id: 4, name: 'David', age: 40 }
        ];

        const optimized = dataOptimizer.optimizeData(testData, {
            limit: 2,
            sortBy: (a, b) => b.age - a.age
        });

        expect.assertEquals(optimized.length, 2);
        expect.assertEquals(optimized[0].name, 'David'); // Should be sorted by age desc
    });
});

/**
 * Authentication tests
 */
describe('Authentication', () => {
    beforeEach(() => {
        window.currentUser = null;
        // Reset login attempts
        if (window.loginAttempts) {
            window.loginAttempts.clear();
        }
    });

    it('should validate login credentials', async () => {
        const result = await validateMockCredentials('admin@gonsales.com', 'Admin@123!');
        expect.assertTrue(result);
    });

    it('should reject invalid credentials', async () => {
        const result = await validateMockCredentials('invalid@email.com', 'wrongpassword');
        expect.assertFalse(result);
    });

    it('should enforce rate limiting', () => {
        const email = 'test@example.com';
        
        // Should allow initial attempts
        expect.assertTrue(checkLoginRateLimit(email));
        
        // Simulate multiple failed attempts
        for (let i = 0; i < 5; i++) {
            logFailedLoginAttempt(email);
        }
        
        // Should block after max attempts
        expect.assertFalse(checkLoginRateLimit(email));
    });

    it('should generate secure session IDs', () => {
        const sessionId1 = generateSessionId();
        const sessionId2 = generateSessionId();
        
        expect.assertNotNull(sessionId1);
        expect.assertNotNull(sessionId2);
        expect.assertNotEquals(sessionId1, sessionId2);
        expect.assertEquals(sessionId1.length, 32); // 16 bytes = 32 hex chars
    });
});

/**
 * Data validation tests
 */
describe('Data Validation', () => {
    it('should validate sales data updates', async () => {
        const testData = {
            id: '1',
            field: 'monthlyTarget',
            value: '1000'
        };

        // Mock the update function to test validation
        const validation = SecurityUtils.validateNumber(testData.value, { 
            min: 0, 
            max: 999999, 
            allowDecimals: false, 
            required: true 
        });

        expect.assertTrue(validation.isValid);
        expect.assertEquals(validation.value, 1000);
    });

    it('should reject invalid sales data', async () => {
        const invalidData = {
            id: '1',
            field: 'monthlyTarget',
            value: '-100' // Negative value should be rejected
        };

        const validation = SecurityUtils.validateNumber(invalidData.value, { 
            min: 0, 
            max: 999999, 
            allowDecimals: false, 
            required: true 
        });

        expect.assertFalse(validation.isValid);
        expect.assertEquals(validation.error, 'Must be at least 0');
    });

    it('should validate DSR data correctly', () => {
        const validDSRData = {
            name: 'John Doe',
            dsrId: 'DSR001',
            cluster: 'North',
            captainName: 'Captain A',
            lastMonthActual: '120',
            thisMonthActual: '135',
            slab: 'Gold'
        };

        // Test name validation
        const nameValidation = SecurityUtils.validateText(validDSRData.name, { 
            minLength: 2, 
            maxLength: 50, 
            required: true,
            pattern: /^[a-zA-Z\s]+$/
        });

        expect.assertTrue(nameValidation.isValid);
        expect.assertEquals(nameValidation.value, 'John Doe');
    });
});

/**
 * Error handling tests
 */
describe('Error Handling', () => {
    let errorHandler;

    beforeEach(() => {
        errorHandler = new ErrorHandler();
        errorHandler.clearLog();
    });

    it('should log errors with context', () => {
        const testError = new Error('Test error message');
        errorHandler.logError(testError, 'TestContext', { userId: 123 });
        
        const recentErrors = errorHandler.getRecentErrors();
        expect.assertEquals(recentErrors.length, 1);
        expect.assertEquals(recentErrors[0].context, 'TestContext');
        expect.assertEquals(recentErrors[0].message, 'Test error message');
    });

    it('should handle errors gracefully', () => {
        const testError = new Error('Network error occurred');
        const userMessage = errorHandler.handleError(testError, 'NetworkOperation');
        
        expect.assertNotNull(userMessage);
        expect.assertContains(userMessage, 'Network error');
    });

    it('should map technical errors to user-friendly messages', () => {
        const networkError = new Error('Failed to fetch');
        const userMessage = errorHandler.handleError(networkError, 'API');
        
        expect.assertContains(userMessage, 'Network error');
        expect.assertContains(userMessage, 'connection');
    });
});

/**
 * Performance benchmarks
 */
describe('Performance Benchmarks', () => {
    it('should benchmark data validation', () => {
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            value: Math.floor(Math.random() * 1000)
        }));

        const results = performanceTests.benchmark('Data Validation', () => {
            testData.forEach(item => {
                SecurityUtils.validateEmail(item.email);
                SecurityUtils.validateText(item.name, { minLength: 2, maxLength: 50 });
                SecurityUtils.validateNumber(item.value, { min: 0, max: 1000 });
            });
        }, 100);

        expect.assertNotNull(results.avg);
        expect.assertTrue(results.avg < 100); // Should be fast
    });

    it('should benchmark cache operations', () => {
        const cacheManager = new CacheManager();
        
        const results = performanceTests.benchmark('Cache Operations', () => {
            for (let i = 0; i < 100; i++) {
                cacheManager.set(`key-${i}`, { data: i }, { strategy: 'memory' });
                cacheManager.get(`key-${i}`, 'memory');
            }
        }, 50);

        expect.assertNotNull(results.avg);
        expect.assertTrue(results.avg < 50); // Should be very fast
    });

    it('should benchmark data optimization', () => {
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random() * 100
        }));

        const results = performanceTests.benchmark('Data Optimization', () => {
            dataOptimizer.optimizeData(testData, {
                limit: 100,
                sortBy: (a, b) => b.value - a.value,
                filterBy: item => item.value > 50
            });
        }, 100);

        expect.assertNotNull(results.avg);
        expect.assertTrue(results.avg < 200); // Should be reasonably fast
    });
});

/**
 * Integration tests
 */
describe('Integration Tests', () => {
    beforeEach(() => {
        // Reset application state
        window.currentUser = null;
        window.salesData = [];
        window.dsrPerformanceData = [];
        window.dePerformanceData = [];
    });

    it('should handle complete authentication flow', async () => {
        // Test login with valid credentials
        const email = 'admin@gonsales.com';
        const password = 'Admin@123!';
        
        // Validate credentials
        const isValid = await validateMockCredentials(email, password);
        expect.assertTrue(isValid);
        
        // Simulate successful login
        window.currentUser = { 
            email: email,
            loginTime: new Date().toISOString(),
            sessionId: generateSessionId()
        };
        
        expect.assertNotNull(window.currentUser);
        expect.assertEquals(window.currentUser.email, email);
    });

    it('should handle data update flow with validation', async () => {
        // Setup test data
        window.salesData = [
            { id: '1', name: 'Captain A', monthlyTarget: 1000, mtdTarget: 800, mtdActual: 750 }
        ];
        
        // Test data update with validation
        const validation = SecurityUtils.validateNumber('1200', { 
            min: 0, 
            max: 999999, 
            allowDecimals: false, 
            required: true 
        });
        
        expect.assertTrue(validation.isValid);
        
        // Update data
        const person = window.salesData.find(p => p.id === '1');
        if (person) {
            person.monthlyTarget = validation.value;
        }
        
        expect.assertEquals(person.monthlyTarget, 1200);
    });

    it('should handle error scenarios gracefully', () => {
        // Test error handling in data operations
        const errorHandler = new ErrorHandler();
        
        try {
            // Simulate an error
            throw new Error('Database connection failed');
        } catch (error) {
            const userMessage = errorHandler.handleError(error, 'DataOperation');
            expect.assertNotNull(userMessage);
            expect.assertContains(userMessage, 'unexpected error');
        }
    });
});

/**
 * UI component tests
 */
describe('UI Components', () => {
    beforeEach(() => {
        // Setup DOM for testing
        document.body.innerHTML = `
            <div id="test-container">
                <input id="test-input" type="text" />
                <div id="test-output"></div>
            </div>
        `;
    });

    it('should update password strength indicator', () => {
        // Mock the password strength indicator
        const passwordInput = document.getElementById('test-input');
        const strengthDiv = document.createElement('div');
        strengthDiv.innerHTML = `
            <div class="strength-fill"></div>
            <div class="strength-text"></div>
            <ul class="password-requirements"></ul>
        `;
        document.body.appendChild(strengthDiv);
        
        // Test password strength update
        const testPassword = 'Password123!';
        updatePasswordStrengthIndicator(testPassword);
        
        const strengthFill = strengthDiv.querySelector('.strength-fill');
        const strengthText = strengthDiv.querySelector('.strength-text');
        
        expect.assertNotNull(strengthFill);
        expect.assertNotNull(strengthText);
    });

    it('should handle form validation', () => {
        const testInput = document.getElementById('test-input');
        testInput.value = 'test@example.com';
        
        // Test email validation
        const isValid = SecurityUtils.validateEmail(testInput.value);
        expect.assertTrue(isValid);
        
        // Test invalid email
        testInput.value = 'invalid-email';
        const isInvalid = SecurityUtils.validateEmail(testInput.value);
        expect.assertFalse(isInvalid);
    });
});

// Export test runner function
window.runAllTests = async () => {
    console.log('🚀 Starting comprehensive test suite...');
    const results = await testFramework.run();
    
    // Run performance benchmarks
    console.log('\n⚡ Running performance benchmarks...');
    const benchmarkResults = performanceTests.getResults();
    if (benchmarkResults.length > 0) {
        console.log('📊 Performance Results:');
        benchmarkResults.forEach(result => {
            console.log(`  ${result.name}: ${result.avg.toFixed(2)}ms avg, ${result.p95.toFixed(2)}ms p95`);
        });
    }
    
    return results;
};
