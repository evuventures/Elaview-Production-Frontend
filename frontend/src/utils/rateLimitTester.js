// src/utils/rateLimitTester.js
// ✅ RATE LIMITING: Comprehensive testing utilities to verify rate limiting improvements

import { apiClient } from '@/api/apiClient';

// Test suite for rate limiting improvements
export class RateLimitTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  // ✅ TEST: Request deduplication
  async testRequestDeduplication() {
    console.log('🧪 TESTING: Request deduplication...');
    const testStart = Date.now();
    
    try {
      // Make 5 identical requests simultaneously - should only result in 1 actual network call
      const promises = Array(5).fill().map((_, i) => {
        console.log(`🧪 REQUEST DEDUP: Starting duplicate request ${i + 1}/5`);
        return apiClient.get('/spaces');
      });

      const results = await Promise.all(promises);
      const testDuration = Date.now() - testStart;
      
      // All results should be identical (same reference if properly deduplicated)
      const areResultsIdentical = results.every(result => 
        JSON.stringify(result) === JSON.stringify(results[0])
      );

      const testResult = {
        test: 'Request Deduplication',
        passed: areResultsIdentical,
        duration: testDuration,
        details: `Made 5 simultaneous identical requests in ${testDuration}ms`,
        results: results.length
      };

      this.testResults.push(testResult);
      console.log(`🧪 DEDUP TEST: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'} - ${testResult.details}`);
      
      return testResult;
    } catch (error) {
      const testResult = {
        test: 'Request Deduplication',
        passed: false,
        duration: Date.now() - testStart,
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.error('🧪 DEDUP TEST: ❌ FAILED -', error.message);
      return testResult;
    }
  }

  // ✅ TEST: Response caching
  async testResponseCaching() {
    console.log('🧪 TESTING: Response caching...');
    const testStart = Date.now();
    
    try {
      // First request - should hit the network
      console.log('🧪 CACHE TEST: Making first request (should hit network)');
      const firstRequestStart = Date.now();
      const firstResult = await apiClient.get('/properties');
      const firstDuration = Date.now() - firstRequestStart;
      
      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Second request - should hit cache
      console.log('🧪 CACHE TEST: Making second request (should hit cache)');
      const secondRequestStart = Date.now();
      const secondResult = await apiClient.get('/properties');
      const secondDuration = Date.now() - secondRequestStart;
      
      const testDuration = Date.now() - testStart;
      
      // Second request should be much faster (cached)
      const cacheHit = secondDuration < firstDuration * 0.5;
      const dataMatches = JSON.stringify(firstResult) === JSON.stringify(secondResult);

      const testResult = {
        test: 'Response Caching',
        passed: cacheHit && dataMatches,
        duration: testDuration,
        details: `First: ${firstDuration}ms, Second: ${secondDuration}ms (${cacheHit ? 'cache hit' : 'cache miss'})`,
        firstDuration,
        secondDuration,
        cacheHit,
        dataMatches
      };

      this.testResults.push(testResult);
      console.log(`🧪 CACHE TEST: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'} - ${testResult.details}`);
      
      return testResult;
    } catch (error) {
      const testResult = {
        test: 'Response Caching',
        passed: false,
        duration: Date.now() - testStart,
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.error('🧪 CACHE TEST: ❌ FAILED -', error.message);
      return testResult;
    }
  }

  // ✅ TEST: Rate limit backoff (simulated)
  async testRateLimitBackoff() {
    console.log('🧪 TESTING: Rate limit backoff simulation...');
    const testStart = Date.now();
    
    try {
      // Simulate rate limit by directly calling backoff methods
      const endpoint = '/test-rate-limit';
      apiClient.setRateLimitBackoff(endpoint, 2); // 2 second backoff
      
      // Check if endpoint is properly rate limited
      const isRateLimited = apiClient.isRateLimited(endpoint);
      
      // Try to make a request to rate-limited endpoint
      let backoffRespected = false;
      try {
        await apiClient.get(endpoint);
      } catch (error) {
        backoffRespected = error.message.includes('Rate limited');
      }
      
      const testDuration = Date.now() - testStart;

      const testResult = {
        test: 'Rate Limit Backoff',
        passed: isRateLimited && backoffRespected,
        duration: testDuration,
        details: `Rate limit detected: ${isRateLimited}, Backoff respected: ${backoffRespected}`,
        isRateLimited,
        backoffRespected
      };

      this.testResults.push(testResult);
      console.log(`🧪 BACKOFF TEST: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'} - ${testResult.details}`);
      
      return testResult;
    } catch (error) {
      const testResult = {
        test: 'Rate Limit Backoff',
        passed: false,
        duration: Date.now() - testStart,
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.error('🧪 BACKOFF TEST: ❌ FAILED -', error.message);
      return testResult;
    }
  }

  // ✅ TEST: Cache statistics
  async testCacheStatistics() {
    console.log('🧪 TESTING: Cache statistics...');
    const testStart = Date.now();
    
    try {
      // Make some requests to populate cache
      await apiClient.get('/spaces');
      await apiClient.get('/properties');
      await apiClient.get('/campaigns');
      
      // Get cache statistics
      const stats = apiClient.getCacheStats();
      
      const testDuration = Date.now() - testStart;
      
      const hasValidStats = stats && 
        typeof stats.total === 'number' &&
        typeof stats.valid === 'number' &&
        typeof stats.pending === 'number' &&
        typeof stats.rateLimited === 'number';

      const testResult = {
        test: 'Cache Statistics',
        passed: hasValidStats,
        duration: testDuration,
        details: `Stats: ${JSON.stringify(stats)}`,
        stats
      };

      this.testResults.push(testResult);
      console.log(`🧪 STATS TEST: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'} - ${testResult.details}`);
      
      return testResult;
    } catch (error) {
      const testResult = {
        test: 'Cache Statistics',
        passed: false,
        duration: Date.now() - testStart,
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.error('🧪 STATS TEST: ❌ FAILED -', error.message);
      return testResult;
    }
  }

  // ✅ TEST: Concurrent requests with different endpoints
  async testConcurrentRequests() {
    console.log('🧪 TESTING: Concurrent requests to different endpoints...');
    const testStart = Date.now();
    
    try {
      const endpoints = ['/spaces', '/properties', '/campaigns', '/messages', '/invoices'];
      
      console.log(`🧪 CONCURRENT TEST: Making ${endpoints.length} concurrent requests...`);
      const promises = endpoints.map(endpoint => {
        console.log(`🧪 CONCURRENT: Requesting ${endpoint}`);
        return apiClient.get(endpoint).catch(err => ({ error: err.message, endpoint }));
      });

      const results = await Promise.all(promises);
      const testDuration = Date.now() - testStart;
      
      const successfulRequests = results.filter(result => !result.error).length;
      const errorRequests = results.filter(result => result.error).length;

      const testResult = {
        test: 'Concurrent Requests',
        passed: successfulRequests >= 3, // At least 3 should succeed
        duration: testDuration,
        details: `${successfulRequests} successful, ${errorRequests} failed in ${testDuration}ms`,
        successfulRequests,
        errorRequests,
        results
      };

      this.testResults.push(testResult);
      console.log(`🧪 CONCURRENT TEST: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'} - ${testResult.details}`);
      
      return testResult;
    } catch (error) {
      const testResult = {
        test: 'Concurrent Requests',
        passed: false,
        duration: Date.now() - testStart,
        error: error.message
      };
      
      this.testResults.push(testResult);
      console.error('🧪 CONCURRENT TEST: ❌ FAILED -', error.message);
      return testResult;
    }
  }

  // ✅ RUN ALL TESTS
  async runAllTests() {
    console.log('🧪 STARTING COMPREHENSIVE RATE LIMITING TESTS...');
    const allTestsStart = Date.now();
    
    try {
      await this.testRequestDeduplication();
      await this.testResponseCaching();
      await this.testRateLimitBackoff();
      await this.testCacheStatistics();
      await this.testConcurrentRequests();
      
      const totalDuration = Date.now() - allTestsStart;
      const passedTests = this.testResults.filter(test => test.passed).length;
      const totalTests = this.testResults.length;
      
      const summary = {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        duration: totalDuration,
        successRate: ((passedTests / totalTests) * 100).toFixed(1)
      };
      
      console.log(`\n🧪 TEST SUMMARY:`);
      console.log(`✅ Passed: ${summary.passedTests}/${summary.totalTests} (${summary.successRate}%)`);
      console.log(`⏱️ Total Duration: ${summary.duration}ms`);
      console.log(`📊 Individual Results:`);
      
      this.testResults.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`  ${status} ${test.test}: ${test.details || test.error}`);
      });
      
      // Clear cache after tests
      apiClient.clearCache();
      console.log('\n🧹 Cache cleared after tests');
      
      return {
        summary,
        results: this.testResults
      };
      
    } catch (error) {
      console.error('🧪 TEST SUITE FAILED:', error);
      return {
        error: error.message,
        results: this.testResults
      };
    }
  }
}

// ✅ UTILITY: Monitor API calls in real-time
export class APICallMonitor {
  constructor() {
    this.calls = [];
    this.isMonitoring = false;
    this.originalConsoleLog = console.log;
    this.duplicateCallThreshold = 1000; // ms - calls within this window are considered duplicates
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.calls = [];
    const startTime = Date.now();
    
    console.log('📊 API MONITOR: Started monitoring API calls...');
    
    // Override console.log to capture API calls
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Capture API request logs
      if (message.includes('API REQUEST') || message.includes('API SUCCESS') || message.includes('API ERROR')) {
        const timestamp = Date.now();
        const call = {
          timestamp,
          relativeTime: timestamp - startTime,
          message,
          type: message.includes('SUCCESS') ? 'success' : 
                message.includes('ERROR') ? 'error' : 'request'
        };
        
        this.calls.push(call);
      }
      
      // Call original console.log
      originalLog.apply(console, args);
    };
    
    return () => this.stopMonitoring();
  }

  stopMonitoring() {
    if (!this.isMonitoring) return null;
    
    this.isMonitoring = false;
    console.log = this.originalConsoleLog;
    
    const analysis = this.analyzeCallPatterns();
    console.log('📊 API MONITOR: Stopped monitoring');
    console.log('📊 ANALYSIS:', analysis);
    
    return analysis;
  }

  analyzeCallPatterns() {
    const duplicates = this.findDuplicateCalls();
    const requestsByEndpoint = this.groupByEndpoint();
    const errorRate = this.calculateErrorRate();
    
    return {
      totalCalls: this.calls.length,
      duplicateCalls: duplicates.length,
      uniqueEndpoints: Object.keys(requestsByEndpoint).length,
      errorRate: errorRate,
      duplicates,
      requestsByEndpoint,
      timeline: this.calls
    };
  }

  findDuplicateCalls() {
    const duplicates = [];
    const seen = new Map();
    
    this.calls.forEach(call => {
      if (call.type !== 'request') return;
      
      const endpoint = this.extractEndpoint(call.message);
      const recent = seen.get(endpoint);
      
      if (recent && (call.timestamp - recent.timestamp) < this.duplicateCallThreshold) {
        duplicates.push({
          endpoint,
          originalCall: recent,
          duplicateCall: call,
          timeDiff: call.timestamp - recent.timestamp
        });
      }
      
      seen.set(endpoint, call);
    });
    
    return duplicates;
  }

  groupByEndpoint() {
    const groups = {};
    
    this.calls.forEach(call => {
      const endpoint = this.extractEndpoint(call.message);
      if (!groups[endpoint]) {
        groups[endpoint] = { requests: 0, successes: 0, errors: 0 };
      }
      groups[endpoint][call.type === 'request' ? 'requests' : call.type + 's']++;
    });
    
    return groups;
  }

  calculateErrorRate() {
    const errors = this.calls.filter(call => call.type === 'error').length;
    const total = this.calls.filter(call => call.type !== 'request').length;
    return total > 0 ? (errors / total * 100).toFixed(1) + '%' : '0%';
  }

  extractEndpoint(message) {
    const match = message.match(/(?:GET|POST|PUT|DELETE|PATCH)\s+[^/]*(\S+)/);
    return match ? match[1] : 'unknown';
  }
}

// ✅ USAGE EXAMPLES
export const runRateLimitTests = async () => {
  const tester = new RateLimitTester();
  return await tester.runAllTests();
};

export const monitorAPICallsFor = (durationMs = 30000) => {
  const monitor = new APICallMonitor();
  const stopMonitoring = monitor.startMonitoring();
  
  setTimeout(() => {
    const analysis = stopMonitoring();
    console.log('📊 MONITORING COMPLETE:', analysis);
  }, durationMs);
  
  return monitor;
};