// backend/src/scripts/seed-properties.js
// Run this to add sample properties to your database for testing the map

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProperties = [
  {
    title: "Downtown Atlanta Office Complex",
    name: "Peachtree Center",
    description: "Prime downtown location with high foot traffic and excellent visibility. Perfect for advertising campaigns targeting business professionals.",
    address: "235 Peachtree St NE",
    city: "Atlanta",
    state: "GA",
    country: "US",
    zipCode: "30303",
    latitude: 33.7590,
    longitude: -84.3880,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 250000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    basePrice: 1500,
    pricing: JSON.stringify({
      daily: 150,
      weekly: 900,
      monthly: 3500
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    title: "Buckhead Shopping District",
    name: "Lenox Square Area",
    description: "High-end retail district with affluent shoppers. Excellent location for luxury brand advertising and premium product campaigns.",
    address: "3393 Peachtree Rd NE",
    city: "Atlanta",
    state: "GA", 
    country: "US",
    zipCode: "30326",
    latitude: 33.8490,
    longitude: -84.3590,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 15000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    basePrice: 2500,
    pricing: JSON.stringify({
      daily: 250,
      weekly: 1500,
      monthly: 6000
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    title: "Midtown Cultural District",
    name: "Fox Theatre Complex",
    description: "Historic entertainment district with diverse demographics. Perfect for cultural events, entertainment, and lifestyle brand advertising.",
    address: "660 Peachtree St NE",
    city: "Atlanta",
    state: "GA",
    country: "US", 
    zipCode: "30308",
    latitude: 33.7720,
    longitude: -84.3850,
    propertyType: "COMMERCIAL",
    spaceType: "event_venue",
    size: 45000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    basePrice: 3000,
    pricing: JSON.stringify({
      daily: 300,
      weekly: 1800, 
      monthly: 7200
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    title: "Virginia-Highland District",
    name: "Amsterdam Walk",
    description: "Trendy neighborhood with young professionals and creatives. Great for lifestyle brands, restaurants, and local business advertising.",
    address: "1034 N Highland Ave NE", 
    city: "Atlanta",
    state: "GA",
    country: "US",
    zipCode: "30306",
    latitude: 33.7890,
    longitude: -84.3530,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 8500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    basePrice: 1200,
    pricing: JSON.stringify({
      daily: 120,
      weekly: 720,
      monthly: 2800
    }),
    currency: "USD",
    status: "ACTIVE", 
    isActive: true,
    isApproved: true
  },
  {
    title: "Westside Beltline Corridor",
    name: "Beltline West End",
    description: "Popular walking and cycling trail with heavy pedestrian traffic. Ideal for fitness, lifestyle, and outdoor gear advertising.",
    address: "1100 White St SW",
    city: "Atlanta", 
    state: "GA",
    country: "US",
    zipCode: "30310",
    latitude: 33.7350,
    longitude: -84.4120,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 5000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", 
    basePrice: 800,
    pricing: JSON.stringify({
      daily: 80,
      weekly: 480,
      monthly: 1800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  }
];

const sampleAdvertisingAreas = [
  // Areas for Downtown Atlanta Office Complex
  {
    name: "Lobby Digital Display Wall",
    title: "Premium Lobby Display",
    description: "Large digital display wall in the main lobby with 50,000+ daily impressions from office workers and visitors.",
    type: "digital_display",
    dimensions: JSON.stringify({ width: 12, height: 8, units: "ft" }),
    features: JSON.stringify(["digital", "high-traffic", "indoor", "climate-controlled"]),
    coordinates: JSON.stringify({ lat: 33.7590, lng: -84.3880 }),
    city: "Atlanta",
    state: "GA", 
    country: "US",
    baseRate: 250,
    pricing: JSON.stringify({
      daily: 250,
      weekly: 1500,
      monthly: 6000
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ])
  },
  {
    name: "Elevator Bank Displays",
    title: "Elevator Advertising Network", 
    description: "Digital displays at all elevator banks on floors 1-20. Captive audience during wait times.",
    type: "digital_display",
    dimensions: JSON.stringify({ width: 4, height: 6, units: "ft" }),
    features: JSON.stringify(["digital", "captive-audience", "indoor", "multiple-units"]),
    coordinates: JSON.stringify({ lat: 33.7590, lng: -84.3880 }),
    city: "Atlanta",
    state: "GA",
    country: "US", 
    baseRate: 150,
    pricing: JSON.stringify({
      daily: 150,
      weekly: 900,
      monthly: 3500
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ])
  },
  
  // Areas for Buckhead Shopping District
  {
    name: "Main Entrance Billboard",
    title: "Premium Storefront Display",
    description: "Large illuminated billboard at the main shopping entrance. High visibility for luxury shoppers.",
    type: "billboard",
    dimensions: JSON.stringify({ width: 20, height: 10, units: "ft" }),
    features: JSON.stringify(["illuminated", "high-traffic", "outdoor", "luxury-audience"]),
    coordinates: JSON.stringify({ lat: 33.8490, lng: -84.3590 }),
    city: "Atlanta",
    state: "GA",
    country: "US",
    baseRate: 400,
    pricing: JSON.stringify({
      daily: 400,
      weekly: 2400,
      monthly: 9500
    }),
    rateType: "DAILY", 
    currency: "USD",
    status: "active",
    isActive: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ])
  },

  // Areas for Midtown Cultural District
  {
    name: "Theatre Marquee Display",
    title: "Historic Theatre Marquee",
    description: "Digital marquee display on historic theatre facade. Seen by thousands of event attendees.",
    type: "digital_display",
    dimensions: JSON.stringify({ width: 15, height: 6, units: "ft" }),
    features: JSON.stringify(["digital", "historic", "entertainment", "evening-traffic"]),
    coordinates: JSON.stringify({ lat: 33.7720, lng: -84.3850 }),
    city: "Atlanta",
    state: "GA",
    country: "US",
    baseRate: 350,
    pricing: JSON.stringify({
      daily: 350,
      weekly: 2100,
      monthly: 8000
    }),
    rateType: "DAILY",
    currency: "USD", 
    status: "active",
    isActive: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
    ])
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // First, create a test user (you'll need to replace this with a real user ID from your Clerk users)
    let testUser;
    try {
      testUser = await prisma.user.findFirst({
        where: { email: { contains: 'test' } }
      });
      
      if (!testUser) {
        console.log('Creating test user...');
        testUser = await prisma.user.create({
          data: {
            clerkId: 'test_user_123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            full_name: 'Test User',
            role: 'PROPERTY_OWNER'
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Could not create test user, using fallback...');
      // If user creation fails, we'll skip the user relationship for now
    }

    // Create properties
    console.log('🏢 Creating sample properties...');
    const createdProperties = [];
    
    for (const propertyData of sampleProperties) {
      const property = await prisma.property.create({
        data: {
          ...propertyData,
          ownerId: testUser?.id || 'fallback_user_id' // Use test user or fallback
        }
      });
      createdProperties.push(property);
      console.log(`✅ Created property: ${property.title}`);
    }

    // Create advertising areas and link them to properties
    console.log('📍 Creating sample advertising areas...');
    
    for (let i = 0; i < sampleAdvertisingAreas.length; i++) {
      const areaData = sampleAdvertisingAreas[i];
      const propertyIndex = Math.floor(i / 2); // 2 areas per property approximately
      const property = createdProperties[propertyIndex] || createdProperties[0];
      
      const area = await prisma.advertisingArea.create({
        data: {
          ...areaData,
          propertyId: property.id
        }
      });
      console.log(`✅ Created advertising area: ${area.name} for ${property.title}`);
    }

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created: ${createdProperties.length} properties and ${sampleAdvertisingAreas.length} advertising areas`);
    console.log('');
    console.log('🗺️ Your map should now show sample data when you refresh the page!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDatabase();