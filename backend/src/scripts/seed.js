// backend/src/scripts/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ===== YOUR ACTUAL CLERK USER ID =====
  const YOUR_CLERK_USER_ID = 'user_2zYtvI2SuXOhnpykEWdkI5pn42B'; // Michael Anderson's Clerk ID
  
  // Clear existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.paymentReminder.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.propertyApproval.deleteMany();
  await prisma.property.deleteMany();
  await prisma.advertisingArea.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.paymentSettings.deleteMany();
  await prisma.user.deleteMany();

  // Create advertising areas
  console.log('📍 Creating advertising areas...');
  const advertisingAreas = await prisma.advertisingArea.createMany({
    data: [
      {
        id: 'area-1',
        name: 'Downtown Core',
        description: 'Prime downtown advertising space with high foot traffic',
        city: 'Atlanta',
        state: 'GA',
        country: 'US',
        coordinates: JSON.stringify([
          [-84.3879, 33.7490], // Atlanta coordinates
          [-84.3850, 33.7490],
          [-84.3850, 33.7520],
          [-84.3879, 33.7520]
        ]),
        baseRate: 250.00,
        rateType: 'DAILY',
        currency: 'USD',
        isActive: true,
        maxBookings: 5
      },
      {
        id: 'area-2',
        name: 'Midtown Arts District',
        description: 'Cultural hub with galleries and theaters',
        city: 'Atlanta',
        state: 'GA',
        country: 'US',
        coordinates: JSON.stringify([
          [-84.3850, 33.7520],
          [-84.3820, 33.7520],
          [-84.3820, 33.7550],
          [-84.3850, 33.7550]
        ]),
        baseRate: 200.00,
        rateType: 'DAILY',
        currency: 'USD',
        isActive: true,
        maxBookings: 3
      },
      {
        id: 'area-3',
        name: 'Buckhead Shopping',
        description: 'Upscale shopping district with luxury brands',
        city: 'Atlanta',
        state: 'GA',
        country: 'US',
        coordinates: JSON.stringify([
          [-84.3820, 33.7550],
          [-84.3790, 33.7550],
          [-84.3790, 33.7580],
          [-84.3820, 33.7580]
        ]),
        baseRate: 300.00,
        rateType: 'DAILY',
        currency: 'USD',
        isActive: true,
        maxBookings: 4
      }
    ]
  });

  console.log('✅ Created 3 advertising areas');

  // Create sample users - INCLUDING YOUR REAL USER
  console.log('👥 Creating sample users...');
  const users = await Promise.all([
    // YOUR REAL USER ACCOUNT
    prisma.user.create({
      data: {
        id: 'real-user-michael',
        clerkId: YOUR_CLERK_USER_ID, // Your actual Clerk ID
        email: 'michael@elaview.com', // Update with your real email
        firstName: 'Michael',
        lastName: 'Anderson',
        role: 'ADVERTISER', // You can be both advertiser and property owner
        phone: '+1-555-0199'
      }
    }),
    // Sample property owner
    prisma.user.create({
      data: {
        id: 'user-1',
        clerkId: 'clerk_sample_1',
        email: 'john.owner@example.com',
        firstName: 'John',
        lastName: 'PropertyOwner',
        role: 'PROPERTY_OWNER',
        phone: '+1-555-0101'
      }
    }),
    // Sample advertiser
    prisma.user.create({
      data: {
        id: 'user-2',
        clerkId: 'clerk_sample_2',
        email: 'sarah.advertiser@example.com',
        firstName: 'Sarah',
        lastName: 'Advertiser',
        role: 'ADVERTISER',
        phone: '+1-555-0102'
      }
    }),
    // Sample guest
    prisma.user.create({
      data: {
        id: 'user-3',
        clerkId: 'clerk_sample_3',
        email: 'mike.guest@example.com',
        firstName: 'Mike',
        lastName: 'Guest',
        role: 'USER',
        phone: '+1-555-0103'
      }
    }),
    // Admin user
    prisma.user.create({
      data: {
        id: 'admin-1',
        clerkId: 'clerk_admin_1',
        email: 'admin@elaview.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        phone: '+1-555-0100'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample properties - SOME OWNED BY YOU
  console.log('🏠 Creating sample properties...');
  const properties = await Promise.all([
    // Property owned by you
    prisma.property.create({
      data: {
        id: 'prop-1',
        title: 'Modern Downtown Loft',
        description: 'Stunning modern loft in the heart of downtown Atlanta with floor-to-ceiling windows and city views.',
        address: '100 Peachtree St NE',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30303',
        country: 'US',
        latitude: 33.7490,
        longitude: -84.3879,
        propertyType: 'APARTMENT',
        ownerId: 'real-user-michael', // YOU own this property
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1560448204-e024bbcb1de5?w=800'
        ],
        videos: [],
        documents: [],
        basePrice: 150.00,
        currency: 'USD',
        size: 1200,
        bedrooms: 2,
        bathrooms: 2,
        status: 'APPROVED',
        isActive: true,
        isApproved: true
      }
    }),
    // Property owned by sample user
    prisma.property.create({
      data: {
        id: 'prop-2',
        title: 'Midtown Arts Studio',
        description: 'Charming studio apartment in the vibrant Midtown arts district, perfect for creative professionals.',
        address: '500 Arts Center Way',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        country: 'US',
        latitude: 33.7535,
        longitude: -84.3863,
        propertyType: 'APARTMENT',
        ownerId: 'user-1', // Owned by John PropertyOwner
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        videos: [],
        documents: [],
        basePrice: 95.00,
        currency: 'USD',
        size: 600,
        bedrooms: 1,
        bathrooms: 1,
        status: 'APPROVED',
        isActive: true,
        isApproved: true
      }
    }),
    // Another property owned by sample user
    prisma.property.create({
      data: {
        id: 'prop-3',
        title: 'Buckhead Luxury Suite',
        description: 'Elegant luxury suite in prestigious Buckhead with premium amenities and shopping nearby.',
        address: '3000 Buckhead Plaza',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30305',
        country: 'US',
        latitude: 33.7565,
        longitude: -84.3805,
        propertyType: 'APARTMENT',
        ownerId: 'user-1', // Owned by John PropertyOwner
        images: [
          'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
          'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800'
        ],
        videos: [],
        documents: [],
        basePrice: 275.00,
        currency: 'USD',
        size: 2000,
        bedrooms: 3,
        bathrooms: 3,
        status: 'APPROVED',
        isActive: true,
        isApproved: true
      }
    })
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // Create sample campaigns - CREATED BY YOU
  console.log('📢 Creating sample campaigns...');
  const campaigns = await Promise.all([
    // Campaign created by YOU
    prisma.campaign.create({
      data: {
        id: 'camp-1',
        title: 'My Tech Startup Promotion',
        description: 'Promoting my new AI-powered mobile app targeting young professionals in downtown Atlanta.',
        propertyId: 'prop-1',
        advertiserId: 'real-user-michael', // YOU created this campaign
        budget: 2500.00,
        dailyBudget: 100.00,
        currency: 'USD',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        status: 'ACTIVE',
        isActive: true,
        targetAudience: {
          demographics: 'Young professionals, tech enthusiasts',
          ageRange: '25-40',
          interests: ['technology', 'startups', 'mobile apps']
        },
        keywords: ['tech', 'startup', 'mobile app', 'AI', 'downtown'],
        impressions: 15000,
        clicks: 1200,
        conversions: 85,
        totalSpent: 1200.00
      }
    }),
    // Another campaign created by YOU
    prisma.campaign.create({
      data: {
        id: 'camp-2',
        title: 'My Local Business Campaign',
        description: 'Promoting my local Atlanta business with targeted advertising.',
        propertyId: 'prop-2',
        advertiserId: 'real-user-michael', // YOU created this campaign
        budget: 1800.00,
        dailyBudget: 60.00,
        currency: 'USD',
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-10-15'),
        status: 'PENDING_APPROVAL',
        isActive: false,
        targetAudience: {
          demographics: 'Local customers, families',
          ageRange: '25-65',
          interests: ['local business', 'community', 'Atlanta']
        },
        keywords: ['local', 'business', 'atlanta', 'community'],
        impressions: 0,
        clicks: 0,
        conversions: 0,
        totalSpent: 0.00
      }
    }),
    // Sample campaign by other user
    prisma.campaign.create({
      data: {
        id: 'camp-3',
        title: 'Luxury Brand Launch',
        description: 'Exclusive luxury fashion brand launch targeting affluent Buckhead residents.',
        propertyId: 'prop-3',
        advertiserId: 'user-2', // Created by Sarah Advertiser
        budget: 5000.00,
        dailyBudget: 200.00,
        currency: 'USD',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-08-15'),
        status: 'DRAFT',
        isActive: false,
        targetAudience: {
          demographics: 'High-income individuals, luxury shoppers',
          ageRange: '30-55',
          interests: ['luxury', 'fashion', 'high-end brands']
        },
        keywords: ['luxury', 'fashion', 'buckhead', 'premium', 'exclusive'],
        impressions: 0,
        clicks: 0,
        conversions: 0,
        totalSpent: 0.00
      }
    })
  ]);

  console.log(`✅ Created ${campaigns.length} campaigns`);

  // Create sample bookings - SOME BY YOU
  console.log('📅 Creating sample bookings...');
  const bookings = await Promise.all([
    // Booking made by YOU
    prisma.booking.create({
      data: {
        id: 'book-1',
        bookerId: 'real-user-michael', // YOU made this booking
        propertyId: 'prop-1',
        campaignId: 'camp-1',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        totalAmount: 4650.00, // 31 days * $150
        currency: 'USD',
        status: 'CONFIRMED',
        isPaid: true,
        notes: 'My tech startup campaign setup',
        metadata: {
          campaignType: 'digital_advertising',
          expectedImpressions: 50000
        }
      }
    }),
    // Another booking by YOU
    prisma.booking.create({
      data: {
        id: 'book-2',
        bookerId: 'real-user-michael', // YOU made this booking
        propertyId: 'prop-2',
        campaignId: 'camp-2',
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-10-15'),
        totalAmount: 2850.00, // 30 days * $95
        currency: 'USD',
        status: 'PENDING',
        isPaid: false,
        notes: 'My local business promotional campaign',
        metadata: {
          campaignType: 'local_promotion',
          businessType: 'technology'
        }
      }
    })
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create sample invoices - FOR YOU
  console.log('💰 Creating sample invoices...');
  const invoices = await Promise.all([
    // Invoice for YOU
    prisma.invoice.create({
      data: {
        id: 'inv-1',
        invoiceNumber: 'INV-2025-000001',
        userId: 'real-user-michael', // YOUR invoice
        bookingId: 'book-1',
        campaignId: 'camp-1',
        amount: 4650.00,
        currency: 'USD',
        description: 'My Tech Startup Promotion - Property Booking',
        dueDate: new Date('2025-07-25'),
        status: 'PAID',
        isPaid: true,
        paidAt: new Date('2025-07-20'),
        paymentMethod: 'credit_card'
      }
    }),
    // Another invoice for YOU
    prisma.invoice.create({
      data: {
        id: 'inv-2',
        invoiceNumber: 'INV-2025-000002',
        userId: 'real-user-michael', // YOUR invoice
        bookingId: 'book-2',
        campaignId: 'camp-2',
        amount: 2850.00,
        currency: 'USD',
        description: 'My Local Business Campaign - Property Booking',
        dueDate: new Date('2025-09-01'),
        status: 'PENDING',
        isPaid: false
      }
    })
  ]);

  console.log(`✅ Created ${invoices.length} invoices`);

  // Create sample messages - TO/FROM YOU
  console.log('💬 Creating sample messages...');
  const messages = await Promise.all([
    // Message TO you
    prisma.message.create({
      data: {
        id: 'msg-1',
        senderId: 'user-1',
        recipientId: 'real-user-michael', // Message TO you
        subject: 'Welcome to Elaview!',
        content: 'Hi Michael! Welcome to our platform. Your downtown loft property looks great and your tech campaign is performing well.',
        type: 'GENERAL',
        priority: 'NORMAL',
        isRead: false
      }
    }),
    // Message FROM you
    prisma.message.create({
      data: {
        id: 'msg-2',
        senderId: 'real-user-michael', // Message FROM you
        recipientId: 'admin-1',
        subject: 'Question about Campaign Analytics',
        content: 'Hi Admin! I\'d like to know more about the detailed analytics for my tech startup campaign. Can you help?',
        type: 'GENERAL',
        priority: 'NORMAL',
        isRead: false
      }
    })
  ]);

  console.log(`✅ Created ${messages.length} messages`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • ${users.length} users created (including YOUR real account)`);
  console.log(`   • 3 advertising areas created`);
  console.log(`   • ${properties.length} properties created (1 owned by YOU)`);
  console.log(`   • ${campaigns.length} campaigns created (2 created by YOU)`);
  console.log(`   • ${bookings.length} bookings created (2 made by YOU)`);
  console.log(`   • ${invoices.length} invoices created (2 for YOU)`);
  console.log(`   • ${messages.length} messages created (involving YOU)`);
  
  console.log('\n🔗 Test URLs:');
  console.log('   • Dashboard: http://localhost:3000/dashboard');
  console.log('   • Map: http://localhost:3000/map');
  console.log('   • Properties: http://localhost:3000/propertymanagement');
  console.log('   • Campaigns: http://localhost:3000/createcampaign');
  console.log('   • Messages: http://localhost:3000/messages');
  console.log('   • Invoices: http://localhost:3000/invoices');

  console.log('\n📝 YOUR Data:');
  console.log('   • YOUR Account: Michael Anderson (real Clerk ID)');
  console.log('   • YOUR Property: Modern Downtown Loft ($150/night)');
  console.log('   • YOUR Campaigns: Tech Startup ($2,500) + Local Business ($1,800)');
  console.log('   • YOUR Bookings: 2 confirmed bookings');
  console.log('   • YOUR Invoices: 1 paid ($4,650) + 1 pending ($2,850)');
  console.log('   • YOUR Messages: Welcome message + your question to admin');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });