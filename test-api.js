#!/usr/bin/env node

/**
 * API Test Script for Pronto Home Fix Backend
 * 
 * Tests all major API endpoints and workflows
 * Usage: node test-api.js
 * 
 * Requirements:
 * - Backend running on http://localhost:5000
 * - MySQL database initialized
 * - Node.js installed
 */

const API_URL = 'http://localhost:5000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
let authToken = null;
let userId = null;
let workerId = null;
let bookingId = null;

// Helper function to log with colors
function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
    };
  }
}

// Test result logger
function testResult(testName, passed, details = '') {
  if (passed) {
    testsPassed++;
    log(colors.green, `✓ ${testName}`);
  } else {
    testsFailed++;
    log(colors.red, `✗ ${testName}`);
    if (details) {
      log(colors.red, `  ${details}`);
    }
  }
}

// Main test suite
async function runTests() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'Pronto Home Fix - Backend API Tests');
  log(colors.cyan, '========================================\n');

  log(colors.yellow, '📧 Testing Authentication...\n');

  // Test 1: Register new user
  const uniqueEmail = `test${Date.now()}@example.com`;
  const registerResponse = await apiCall('POST', '/register', {
    email: uniqueEmail,
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    address: '123 Test Street',
  });

  const registerPassed = registerResponse.status === 200 && registerResponse.data.status === 'ok';
  testResult('Register User', registerPassed, 
    registerPassed ? '' : `Status: ${registerResponse.status}, Response: ${JSON.stringify(registerResponse.data)}`);

  // Test 2: Login user
  const loginResponse = await apiCall('POST', '/login', {
    email: uniqueEmail,
    password: 'TestPassword123',
  });

  const loginPassed = loginResponse.status === 200 && loginResponse.data.token;
  testResult('Login User', loginPassed,
    loginPassed ? '' : `Status: ${loginResponse.status}, Response: ${JSON.stringify(loginResponse.data)}`);

  if (loginPassed) {
    authToken = loginResponse.data.token;
    userId = loginResponse.data.user.id;
  } else {
    log(colors.red, '\n❌ Cannot continue tests without valid auth token\n');
    return;
  }

  log(colors.yellow, '\n👤 Testing User Profile...\n');

  // Test 3: Get user profile
  const profileResponse = await apiCall('GET', '/profile', null, authToken);
  const profilePassed = profileResponse.status === 200 && profileResponse.data.user;
  testResult('Get User Profile', profilePassed);

  // Test 4: Update user profile
  const updateResponse = await apiCall('PUT', '/profile', {
    firstName: 'Updated',
    phone: '9876543210',
  }, authToken);

  const updatePassed = updateResponse.status === 200 && updateResponse.data.status === 'ok';
  testResult('Update User Profile', updatePassed);

  log(colors.yellow, '\n🔧 Testing Worker Operations...\n');

  // Test 5: Create worker profile
  const workerProfileResponse = await apiCall('POST', '/worker/profile', {
    category: 'electrician',
    hourlyRate: 500,
    workArea: 'Downtown',
    experience: '5 years',
  }, authToken);

  const workerPassed = workerProfileResponse.status === 200 && workerProfileResponse.data.status === 'ok';
  testResult('Create Worker Profile', workerPassed);

  if (workerPassed && workerProfileResponse.data.worker) {
    workerId = workerProfileResponse.data.worker.id;
  }

  // Test 6: Get worker profile
  const getWorkerResponse = await apiCall('GET', '/worker/profile', null, authToken);
  const getWorkerPassed = getWorkerResponse.status === 200 && getWorkerResponse.data.worker;
  testResult('Get Worker Profile', getWorkerPassed);

  // Test 7: Search workers by category
  const searchResponse = await apiCall('GET', '/workers/category/electrician', null, authToken);
  const searchPassed = searchResponse.status === 200 && Array.isArray(searchResponse.data.workers);
  testResult('Search Workers by Category', searchPassed);

  log(colors.yellow, '\n📅 Testing Booking Operations...\n');

  // First, create another user to book the worker
  const bookerEmail = `booker${Date.now()}@example.com`;
  const bookerRegResponse = await apiCall('POST', '/register', {
    email: bookerEmail,
    password: 'BookerPass123',
    firstName: 'Booker',
    lastName: 'User',
    phone: '1111111111',
    address: '456 Booking Ave',
  });

  let bookerToken = null;
  let bookerId = null;
  if (bookerRegResponse.status === 200) {
    const bookerLoginResponse = await apiCall('POST', '/login', {
      email: bookerEmail,
      password: 'BookerPass123',
    });
    if (bookerLoginResponse.status === 200) {
      bookerToken = bookerLoginResponse.data.token;
      bookerId = bookerLoginResponse.data.user.id;
    }
  }

  if (!bookerToken || !workerId) {
    log(colors.yellow, '⚠️  Skipping booking tests (worker not set up)\n');
  } else {
    // Test 8: Create booking
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const bookingResponse = await apiCall('POST', '/bookings', {
      workerId: workerId,
      category: 'electrician',
      date: futureDate.toISOString().split('T')[0],
      time: '10:00',
      description: 'Need light installation',
      expectedDuration: '2 hours',
      location: 'Test Address',
      amount: 1000,
    }, bookerToken);

    const bookingPassed = bookingResponse.status === 200 && bookingResponse.data.booking;
    testResult('Create Booking', bookingPassed);

    if (bookingPassed) {
      bookingId = bookingResponse.data.booking.id;
    }

    if (bookingId) {
      // Test 9: Get booking details
      const getBookingResponse = await apiCall('GET', `/bookings/${bookingId}`, null, bookerToken);
      const getBookingPassed = getBookingResponse.status === 200 && getBookingResponse.data.booking;
      testResult('Get Booking Details', getBookingPassed);

      // Test 10: Update booking status
      const statusResponse = await apiCall('PUT', `/bookings/${bookingId}/status`, {
        status: 'accepted',
      }, authToken);

      const statusPassed = statusResponse.status === 200 && statusResponse.data.status === 'ok';
      testResult('Update Booking Status', statusPassed);

      // Test 11: Get user bookings
      const userBookingsResponse = await apiCall('GET', '/user/bookings', null, bookerToken);
      const userBookingsPassed = userBookingsResponse.status === 200 && Array.isArray(userBookingsResponse.data.bookings);
      testResult('Get User Bookings', userBookingsPassed);

      // Test 12: Get worker bookings
      const workerBookingsResponse = await apiCall('GET', '/worker/bookings', null, authToken);
      const workerBookingsPassed = workerBookingsResponse.status === 200 && Array.isArray(workerBookingsResponse.data.bookings);
      testResult('Get Worker Bookings', workerBookingsPassed);

      log(colors.yellow, '\n⭐ Testing Review Operations...\n');

      // Update booking to completed before review
      const completeResponse = await apiCall('PUT', `/bookings/${bookingId}/status`, {
        status: 'completed',
      }, authToken);

      if (completeResponse.status === 200) {
        // Test 13: Create review
        const reviewResponse = await apiCall('POST', '/reviews', {
          bookingId: bookingId,
          rating: 5,
          comment: 'Excellent work! Very professional.',
        }, bookerToken);

        const reviewPassed = reviewResponse.status === 200 && reviewResponse.data.status === 'ok';
        testResult('Create Review', reviewPassed);

        // Test 14: Get worker reviews
        const workerReviewsResponse = await apiCall('GET', '/reviews/worker', null, authToken);
        const workerReviewsPassed = workerReviewsResponse.status === 200 && Array.isArray(workerReviewsResponse.data.reviews);
        testResult('Get Worker Reviews', workerReviewsPassed);
      } else {
        log(colors.yellow, '⚠️  Skipping review tests (booking completion failed)\n');
      }
    }
  }

  log(colors.yellow, '\n🚫 Testing Error Handling...\n');

  // Test 15: Invalid login
  const invalidLoginResponse = await apiCall('POST', '/login', {
    email: 'nonexistent@example.com',
    password: 'WrongPassword',
  });

  const invalidLoginPassed = invalidLoginResponse.status === 400 || invalidLoginResponse.status === 401;
  testResult('Invalid Login Rejected', invalidLoginPassed);

  // Test 16: Protected route without token
  const noTokenResponse = await apiCall('GET', '/profile', null, null);
  const noTokenPassed = noTokenResponse.status === 401;
  testResult('Protected Route Without Token', noTokenPassed);

  // Test 17: Booking with invalid worker
  const invalidBookingResponse = await apiCall('POST', '/bookings', {
    workerId: 99999,
    category: 'electrician',
    date: '2025-01-15',
    time: '10:00',
    description: 'Test',
    expectedDuration: '1 hour',
    location: 'Test',
    amount: 500,
  }, bookerToken || authToken);

  const invalidBookingPassed = invalidBookingResponse.status === 400 || invalidBookingResponse.status === 404;
  testResult('Invalid Booking Rejected', invalidBookingPassed);

  // Summary
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'Test Summary');
  log(colors.cyan, '========================================\n');

  const totalTests = testsPassed + testsFailed;
  log(colors.green, `✓ Passed: ${testsPassed}`);
  log(colors.red, `✗ Failed: ${testsFailed}`);
  log(colors.blue, `📊 Total: ${totalTests}`);

  if (testsFailed === 0) {
    log(colors.green, '\n🎉 All tests passed!\n');
  } else {
    log(colors.yellow, `\n⚠️  ${testsFailed} test(s) failed. Check the output above.\n`);
  }

  log(colors.cyan, 'Test Details:');
  log(colors.cyan, `- Server: ${API_URL}`);
  log(colors.cyan, `- Test Email: ${uniqueEmail}`);
  if (authToken) {
    log(colors.cyan, `- Auth Token: ${authToken.substring(0, 20)}...`);
  }
  log(colors.cyan, '========================================\n');
}

// Check if backend is running
async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Run tests
(async () => {
  log(colors.yellow, 'Checking backend connection...');
  
  const connected = await checkBackendConnection();
  if (!connected) {
    log(colors.red, '\n❌ Cannot connect to backend server');
    log(colors.red, `Make sure backend is running on ${API_URL}`);
    log(colors.yellow, '\nTo start backend:');
    log(colors.cyan, '  cd server');
    log(colors.cyan, '  npm run dev\n');
    process.exit(1);
  }

  log(colors.green, '✓ Backend is running\n');
  
  await runTests();
})();
