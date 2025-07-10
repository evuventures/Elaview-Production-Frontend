// backend/test-routes.js
// Quick script to test all your API routes

const API_BASE = 'http://localhost:5000/api';

const routes = [
  { method: 'GET', path: '/health', auth: false },
  { method: 'GET', path: '/api/health', auth: false },
  { method: 'GET', path: '/users/me', auth: true },
  { method: 'GET', path: '/campaigns', auth: true },
  { method: 'GET', path: '/properties', auth: true },
  { method: 'GET', path: '/bookings', auth: true },
  { method: 'GET', path: '/messages', auth: true },
  { method: 'GET', path: '/invoices', auth: true },
  { method: 'GET', path: '/advertising-areas', auth: true }
];

async function testRoute(route) {
  const url = route.path.startsWith('/api') ? 
    `http://localhost:5000${route.path}` : 
    `${API_BASE}${route.path}`;
    
  try {
    const response = await fetch(url, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, you'd need actual auth token here
        ...(route.auth && { 'Authorization': 'Bearer YOUR_TEST_TOKEN' })
      }
    });

    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    if (route.auth && status === 401) {
      console.log(`✅ ${route.method} ${route.path} - Auth required (expected)`);
    } else if (!route.auth && status === 200) {
      console.log(`✅ ${route.method} ${route.path} - Public route working`);
    } else if (route.auth && status === 200) {
      console.log(`✅ ${route.method} ${route.path} - Protected route working`);
    } else {
      console.log(`⚠️  ${route.method} ${route.path} - Status: ${status}`);
    }
    
    return { route: route.path, status, success: data.success };
  } catch (error) {
    console.log(`❌ ${route.method} ${route.path} - Error: ${error.message}`);
    return { route: route.path, status: 0, error: error.message };
  }
}

async function testAllRoutes() {
  console.log('🧪 Testing API Routes');
  console.log('====================');
  console.log('Note: Auth routes will show 401 (expected without token)\n');
  
  const results = [];
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('\n📊 Summary');
  console.log('==========');
  
  const publicRoutes = results.filter(r => r.route.includes('health'));
  const authRoutes = results.filter(r => !r.route.includes('health'));
  
  const publicWorking = publicRoutes.filter(r => r.status === 200).length;
  const authReturning401 = authRoutes.filter(r => r.status === 401).length;
  
  console.log(`✅ Public routes working: ${publicWorking}/${publicRoutes.length}`);
  console.log(`✅ Auth routes requiring token: ${authReturning401}/${authRoutes.length}`);
  
  if (publicWorking === publicRoutes.length && authReturning401 === authRoutes.length) {
    console.log('\n🎉 All routes are configured correctly!');
    console.log('Next step: Run the seed script to add test data');
  } else {
    console.log('\n⚠️  Some routes may need attention');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      console.log('🚀 Server is running on port 5000\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server not running on port 5000');
    console.log('Start your server with: npm run dev');
    return false;
  }
  return false;
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAllRoutes();
  }
}

main().catch(console.error);
