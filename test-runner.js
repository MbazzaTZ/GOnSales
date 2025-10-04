// Test runner script for GoNSales
// This script provides an easy way to run tests and view results

/**
 * Test runner with enhanced reporting
 */
class TestRunner {
    constructor() {
        this.results = null;
        this.performanceResults = null;
    }

    /**
     * Run all tests with enhanced reporting
     * @returns {Promise<object>} - Test results
     */
    async runAllTests() {
        console.log('🚀 Starting comprehensive test suite...');
        console.log('⏱️  Performance monitoring enabled');
        
        const startTime = performance.now();
        
        try {
            // Run main test suite
            this.results = await testFramework.run();
            
            // Run performance benchmarks
            console.log('\n⚡ Running performance benchmarks...');
            this.runPerformanceBenchmarks();
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // Generate comprehensive report
            this.generateReport(totalTime);
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        }
    }

    /**
     * Run performance benchmarks
     */
    runPerformanceBenchmarks() {
        // Benchmark data validation
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            value: Math.floor(Math.random() * 1000)
        }));

        performanceTests.benchmark('Data Validation (1000 items)', () => {
            testData.forEach(item => {
                SecurityUtils.validateEmail(item.email);
                SecurityUtils.validateText(item.name, { minLength: 2, maxLength: 50 });
                SecurityUtils.validateNumber(item.value, { min: 0, max: 1000 });
            });
        }, 50);

        // Benchmark cache operations
        const cacheManager = new CacheManager();
        performanceTests.benchmark('Cache Operations (100 items)', () => {
            for (let i = 0; i < 100; i++) {
                cacheManager.set(`key-${i}`, { data: i }, { strategy: 'memory' });
                cacheManager.get(`key-${i}`, 'memory');
            }
        }, 100);

        // Benchmark data optimization
        performanceTests.benchmark('Data Optimization (1000 items)', () => {
            dataOptimizer.optimizeData(testData, {
                limit: 100,
                sortBy: (a, b) => b.value - a.value,
                filterBy: item => item.value > 500
            });
        }, 50);

        this.performanceResults = performanceTests.getResults();
    }

    /**
     * Generate comprehensive test report
     * @param {number} totalTime - Total execution time
     */
    generateReport(totalTime) {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(50));
        
        // Test results
        if (this.results) {
            console.log(`\n🧪 Test Results:`);
            console.log(`  Total Tests: ${this.results.total}`);
            console.log(`  Passed: ${this.results.passed} (${this.results.successRate.toFixed(1)}%)`);
            console.log(`  Failed: ${this.results.failed}`);
            console.log(`  Execution Time: ${totalTime.toFixed(2)}ms`);
            
            if (this.results.failed > 0) {
                console.log(`\n❌ Failed Tests:`);
                this.results.results.filter(r => r.status === 'failed').forEach(result => {
                    console.log(`  • ${result.suite} - ${result.test}: ${result.error}`);
                });
            }
        }
        
        // Performance results
        if (this.performanceResults && this.performanceResults.length > 0) {
            console.log(`\n⚡ Performance Benchmarks:`);
            this.performanceResults.forEach(result => {
                console.log(`  ${result.name}:`);
                console.log(`    Average: ${result.avg.toFixed(2)}ms`);
                console.log(`    Median: ${result.median.toFixed(2)}ms`);
                console.log(`    95th Percentile: ${result.p95.toFixed(2)}ms`);
                console.log(`    99th Percentile: ${result.p99.toFixed(2)}ms`);
            });
        }
        
        // Cache statistics
        if (window.cacheManager) {
            const cacheStats = window.cacheManager.getStats();
            console.log(`\n💾 Cache Statistics:`);
            console.log(`  Memory Cache: ${cacheStats.memory.size}/${cacheStats.memory.maxSize} items`);
            console.log(`  LocalStorage: ${cacheStats.localStorage.size}/${cacheStats.localStorage.maxSize} items`);
            console.log(`  SessionStorage: ${cacheStats.sessionStorage.size}/${cacheStats.sessionStorage.maxSize} items`);
        }
        
        // Memory usage
        if (window.performanceMonitor) {
            const memoryUsage = window.performanceMonitor.getMemoryUsage();
            if (memoryUsage) {
                console.log(`\n🧠 Memory Usage:`);
                console.log(`  Used: ${memoryUsage.used}MB`);
                console.log(`  Total: ${memoryUsage.total}MB`);
                console.log(`  Limit: ${memoryUsage.limit}MB`);
            }
        }
        
        console.log('\n' + '='.repeat(50));
        
        // Overall assessment
        const overallScore = this.calculateOverallScore();
        console.log(`\n🎯 Overall Assessment: ${overallScore.score}/100 (${overallScore.grade})`);
        console.log(`  ${overallScore.message}`);
    }

    /**
     * Calculate overall test score
     * @returns {object} - Score and grade
     */
    calculateOverallScore() {
        let score = 0;
        let message = '';
        
        if (this.results) {
            // Test success rate (40% weight)
            score += (this.results.successRate / 100) * 40;
            
            // Performance (30% weight)
            if (this.performanceResults && this.performanceResults.length > 0) {
                const avgPerformance = this.performanceResults.reduce((sum, r) => sum + r.avg, 0) / this.performanceResults.length;
                const performanceScore = Math.max(0, 100 - (avgPerformance / 10)); // Penalize slow operations
                score += (performanceScore / 100) * 30;
            } else {
                score += 30; // Full points if no performance issues
            }
            
            // Test coverage (30% weight)
            const testCoverage = Math.min(100, (this.results.total / 100) * 100); // Assume 100 tests = 100% coverage
            score += (testCoverage / 100) * 30;
        }
        
        let grade = 'F';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';
        
        if (score >= 90) message = 'Excellent! All systems are performing optimally.';
        else if (score >= 80) message = 'Good! Minor improvements recommended.';
        else if (score >= 70) message = 'Fair. Several areas need attention.';
        else if (score >= 60) message = 'Poor. Significant improvements required.';
        else message = 'Critical issues detected. Immediate action required.';
        
        return { score: Math.round(score), grade, message };
    }

    /**
     * Run specific test suite
     * @param {string} suiteName - Name of the test suite
     * @returns {Promise<object>} - Test results
     */
    async runSuite(suiteName) {
        console.log(`🧪 Running test suite: ${suiteName}`);
        
        const suite = testFramework.tests.find(t => t.name === suiteName);
        if (!suite) {
            throw new Error(`Test suite '${suiteName}' not found`);
        }
        
        const results = await testFramework.run();
        const suiteResults = results.results.filter(r => r.suite === suiteName);
        
        console.log(`\n📊 ${suiteName} Results:`);
        console.log(`  Tests: ${suiteResults.length}`);
        console.log(`  Passed: ${suiteResults.filter(r => r.status === 'passed').length}`);
        console.log(`  Failed: ${suiteResults.filter(r => r.status === 'failed').length}`);
        
        return suiteResults;
    }

    /**
     * Run performance tests only
     * @returns {Array} - Performance results
     */
    runPerformanceTests() {
        console.log('⚡ Running performance tests...');
        this.runPerformanceBenchmarks();
        return this.performanceResults;
    }

    /**
     * Get test coverage report
     * @returns {object} - Coverage report
     */
    getCoverageReport() {
        if (!this.results) {
            return { message: 'No test results available. Run tests first.' };
        }
        
        const totalTests = this.results.total;
        const passedTests = this.results.passed;
        const failedTests = this.results.failed;
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: this.results.successRate,
            coverage: {
                security: this.getSecurityCoverage(),
                performance: this.getPerformanceCoverage(),
                integration: this.getIntegrationCoverage()
            }
        };
    }

    /**
     * Get security test coverage
     * @returns {number} - Coverage percentage
     */
    getSecurityCoverage() {
        const securityTests = this.results.results.filter(r => 
            r.suite.includes('Security') || r.test.includes('security') || r.test.includes('Security')
        );
        return securityTests.length > 0 ? (securityTests.filter(t => t.status === 'passed').length / securityTests.length) * 100 : 0;
    }

    /**
     * Get performance test coverage
     * @returns {number} - Coverage percentage
     */
    getPerformanceCoverage() {
        const performanceTests = this.results.results.filter(r => 
            r.suite.includes('Performance') || r.test.includes('performance') || r.test.includes('Performance')
        );
        return performanceTests.length > 0 ? (performanceTests.filter(t => t.status === 'passed').length / performanceTests.length) * 100 : 0;
    }

    /**
     * Get integration test coverage
     * @returns {number} - Coverage percentage
     */
    getIntegrationCoverage() {
        const integrationTests = this.results.results.filter(r => 
            r.suite.includes('Integration') || r.test.includes('integration') || r.test.includes('Integration')
        );
        return integrationTests.length > 0 ? (integrationTests.filter(t => t.status === 'passed').length / integrationTests.length) * 100 : 0;
    }
}

// Initialize test runner
const testRunner = new TestRunner();

// Export for global use
window.testRunner = testRunner;

// Enhanced global test functions
window.runAllTests = () => testRunner.runAllTests();
window.runSuite = (suiteName) => testRunner.runSuite(suiteName);
window.runPerformanceTests = () => testRunner.runPerformanceTests();
window.getCoverageReport = () => testRunner.getCoverageReport();

console.log('🧪 Test Runner loaded. Available commands:');
console.log('  window.runAllTests() - Run all tests with comprehensive reporting');
console.log('  window.runSuite("SuiteName") - Run specific test suite');
console.log('  window.runPerformanceTests() - Run performance tests only');
console.log('  window.getCoverageReport() - Get test coverage report');
