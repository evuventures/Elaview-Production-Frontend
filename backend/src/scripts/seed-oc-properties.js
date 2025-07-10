// backend/src/scripts/seed-oc-properties.js
// Run this to add 15 Orange County properties with realistic advertising areas
// Updated to match your exact Prisma schema

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const orangeCountyProperties = [
  {
    id: 'prop_1_fashion_island',
    title: "Newport Beach Fashion Island",
    name: "Fashion Island Shopping Center",
    description: "Premium outdoor shopping center in affluent Newport Beach. High-end shoppers and tourists with significant disposable income.",
    address: "1145 Newport Center Dr",
    city: "Newport Beach",
    state: "CA",
    country: "US",
    zipCode: "92660",
    latitude: 33.6169,
    longitude: -117.8742,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 125000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    basePrice: 3500,
    pricing: JSON.stringify({
      daily: 350,
      weekly: 2100,
      monthly: 8500
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_2_irvine_tech',
    title: "Irvine Tech Campus",
    name: "Irvine Company Tech Center",
    description: "Major tech hub with Fortune 500 companies. Highly educated workforce and decision-makers in technology sector.",
    address: "18400 Von Karman Ave",
    city: "Irvine",
    state: "CA",
    country: "US",
    zipCode: "92612",
    latitude: 33.6846,
    longitude: -117.8265,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 180000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    basePrice: 2800,
    pricing: JSON.stringify({
      daily: 280,
      weekly: 1680,
      monthly: 6800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_3_anaheim_convention',
    title: "Anaheim Convention Center",
    name: "Anaheim Convention Center",
    description: "Major convention and event venue near Disneyland. International visitors and business travelers from diverse industries.",
    address: "800 W Katella Ave",
    city: "Anaheim",
    state: "CA",
    country: "US",
    zipCode: "92802",
    latitude: 33.8014,
    longitude: -117.9187,
    propertyType: "COMMERCIAL",
    spaceType: "event_venue",
    size: 195000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    basePrice: 4200,
    pricing: JSON.stringify({
      daily: 420,
      weekly: 2520,
      monthly: 10200
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_4_south_coast_plaza',
    title: "Costa Mesa South Coast Plaza",
    name: "South Coast Plaza",
    description: "Luxury shopping destination with highest sales per square foot. Ultra-high-end consumer base and international shoppers.",
    address: "3333 Bristol St",
    city: "Costa Mesa",
    state: "CA",
    country: "US",
    zipCode: "92626",
    latitude: 33.6895,
    longitude: -117.8900,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 280000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    basePrice: 5000,
    pricing: JSON.stringify({
      daily: 500,
      weekly: 3000,
      monthly: 12000
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_5_huntington_pier',
    title: "Huntington Beach Pier Plaza",
    name: "Main Street Pier District",
    description: "Iconic beach destination with millions of annual visitors. Perfect for lifestyle, sports, and tourism-related advertising.",
    address: "300 Pacific Coast Hwy",
    city: "Huntington Beach",
    state: "CA",
    country: "US",
    zipCode: "92648",
    latitude: 33.6553,
    longitude: -118.0063,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 15000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 2200,
    pricing: JSON.stringify({
      daily: 220,
      weekly: 1320,
      monthly: 5300
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_6_mission_viejo',
    title: "Mission Viejo Town Center",
    name: "The Shops at Mission Viejo",
    description: "Family-oriented shopping center in affluent suburban community. Great for family services, education, and retail brands.",
    address: "555 The Shops at Mission Viejo",
    city: "Mission Viejo",
    state: "CA",
    country: "US",
    zipCode: "92691",
    latitude: 33.5581,
    longitude: -117.6536,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 95000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    basePrice: 1800,
    pricing: JSON.stringify({
      daily: 180,
      weekly: 1080,
      monthly: 4300
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_7_fullerton_transit',
    title: "Fullerton Transportation Center",
    name: "Fullerton Transit Hub",
    description: "Major transportation hub with train, bus, and commuter traffic. High visibility for commuter-focused advertising.",
    address: "120 E Santa Fe Ave",
    city: "Fullerton",
    state: "CA",
    country: "US",
    zipCode: "92832",
    latitude: 33.8706,
    longitude: -117.9251,
    propertyType: "OTHER",
    spaceType: "transit_station",
    size: 8500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    basePrice: 1200,
    pricing: JSON.stringify({
      daily: 120,
      weekly: 720,
      monthly: 2900
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_8_laguna_beach',
    title: "Laguna Beach Art District",
    name: "Main Beach Art Gallery District",
    description: "Artistic and cultural hub with galleries, restaurants, and boutiques. Affluent art collectors and cultural tourists.",
    address: "1000 Main Beach Dr",
    city: "Laguna Beach",
    state: "CA",
    country: "US",
    zipCode: "92651",
    latitude: 33.5427,
    longitude: -117.7854,
    propertyType: "COMMERCIAL",
    spaceType: "retail",
    size: 12000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    basePrice: 2600,
    pricing: JSON.stringify({
      daily: 260,
      weekly: 1560,
      monthly: 6200
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_9_tustin_legacy',
    title: "Tustin Legacy Mixed-Use",
    name: "Tustin Legacy Business District",
    description: "Modern mixed-use development with offices, retail, and dining. Young professionals and tech workers.",
    address: "2437 Park Ave",
    city: "Tustin",
    state: "CA",
    country: "US",
    zipCode: "92782",
    latitude: 33.7175,
    longitude: -117.8311,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 75000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    basePrice: 2000,
    pricing: JSON.stringify({
      daily: 200,
      weekly: 1200,
      monthly: 4800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_10_garden_grove',
    title: "Garden Grove Shopping Center",
    name: "Garden Grove Marketplace",
    description: "Community shopping center serving diverse multicultural population. Great for local services and ethnic brands.",
    address: "9896 Garden Grove Blvd",
    city: "Garden Grove",
    state: "CA",
    country: "US",
    zipCode: "92844",
    latitude: 33.7739,
    longitude: -117.9426,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 85000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    basePrice: 1400,
    pricing: JSON.stringify({
      daily: 140,
      weekly: 840,
      monthly: 3400
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_11_orange_circle',
    title: "Orange Circle Historic District",
    name: "Old Towne Orange Plaza",
    description: "Historic downtown district with antique shops, restaurants, and events. Historic charm attracts visitors and locals.",
    address: "149 N Glassell St",
    city: "Orange",
    state: "CA",
    country: "US",
    zipCode: "92866",
    latitude: 33.7878,
    longitude: -117.8531,
    propertyType: "COMMERCIAL",
    spaceType: "retail",
    size: 25000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    basePrice: 1600,
    pricing: JSON.stringify({
      daily: 160,
      weekly: 960,
      monthly: 3800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_12_yorba_linda',
    title: "Yorba Linda Town Center",
    name: "Yorba Linda Promenade",
    description: "Upscale shopping and dining in affluent residential area. High-income families and professionals.",
    address: "19020 Yorba Linda Blvd",
    city: "Yorba Linda",
    state: "CA",
    country: "US",
    zipCode: "92886",
    latitude: 33.8886,
    longitude: -117.8131,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 65000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    basePrice: 2400,
    pricing: JSON.stringify({
      daily: 240,
      weekly: 1440,
      monthly: 5800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_13_dana_point',
    title: "Dana Point Harbor",
    name: "Dana Point Harbor District",
    description: "Scenic harbor with restaurants, shops, and tourism. Boaters, tourists, and coastal lifestyle enthusiasts.",
    address: "34675 Golden Lantern St",
    city: "Dana Point",
    state: "CA",
    country: "US",
    zipCode: "92629",
    latitude: 33.4676,
    longitude: -117.6981,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 18000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 1900,
    pricing: JSON.stringify({
      daily: 190,
      weekly: 1140,
      monthly: 4600
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_14_cypress_business',
    title: "Cypress Business Park",
    name: "Cypress Corporate Center",
    description: "Industrial and business park with manufacturing and logistics companies. B2B focused audience and commercial vehicles.",
    address: "5777 W Century Blvd",
    city: "Cypress",
    state: "CA",
    country: "US",
    zipCode: "90630",
    latitude: 33.8169,
    longitude: -118.0370,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 120000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    basePrice: 1500,
    pricing: JSON.stringify({
      daily: 150,
      weekly: 900,
      monthly: 3600
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_15_fountain_valley',
    title: "Fountain Valley Recreation Center",
    name: "Mile Square Regional Park",
    description: "Large recreational facility with sports fields, golf course, and events. Active families and sports enthusiasts.",
    address: "16801 Euclid St",
    city: "Fountain Valley",
    state: "CA",
    country: "US",
    zipCode: "92708",
    latitude: 33.7142,
    longitude: -117.9428,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 35000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 1300,
    pricing: JSON.stringify({
      daily: 130,
      weekly: 780,
      monthly: 3100
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  }
];

const orangeCountyAdvertisingAreas = [
  // Fashion Island (Property 1) - 3 areas
  {
    id: 'area_1_fashion_entrance',
    name: "Main Entrance Digital Billboard",
    title: "Fashion Island Entrance Display",
    description: "Large digital billboard at main Newport Center entrance. 75,000+ daily vehicle impressions from affluent shoppers.",
    type: "digital_display",
    dimensions: JSON.stringify({ width: 24, height: 12, units: "ft" }),
    features: JSON.stringify(["digital", "high-traffic", "outdoor", "luxury-audience", "vehicle-visibility"]),
    coordinates: JSON.stringify({ lat: 33.6169, lng: -117.8742 }),
    city: "Newport Beach",
    state: "CA",
    country: "US",
    baseRate: 450,
    pricing: JSON.stringify({
      daily: 450,
      weekly: 2700,
      monthly: 10800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    propertyId: 'prop_1_fashion_island'
  },
  {
    id: 'area_2_fashion_kiosks',
    name: "Central Courtyard Kiosks",
    title: "Interactive Shopping Kiosks",
    description: "Multiple digital kiosks throughout the main shopping area. Perfect for interactive campaigns and wayfinding.",
    type: "mall_kiosk",
    dimensions: JSON.stringify({ width: 4, height: 7, units: "ft" }),
    features: JSON.stringify(["interactive", "touchscreen", "multiple-units", "indoor", "shopping-audience"]),
    coordinates: JSON.stringify({ lat: 33.6169, lng: -117.8742 }),
    city: "Newport Beach",
    state: "CA",
    country: "US",
    baseRate: 280,
    pricing: JSON.stringify({
      daily: 280,
      weekly: 1680,
      monthly: 6720
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    propertyId: 'prop_1_fashion_island'
  },
  {
    id: 'area_3_fashion_parking',
    name: "Parking Structure Wraps",
    title: "Multi-Level Parking Displays",
    description: "Building wraps on 4-level parking structure visible from Pacific Coast Highway and surrounding areas.",
    type: "building_wrap",
    dimensions: JSON.stringify({ width: 200, height: 40, units: "ft" }),
    features: JSON.stringify(["building-wrap", "highway-visible", "large-format", "outdoor", "brand-awareness"]),
    coordinates: JSON.stringify({ lat: 33.6169, lng: -117.8742 }),
    city: "Newport Beach",
    state: "CA",
    country: "US",
    baseRate: 650,
    pricing: JSON.stringify({
      daily: 650,
      weekly: 3900,
      monthly: 15600
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    propertyId: 'prop_1_fashion_island'
  },

  // Irvine Tech Campus (Property 2) - 3 areas
  {
    id: 'area_4_irvine_lobby',
    name: "Corporate Lobby Video Wall",
    title: "Executive Lobby Display Network",
    description: "Premium video wall in main corporate lobby. Reaches 15,000+ daily tech professionals and executives.",
    type: "lobby_display",
    dimensions: JSON.stringify({ width: 16, height: 9, units: "ft" }),
    features: JSON.stringify(["4K-video-wall", "executive-audience", "indoor", "tech-professionals", "B2B-focused"]),
    coordinates: JSON.stringify({ lat: 33.6846, lng: -117.8265 }),
    city: "Irvine",
    state: "CA",
    country: "US",
    baseRate: 380,
    pricing: JSON.stringify({
      daily: 380,
      weekly: 2280,
      monthly: 9120
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    propertyId: 'prop_2_irvine_tech'
  },
  {
    id: 'area_5_irvine_elevators',
    name: "Elevator Network Displays",
    title: "Multi-Floor Elevator Advertising",
    description: "Digital displays in 8 elevator banks across 20 floors. Captive audience of tech workers and visitors.",
    type: "elevator_display",
    dimensions: JSON.stringify({ width: 3, height: 4, units: "ft" }),
    features: JSON.stringify(["elevator-network", "captive-audience", "indoor", "multiple-floors", "tech-workers"]),
    coordinates: JSON.stringify({ lat: 33.6846, lng: -117.8265 }),
    city: "Irvine",
    state: "CA",
    country: "US",
    baseRate: 220,
    pricing: JSON.stringify({
      daily: 220,
      weekly: 1320,
      monthly: 5280
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    propertyId: 'prop_2_irvine_tech'
  },
  {
    id: 'area_6_irvine_parking',
    name: "Campus Parking Digital Totems",
    title: "Outdoor Digital Wayfinding",
    description: "Digital totem displays throughout corporate campus parking areas. High visibility for commuters.",
    type: "parking_totem",
    dimensions: JSON.stringify({ width: 4, height: 10, units: "ft" }),
    features: JSON.stringify(["outdoor-totems", "parking-areas", "commuter-focused", "wayfinding", "weather-resistant"]),
    coordinates: JSON.stringify({ lat: 33.6846, lng: -117.8265 }),
    city: "Irvine",
    state: "CA",
    country: "US",
    baseRate: 190,
    pricing: JSON.stringify({
      daily: 190,
      weekly: 1140,
      monthly: 4560
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_2_irvine_tech'
  },

  // Anaheim Convention Center (Property 3) - 3 areas
  {
    id: 'area_7_anaheim_marquee',
    name: "Convention Hall Digital Marquee",
    title: "Main Entrance Marquee Display",
    description: "Massive digital marquee visible from I-5 freeway and Katella Avenue. Reaches convention attendees and tourists.",
    type: "digital_marquee",
    dimensions: JSON.stringify({ width: 30, height: 15, units: "ft" }),
    features: JSON.stringify(["freeway-visible", "convention-traffic", "tourism", "large-format", "high-impact"]),
    coordinates: JSON.stringify({ lat: 33.8014, lng: -117.9187 }),
    city: "Anaheim",
    state: "CA",
    country: "US",
    baseRate: 550,
    pricing: JSON.stringify({
      daily: 550,
      weekly: 3300,
      monthly: 13200
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    propertyId: 'prop_3_anaheim_convention'
  },
  {
    id: 'area_8_anaheim_concourse',
    name: "Exhibition Hall Concourse",
    title: "Indoor Concourse Display Network",
    description: "Multiple displays throughout main exhibition concourse. High-dwell time audience during conventions and events.",
    type: "concourse_display",
    dimensions: JSON.stringify({ width: 8, height: 12, units: "ft" }),
    features: JSON.stringify(["indoor", "exhibition-traffic", "high-dwell", "convention-attendees", "multiple-displays"]),
    coordinates: JSON.stringify({ lat: 33.8014, lng: -117.9187 }),
    city: "Anaheim",
    state: "CA",
    country: "US",
    baseRate: 320,
    pricing: JSON.stringify({
      daily: 320,
      weekly: 1920,
      monthly: 7680
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800",
    propertyId: 'prop_3_anaheim_convention'
  },
  {
    id: 'area_9_anaheim_parking',
    name: "Parking Structure Displays",
    title: "Multi-Level Parking Advertising",
    description: "Digital displays throughout 3-level parking structure. Captures visitors coming and going from events.",
    type: "parking_structure",
    dimensions: JSON.stringify({ width: 6, height: 8, units: "ft" }),
    features: JSON.stringify(["parking-structure", "visitor-traffic", "indoor", "multiple-levels", "event-attendees"]),
    coordinates: JSON.stringify({ lat: 33.8014, lng: -117.9187 }),
    city: "Anaheim",
    state: "CA",
    country: "US",
    baseRate: 180,
    pricing: JSON.stringify({
      daily: 180,
      weekly: 1080,
      monthly: 4320
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_3_anaheim_convention'
  },

  // South Coast Plaza (Property 4) - 3 areas
  {
    id: 'area_10_scp_luxury_wall',
    name: "Luxury Wing Video Wall",
    title: "High-End Shopping Video Experience",
    description: "Premium video wall in luxury wing near designer boutiques. Ultra-affluent shoppers and international visitors.",
    type: "luxury_video_wall",
    dimensions: JSON.stringify({ width: 20, height: 11, units: "ft" }),
    features: JSON.stringify(["luxury-shopping", "ultra-affluent", "indoor", "designer-brands", "international-visitors"]),
    coordinates: JSON.stringify({ lat: 33.6895, lng: -117.8900 }),
    city: "Costa Mesa",
    state: "CA",
    country: "US",
    baseRate: 680,
    pricing: JSON.stringify({
      daily: 680,
      weekly: 4080,
      monthly: 16320
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    propertyId: 'prop_4_south_coast_plaza'
  },
  {
    id: 'area_11_scp_food_court',
    name: "Food Court Digital Menu Boards",
    title: "Premium Dining Digital Network",
    description: "Digital menu boards and advertising displays in upscale food court. High-income diners and shoppers.",
    type: "food_court_display",
    dimensions: JSON.stringify({ width: 5, height: 8, units: "ft" }),
    features: JSON.stringify(["food-court", "dining-audience", "indoor", "multiple-units", "high-income"]),
    coordinates: JSON.stringify({ lat: 33.6895, lng: -117.8900 }),
    city: "Costa Mesa",
    state: "CA",
    country: "US",
    baseRate: 350,
    pricing: JSON.stringify({
      daily: 350,
      weekly: 2100,
      monthly: 8400
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    propertyId: 'prop_4_south_coast_plaza'
  },
  {
    id: 'area_12_scp_valet',
    name: "Valet Parking Digital Pillars",
    title: "Valet Area Premium Displays",
    description: "Digital displays at valet parking areas. Captures luxury car owners and high-net-worth shoppers.",
    type: "valet_display",
    dimensions: JSON.stringify({ width: 3, height: 12, units: "ft" }),
    features: JSON.stringify(["valet-parking", "luxury-cars", "high-net-worth", "outdoor", "premium-shoppers"]),
    coordinates: JSON.stringify({ lat: 33.6895, lng: -117.8900 }),
    city: "Costa Mesa",
    state: "CA",
    country: "US",
    baseRate: 420,
    pricing: JSON.stringify({
      daily: 420,
      weekly: 2520,
      monthly: 10080
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    propertyId: 'prop_4_south_coast_plaza'
  },

  // Huntington Beach Pier (Property 5) - 2 areas
  {
    id: 'area_13_hb_pier_plaza',
    name: "Pier Plaza Digital Billboard",
    title: "Iconic Pier Plaza Display",
    description: "Large digital billboard overlooking the famous Huntington Pier. Millions of annual beach visitors and tourists.",
    type: "pier_billboard",
    dimensions: JSON.stringify({ width: 28, height: 14, units: "ft" }),
    features: JSON.stringify(["beach-tourism", "pier-view", "outdoor", "iconic-location", "lifestyle-audience"]),
    coordinates: JSON.stringify({ lat: 33.6553, lng: -118.0063 }),
    city: "Huntington Beach",
    state: "CA",
    country: "US",
    baseRate: 480,
    pricing: JSON.stringify({
      daily: 480,
      weekly: 2880,
      monthly: 11520
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    propertyId: 'prop_5_huntington_pier'
  },
  {
    id: 'area_14_hb_volleyball',
    name: "Beach Volleyball Courts",
    title: "Sports & Lifestyle Billboard",
    description: "Traditional billboard overlooking famous beach volleyball courts. Active lifestyle and sports enthusiasts.",
    type: "sports_billboard",
    dimensions: JSON.stringify({ width: 24, height: 12, units: "ft" }),
    features: JSON.stringify(["sports-venue", "beach-volleyball", "outdoor", "active-lifestyle", "tournaments"]),
    coordinates: JSON.stringify({ lat: 33.6553, lng: -118.0063 }),
    city: "Huntington Beach",
    state: "CA",
    country: "US",
    baseRate: 320,
    pricing: JSON.stringify({
      daily: 320,
      weekly: 1920,
      monthly: 7680
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    propertyId: 'prop_5_huntington_pier'
  },

  // Mission Viejo (Property 6) - 2 areas
  {
    id: 'area_15_mv_family_kiosks',
    name: "Family Shopping Center Kiosks",
    title: "Interactive Family Kiosks",
    description: "Touch-screen kiosks throughout family-oriented shopping center. Parents and children in affluent suburban area.",
    type: "family_kiosk",
    dimensions: JSON.stringify({ width: 4, height: 8, units: "ft" }),
    features: JSON.stringify(["family-audience", "interactive", "suburban", "affluent", "multiple-locations"]),
    coordinates: JSON.stringify({ lat: 33.5581, lng: -117.6536 }),
    city: "Mission Viejo",
    state: "CA",
    country: "US",
    baseRate: 200,
    pricing: JSON.stringify({
      daily: 200,
      weekly: 1200,
      monthly: 4800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    propertyId: 'prop_6_mission_viejo'
  },
  {
    id: 'area_16_mv_exterior',
    name: "Exterior Shopping Center Sign",
    title: "Main Street Visibility Display",
    description: "Large exterior sign visible from Marguerite Parkway. High traffic suburban commuter route.",
    type: "exterior_sign",
    dimensions: JSON.stringify({ width: 20, height: 10, units: "ft" }),
    features: JSON.stringify(["exterior", "commuter-traffic", "suburban", "family-oriented", "high-visibility"]),
    coordinates: JSON.stringify({ lat: 33.5581, lng: -117.6536 }),
    city: "Mission Viejo",
    state: "CA",
    country: "US",
    baseRate: 160,
    pricing: JSON.stringify({
      daily: 160,
      weekly: 960,
      monthly: 3840
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    propertyId: 'prop_6_mission_viejo'
  },

  // Fullerton Transit (Property 7) - 2 areas
  {
    id: 'area_17_fullerton_platform',
    name: "Train Platform Digital Boards",
    title: "Transit Platform Display Network",
    description: "Digital displays on train platforms reaching thousands of daily commuters. Perfect for commuter-focused advertising.",
    type: "platform_display",
    dimensions: JSON.stringify({ width: 6, height: 4, units: "ft" }),
    features: JSON.stringify(["transit-platform", "commuters", "daily-traffic", "multiple-displays", "captive-audience"]),
    coordinates: JSON.stringify({ lat: 33.8706, lng: -117.9251 }),
    city: "Fullerton",
    state: "CA",
    country: "US",
    baseRate: 150,
    pricing: JSON.stringify({
      daily: 150,
      weekly: 900,
      monthly: 3600
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_7_fullerton_transit'
  },
  {
    id: 'area_18_fullerton_bus',
    name: "Bus Terminal Digital Shelter",
    title: "Multi-Modal Transit Advertising",
    description: "Digital bus shelter displays serving multiple transit routes. Regional commuters and local residents.",
    type: "bus_shelter",
    dimensions: JSON.stringify({ width: 8, height: 5, units: "ft" }),
    features: JSON.stringify(["bus-terminal", "multi-modal", "regional-transit", "shelter-displays", "weather-protected"]),
    coordinates: JSON.stringify({ lat: 33.8706, lng: -117.9251 }),
    city: "Fullerton",
    state: "CA",
    country: "US",
    baseRate: 120,
    pricing: JSON.stringify({
      daily: 120,
      weekly: 720,
      monthly: 2880
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    propertyId: 'prop_7_fullerton_transit'
  },

  // Laguna Beach (Property 8) - 2 areas
  {
    id: 'area_19_laguna_storefront',
    name: "Gallery District Storefront",
    title: "Artisan Storefront Display",
    description: "Digital storefront window display in heart of art gallery district. Art collectors and cultural tourists.",
    type: "gallery_storefront",
    dimensions: JSON.stringify({ width: 10, height: 6, units: "ft" }),
    features: JSON.stringify(["art-district", "storefront", "cultural-tourism", "art-collectors", "boutique-shopping"]),
    coordinates: JSON.stringify({ lat: 33.5427, lng: -117.7854 }),
    city: "Laguna Beach",
    state: "CA",
    country: "US",
    baseRate: 290,
    pricing: JSON.stringify({
      daily: 290,
      weekly: 1740,
      monthly: 6960
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    propertyId: 'prop_8_laguna_beach'
  },
  {
    id: 'area_20_laguna_highway',
    name: "Coastal Highway Billboard",
    title: "Pacific Coast Highway Display",
    description: "Billboard visible from scenic Pacific Coast Highway. Coastal tourists and weekend visitors.",
    type: "coastal_billboard",
    dimensions: JSON.stringify({ width: 18, height: 10, units: "ft" }),
    features: JSON.stringify(["coastal-highway", "scenic-route", "weekend-tourism", "outdoor", "ocean-views"]),
    coordinates: JSON.stringify({ lat: 33.5427, lng: -117.7854 }),
    city: "Laguna Beach",
    state: "CA",
    country: "US",
    baseRate: 380,
    pricing: JSON.stringify({
      daily: 380,
      weekly: 2280,
      monthly: 9120
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    propertyId: 'prop_8_laguna_beach'
  }
];

async function seedOrangeCountyDatabase() {
  try {
    console.log('🌱 Starting Orange County database seeding...');
    console.log('📍 Creating 15 properties with 20 realistic advertising areas');
    console.log('');

    // Create a test user for Orange County
    let testUser;
    try {
      testUser = await prisma.users.findFirst({
        where: { email: { contains: 'oc-test' } }
      });
      
      if (!testUser) {
        console.log('👤 Creating Orange County test user...');
        testUser = await prisma.users.create({
          data: {
            id: 'oc_test_user_123',
            clerkId: 'oc_test_user_123',
            email: 'oc-test@example.com',
            firstName: 'OC',
            lastName: 'Property Owner',
            full_name: 'OC Property Owner',
            role: 'PROPERTY_OWNER',
            updatedAt: new Date()
          }
        });
        console.log('✅ Test user created');
      } else {
        console.log('✅ Using existing test user');
      }
    } catch (error) {
      console.log('⚠️ Could not create test user:', error.message);
      console.log('Continuing with existing users...');
    }

    // Create Orange County properties
    console.log('');
    console.log('🏢 Creating Orange County properties...');
    const createdProperties = [];
    
    for (const propertyData of orangeCountyProperties) {
      try {
        const property = await prisma.properties.create({
          data: {
            ...propertyData,
            ownerId: testUser?.id || 'oc_test_user_123',
            updatedAt: new Date()
          }
        });
        createdProperties.push(property);
        console.log(`✅ Created: ${property.title} in ${property.city}`);
      } catch (error) {
        console.log(`❌ Failed to create property: ${propertyData.title}`, error.message);
      }
    }

    // Create advertising areas
    console.log('');
    console.log('📺 Creating advertising areas...');
    
    for (const areaData of orangeCountyAdvertisingAreas) {
      try {
        const area = await prisma.advertising_areas.create({
          data: {
            ...areaData,
            updatedAt: new Date()
          }
        });
        console.log(`  📍 Created: ${area.name} (${area.type})`);
      } catch (error) {
        console.log(`  ❌ Failed to create area: ${areaData.name}`, error.message);
      }
    }

    console.log('');
    console.log('🎉 Orange County database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   🏢 Properties: ${createdProperties.length} created`);
    console.log(`   📺 Advertising Areas: ${orangeCountyAdvertisingAreas.length} total`);
    console.log(`   🎯 Space Types: 20 different types including digital displays, billboards, kiosks, etc.`);
    console.log('');
    console.log('🗺️ Coverage Areas:');
    console.log('   • Newport Beach (Fashion Island) - 3 areas');
    console.log('   • Irvine (Tech Campus) - 3 areas');
    console.log('   • Anaheim (Convention Center) - 3 areas');
    console.log('   • Costa Mesa (South Coast Plaza) - 3 areas');
    console.log('   • Huntington Beach (Pier District) - 2 areas');
    console.log('   • Mission Viejo (Town Center) - 2 areas');
    console.log('   • Fullerton (Transit Hub) - 2 areas');
    console.log('   • Laguna Beach (Art District) - 2 areas');
    console.log('   • Plus 7 more Orange County locations');
    console.log('');
    console.log('🚀 Your map should now display all Orange County properties!');
    console.log('💡 Refresh your map page to see the new data.');

  } catch (error) {
    console.error('❌ Error seeding Orange County database:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedOrangeCountyDatabase();