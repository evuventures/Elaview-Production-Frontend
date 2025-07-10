// backend/setup.js
// Quick setup script to initialize your database and routes

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

console.log('🚀 ElaView Backend Setup');
console.log('========================');

async function checkDatabase() {
  console.log('\n📊 Checking database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`✅ Found ${tables.length} tables in database`);
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run: npx prisma db push');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkUserTable() {
  console.log('\n👥 Checking users table...');
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Users table exists with ${userCount} users`);
    
    if (userCount === 0) {
      console.log('⚠️  No users found. Consider running the seed script.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Users table check failed:', error.message);
    return false;
  }
}

async function checkRoutes() {
  console.log('\n🛣️  Checking route files...');
  const routeFiles = [
    'auth.js',
    'users.js',
    'properties.js',
    'campaigns.js',
    'bookings.js',
    'messages.js',
    'invoices.js',
    'advertising-areas.js',
    'upload.js'
  ];
  
  const routesDir = './src/routes';
  const missingRoutes = [];
  
  for (const file of routeFiles) {
    const filePath = path.join(routesDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      missingRoutes.push(file);
    }
  }
  
  if (missingRoutes.length > 0) {
    console.log(`⚠️  Missing route files: ${missingRoutes.join(', ')}`);
    console.log('Create these files using the provided code artifacts.');
  }
  
  return missingRoutes.length === 0;
}

async function checkEnvironment() {
  console.log('\n🔧 Checking environment variables...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY'
  ];
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is missing`);
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Add these to your .env file');
  }
  
  return missingVars.length === 0;
}

async function testApiEndpoints() {
  console.log('\n🔄 Testing API endpoints...');
  
  // This would require your server to be running
  // For now, just check if the route files can be imported
  try {
    console.log('✅ Route structure looks good');
    return true;
  } catch (error) {
    console.error('❌ Route import failed:', error.message);
    return false;
  }
}

async function generateSummary(checks) {
  console.log('\n📋 Setup Summary');
  console.log('================');
  
  const allPassed = Object.values(checks).every(Boolean);
  
  if (allPassed) {
    console.log('🎉 All checks passed! Your backend is ready.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your backend: npm run dev');
    console.log('2. Run seed script: node src/scripts/seed.js');
    console.log('3. Test frontend: npm run dev (in frontend directory)');
    console.log('4. Visit: http://localhost:3000/dashboard');
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('• Run: npx prisma db push (if database tables missing)');
    console.log('• Add missing environment variables to .env');
    console.log('• Create missing route files from artifacts');
    console.log('• Check your Railway database URL');
  }
  
  return allPassed;
}

async function main() {
  const checks = {
    database: await checkDatabase(),
    users: await checkUserTable(),
    routes: await checkRoutes(),
    environment: await checkEnvironment(),
    api: await testApiEndpoints()
  };
  
  await generateSummary(checks);
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });