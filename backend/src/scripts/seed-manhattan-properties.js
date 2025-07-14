// backend/src/scripts/seed-manhattan-properties.js
// Run this to add 15 Manhattan properties with realistic advertising areas
// Updated to match your exact Prisma schema

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const manhattanProperties = [
  {
    id: 'prop_nyc_1_times_square',
    title: "Times Square Digital Billboard Complex",
    name: "Times Square Spectacular",
    description: "Iconic digital billboard space in the heart of Times Square. 500,000+ daily pedestrians, tourists, and locals.",
    address: "1500 Broadway",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10036",
    latitude: 40.7589,
    longitude: -73.9851,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 8000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    basePrice: 15000,
    pricing: JSON.stringify({
      daily: 1500,
      weekly: 9000,
      monthly: 36000
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_2_financial_district',
    title: "Wall Street Financial Tower",
    name: "One Wall Street Plaza",
    description: "Premium office tower in Financial District. C-suite executives, investment bankers, and high-net-worth professionals.",
    address: "1 Wall St",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10005",
    latitude: 40.7074,
    longitude: -74.0113,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 320000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    basePrice: 8500,
    pricing: JSON.stringify({
      daily: 850,
      weekly: 5100,
      monthly: 20400
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_3_grand_central',
    title: "Grand Central Terminal",
    name: "Grand Central Transportation Hub",
    description: "Historic transportation hub with 750,000 daily commuters. Mix of tourists, business travelers, and local commuters.",
    address: "89 E 42nd St",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10017",
    latitude: 40.7527,
    longitude: -73.9772,
    propertyType: "OTHER",
    spaceType: "transit_station",
    size: 48000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    basePrice: 6200,
    pricing: JSON.stringify({
      daily: 620,
      weekly: 3720,
      monthly: 14880
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_4_fifth_avenue',
    title: "Fifth Avenue Luxury Mall",
    name: "Fifth Avenue Premium Shopping",
    description: "Luxury shopping destination on Fifth Avenue. High-end international shoppers and affluent tourists.",
    address: "725 5th Ave",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10022",
    latitude: 40.7648,
    longitude: -73.9754,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 150000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    basePrice: 12000,
    pricing: JSON.stringify({
      daily: 1200,
      weekly: 7200,
      monthly: 28800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_5_penn_station',
    title: "Penn Station Complex",
    name: "Pennsylvania Station",
    description: "Major transportation hub serving LIRR, NJ Transit, and Amtrak. 650,000 daily commuters and travelers.",
    address: "4 Pennsylvania Plaza",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10001",
    latitude: 40.7505,
    longitude: -73.9934,
    propertyType: "OTHER",
    spaceType: "transit_station",
    size: 55000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    basePrice: 5800,
    pricing: JSON.stringify({
      daily: 580,
      weekly: 3480,
      monthly: 13920
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_6_soho_district',
    title: "SoHo Art & Fashion District",
    name: "SoHo Creative Quarter",
    description: "Trendy neighborhood with galleries, boutiques, and cafes. Creative professionals, fashion enthusiasts, and tourists.",
    address: "420 Broadway",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10013",
    latitude: 40.7199,
    longitude: -74.0021,
    propertyType: "COMMERCIAL",
    spaceType: "retail",
    size: 25000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    basePrice: 4500,
    pricing: JSON.stringify({
      daily: 450,
      weekly: 2700,
      monthly: 10800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_7_central_park',
    title: "Central Park South Billboard",
    name: "Central Park Plaza Views",
    description: "Premium billboard overlooking Central Park. Tourists, joggers, and affluent Upper East Side residents.",
    address: "2 Central Park S",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10019",
    latitude: 40.7677,
    longitude: -73.9776,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 12000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 9500,
    pricing: JSON.stringify({
      daily: 950,
      weekly: 5700,
      monthly: 22800
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_8_chelsea_market',
    title: "Chelsea Market Food Hall",
    name: "Chelsea Market Gourmet District",
    description: "Popular food hall and shopping destination. Foodies, tourists, and local professionals seeking unique dining.",
    address: "75 9th Ave",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10011",
    latitude: 40.7420,
    longitude: -74.0052,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 65000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    basePrice: 3800,
    pricing: JSON.stringify({
      daily: 380,
      weekly: 2280,
      monthly: 9120
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_9_brooklyn_bridge',
    title: "Brooklyn Bridge Approach",
    name: "Brooklyn Bridge Plaza",
    description: "Tourist destination at Brooklyn Bridge approach. Massive tourist traffic and Instagram-worthy location.",
    address: "South St Seaport",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10038",
    latitude: 40.7053,
    longitude: -74.0029,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 15000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 7200,
    pricing: JSON.stringify({
      daily: 720,
      weekly: 4320,
      monthly: 17280
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_10_lincoln_center',
    title: "Lincoln Center Cultural Complex",
    name: "Lincoln Center for the Performing Arts",
    description: "Premier cultural destination with opera, ballet, and concerts. Cultured, affluent arts patrons and tourists.",
    address: "10 Lincoln Center Plaza",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10023",
    latitude: 40.7727,
    longitude: -73.9822,
    propertyType: "COMMERCIAL",
    spaceType: "event_venue",
    size: 95000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    basePrice: 6800,
    pricing: JSON.stringify({
      daily: 680,
      weekly: 4080,
      monthly: 16320
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_11_high_line',
    title: "High Line Park Entrance",
    name: "High Line Elevated Park",
    description: "Popular elevated park and tourist attraction. Design-conscious visitors and architecture enthusiasts.",
    address: "820 Washington St",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10014",
    latitude: 40.7480,
    longitude: -74.0048,
    propertyType: "OTHER",
    spaceType: "billboard",
    size: 8500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    basePrice: 4200,
    pricing: JSON.stringify({
      daily: 420,
      weekly: 2520,
      monthly: 10080
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_12_hudson_yards',
    title: "Hudson Yards Development",
    name: "Hudson Yards Shopping Center",
    description: "Ultra-modern development with luxury shopping and dining. Tech workers, tourists, and high-income residents.",
    address: "20 Hudson Yards",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10001",
    latitude: 40.7540,
    longitude: -74.0019,
    propertyType: "RETAIL",
    spaceType: "retail",
    size: 180000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    basePrice: 8800,
    pricing: JSON.stringify({
      daily: 880,
      weekly: 5280,
      monthly: 21120
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_13_tribeca_loft',
    title: "TriBeCa Creative Loft District",
    name: "TriBeCa Art & Media Hub",
    description: "Converted industrial buildings housing creative agencies and media companies. Creative professionals and celebrities.",
    address: "375 Greenwich St",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10013",
    latitude: 40.7195,
    longitude: -74.0102,
    propertyType: "OFFICE",
    spaceType: "building",
    size: 85000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    basePrice: 5500,
    pricing: JSON.stringify({
      daily: 550,
      weekly: 3300,
      monthly: 13200
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_14_madison_square',
    title: "Madison Square Garden Area",
    name: "MSG Entertainment District",
    description: "Entertainment district around Madison Square Garden. Sports fans, concert-goers, and event attendees.",
    address: "4 Pennsylvania Plaza",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10001",
    latitude: 40.7505,
    longitude: -73.9934,
    propertyType: "COMMERCIAL",
    spaceType: "event_venue",
    size: 75000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    basePrice: 7500,
    pricing: JSON.stringify({
      daily: 750,
      weekly: 4500,
      monthly: 18000
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  },
  {
    id: 'prop_nyc_15_east_village',
    title: "East Village Nightlife District",
    name: "St. Marks Entertainment Zone",
    description: "Vibrant nightlife and dining district. Young professionals, college students, and nightlife enthusiasts.",
    address: "8 St Marks Pl",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10003",
    latitude: 40.7281,
    longitude: -73.9891,
    propertyType: "COMMERCIAL",
    spaceType: "retail",
    size: 15000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
    ]),
    primary_image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    basePrice: 3200,
    pricing: JSON.stringify({
      daily: 320,
      weekly: 1920,
      monthly: 7680
    }),
    currency: "USD",
    status: "ACTIVE",
    isActive: true,
    isApproved: true
  }
];

const manhattanAdvertisingAreas = [
  // Times Square (Property 1) - 4 areas
  {
    id: 'area_nyc_1_times_mega',
    name: "Times Square Mega Billboard",
    title: "Iconic Times Square LED Spectacular",
    description: "Massive 3,000 sq ft digital billboard in the heart of Times Square. 500K+ daily impressions, global media coverage.",
    type: "mega_billboard",
    dimensions: JSON.stringify({ width: 60, height: 50, units: "ft" }),
    features: JSON.stringify(["mega-billboard", "times-square", "global-audience", "24/7-display", "tourist-magnet"]),
    coordinates: JSON.stringify({ lat: 40.7589, lng: -73.9851 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 2500,
    pricing: JSON.stringify({
      daily: 2500,
      weekly: 15000,
      monthly: 60000
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    propertyId: 'prop_nyc_1_times_square'
  },
  {
    id: 'area_nyc_2_times_wrap',
    name: "Building Wrap Advertisement",
    title: "Times Square Building Domination",
    description: "Full building wrap covering 4 sides of Times Square building. Maximum brand visibility and impact.",
    type: "building_wrap",
    dimensions: JSON.stringify({ width: 120, height: 200, units: "ft" }),
    features: JSON.stringify(["building-wrap", "four-sides", "massive-scale", "brand-domination", "iconic-location"]),
    coordinates: JSON.stringify({ lat: 40.7589, lng: -73.9851 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 3500,
    pricing: JSON.stringify({
      daily: 3500,
      weekly: 21000,
      monthly: 84000
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800",
    propertyId: 'prop_nyc_1_times_square'
  },
  {
    id: 'area_nyc_3_times_ribbon',
    name: "Curved Digital Ribbon Display",
    title: "Times Square Curved LED Experience",
    description: "State-of-the-art curved LED ribbon wrapping around building corner. Immersive 360-degree brand experience.",
    type: "curved_display",
    dimensions: JSON.stringify({ width: 80, height: 20, units: "ft" }),
    features: JSON.stringify(["curved-led", "360-degree", "corner-wrap", "immersive", "cutting-edge-tech"]),
    coordinates: JSON.stringify({ lat: 40.7589, lng: -73.9851 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1800,
    pricing: JSON.stringify({
      daily: 1800,
      weekly: 10800,
      monthly: 43200
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    propertyId: 'prop_nyc_1_times_square'
  },
  {
    id: 'area_nyc_4_times_subway',
    name: "Times Square Subway Digital",
    title: "Underground Transit Network",
    description: "Digital displays throughout Times Square subway complex. Captures commuters and tourists using multiple train lines.",
    type: "subway_display",
    dimensions: JSON.stringify({ width: 8, height: 5, units: "ft" }),
    features: JSON.stringify(["subway-network", "commuter-traffic", "multiple-lines", "underground", "captive-audience"]),
    coordinates: JSON.stringify({ lat: 40.7589, lng: -73.9851 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 950,
    pricing: JSON.stringify({
      daily: 950,
      weekly: 5700,
      monthly: 22800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_nyc_1_times_square'
  },

  // Financial District (Property 2) - 3 areas
  {
    id: 'area_nyc_5_wall_lobby',
    name: "Executive Tower Lobby",
    title: "Wall Street Premium Lobby Display",
    description: "Ultra-premium lobby video wall targeting C-suite executives and high-net-worth financial professionals.",
    type: "executive_lobby",
    dimensions: JSON.stringify({ width: 20, height: 12, units: "ft" }),
    features: JSON.stringify(["executive-lobby", "C-suite-audience", "financial-district", "luxury-brands", "B2B-premium"]),
    coordinates: JSON.stringify({ lat: 40.7074, lng: -74.0113 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1200,
    pricing: JSON.stringify({
      daily: 1200,
      weekly: 7200,
      monthly: 28800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    propertyId: 'prop_nyc_2_financial_district'
  },
  {
    id: 'area_nyc_6_wall_elevators',
    name: "Executive Elevator Network",
    title: "High-Rise Elevator Displays",
    description: "Premium elevator displays in 50-floor financial tower. Captive audience of investment bankers and executives.",
    type: "elevator_premium",
    dimensions: JSON.stringify({ width: 4, height: 6, units: "ft" }),
    features: JSON.stringify(["elevator-network", "50-floors", "investment-bankers", "captive-audience", "high-frequency"]),
    coordinates: JSON.stringify({ lat: 40.7074, lng: -74.0113 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 800,
    pricing: JSON.stringify({
      daily: 800,
      weekly: 4800,
      monthly: 19200
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    propertyId: 'prop_nyc_2_financial_district'
  },
  {
    id: 'area_nyc_7_wall_plaza',
    name: "Financial District Plaza",
    title: "Wall Street Outdoor Plaza Display",
    description: "Large outdoor display in busy financial district plaza. Lunch crowds, tourists, and financial workers.",
    type: "plaza_display",
    dimensions: JSON.stringify({ width: 25, height: 15, units: "ft" }),
    features: JSON.stringify(["outdoor-plaza", "lunch-crowds", "financial-workers", "tourist-traffic", "business-district"]),
    coordinates: JSON.stringify({ lat: 40.7074, lng: -74.0113 }),
    city: "New York",
    state: "NY",
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
    images: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    propertyId: 'prop_nyc_2_financial_district'
  },

  // Grand Central (Property 3) - 3 areas
  {
    id: 'area_nyc_8_grand_main',
    name: "Grand Central Main Concourse",
    title: "Iconic Main Concourse Display",
    description: "Premium digital display in the famous main concourse. 750K daily commuters from tri-state area.",
    type: "concourse_main",
    dimensions: JSON.stringify({ width: 30, height: 20, units: "ft" }),
    features: JSON.stringify(["main-concourse", "750k-daily", "tri-state-commuters", "iconic-venue", "high-dwell"]),
    coordinates: JSON.stringify({ lat: 40.7527, lng: -73.9772 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1400,
    pricing: JSON.stringify({
      daily: 1400,
      weekly: 8400,
      monthly: 33600
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_nyc_3_grand_central'
  },
  {
    id: 'area_nyc_9_grand_shops',
    name: "Grand Central Shopping Concourse",
    title: "Retail Concourse Digital Network",
    description: "Multiple displays throughout shopping and dining concourse. Commuters and tourists with shopping intent.",
    type: "shopping_concourse",
    dimensions: JSON.stringify({ width: 12, height: 8, units: "ft" }),
    features: JSON.stringify(["shopping-concourse", "dining-area", "retail-intent", "multiple-displays", "tourist-commuter-mix"]),
    coordinates: JSON.stringify({ lat: 40.7527, lng: -73.9772 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 750,
    pricing: JSON.stringify({
      daily: 750,
      weekly: 4500,
      monthly: 18000
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    propertyId: 'prop_nyc_3_grand_central'
  },
  {
    id: 'area_nyc_10_grand_platforms',
    name: "Platform Digital Network",
    title: "Train Platform Display System",
    description: "Digital displays on multiple train platforms. Captive audience waiting for trains with extended dwell time.",
    type: "platform_network",
    dimensions: JSON.stringify({ width: 8, height: 6, units: "ft" }),
    features: JSON.stringify(["train-platforms", "waiting-passengers", "extended-dwell", "multiple-platforms", "regional-commuters"]),
    coordinates: JSON.stringify({ lat: 40.7527, lng: -73.9772 }),
    city: "New York",
    state: "NY",
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
    images: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    propertyId: 'prop_nyc_3_grand_central'
  },

  // Fifth Avenue (Property 4) - 3 areas
  {
    id: 'area_nyc_11_fifth_window',
    name: "Fifth Avenue Window Display",
    title: "Luxury Storefront Digital Windows",
    description: "High-end digital window displays on prestigious Fifth Avenue. Ultra-affluent shoppers and international tourists.",
    type: "luxury_storefront",
    dimensions: JSON.stringify({ width: 15, height: 10, units: "ft" }),
    features: JSON.stringify(["fifth-avenue", "luxury-storefront", "ultra-affluent", "international-tourists", "window-shopping"]),
    coordinates: JSON.stringify({ lat: 40.7648, lng: -73.9754 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1600,
    pricing: JSON.stringify({
      daily: 1600,
      weekly: 9600,
      monthly: 38400
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    propertyId: 'prop_nyc_4_fifth_avenue'
  },
  {
    id: 'area_nyc_12_fifth_interior',
    name: "Luxury Mall Interior Network",
    title: "Premium Shopping Mall Displays",
    description: "Multiple digital displays throughout luxury shopping floors. High-spending customers and brand-conscious shoppers.",
    type: "luxury_mall",
    dimensions: JSON.stringify({ width: 10, height: 8, units: "ft" }),
    features: JSON.stringify(["luxury-mall", "multiple-floors", "high-spending", "brand-conscious", "premium-retail"]),
    coordinates: JSON.stringify({ lat: 40.7648, lng: -73.9754 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1200,
    pricing: JSON.stringify({
      daily: 1200,
      weekly: 7200,
      monthly: 28800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    propertyId: 'prop_nyc_4_fifth_avenue'
  },
  {
    id: 'area_nyc_13_fifth_sidewalk',
    name: "Fifth Avenue Sidewalk Totems",
    title: "Prestigious Sidewalk Digital Totems",
    description: "Digital totem displays along Fifth Avenue sidewalk. Constant flow of pedestrians and window shoppers.",
    type: "sidewalk_totem",
    dimensions: JSON.stringify({ width: 4, height: 12, units: "ft" }),
    features: JSON.stringify(["sidewalk-totems", "pedestrian-flow", "window-shoppers", "prestigious-location", "street-level"]),
    coordinates: JSON.stringify({ lat: 40.7648, lng: -73.9754 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 900,
    pricing: JSON.stringify({
      daily: 900,
      weekly: 5400,
      monthly: 21600
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    propertyId: 'prop_nyc_4_fifth_avenue'
  },

  // SoHo (Property 6) - 2 areas
  {
    id: 'area_nyc_14_soho_gallery',
    name: "SoHo Gallery District Display",
    title: "Artistic Neighborhood Storefront",
    description: "Digital displays in trendy SoHo gallery district. Creative professionals, artists, and fashion-forward tourists.",
    type: "gallery_district",
    dimensions: JSON.stringify({ width: 12, height: 8, units: "ft" }),
    features: JSON.stringify(["gallery-district", "creative-professionals", "fashion-forward", "artistic-audience", "trendy-neighborhood"]),
    coordinates: JSON.stringify({ lat: 40.7199, lng: -74.0021 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 580,
    pricing: JSON.stringify({
      daily: 580,
      weekly: 3480,
      monthly: 13920
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
    propertyId: 'prop_nyc_6_soho_district'
  },
  {
    id: 'area_nyc_15_soho_boutique',
    name: "SoHo Boutique Row",
    title: "Fashion Boutique Digital Network",
    description: "Multiple displays along famous SoHo boutique row. Fashion enthusiasts and style-conscious shoppers.",
    type: "boutique_row",
    dimensions: JSON.stringify({ width: 8, height: 6, units: "ft" }),
    features: JSON.stringify(["boutique-row", "fashion-enthusiasts", "style-conscious", "shopping-district", "weekend-traffic"]),
    coordinates: JSON.stringify({ lat: 40.7199, lng: -74.0021 }),
    city: "New York",
    state: "NY",
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
    images: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    propertyId: 'prop_nyc_6_soho_district'
  },

  // Hudson Yards (Property 12) - 3 areas
  {
    id: 'area_nyc_16_hudson_vessel',
    name: "Hudson Yards Vessel Plaza",
    title: "Vessel Landmark Digital Display",
    description: "Large display overlooking the famous Vessel sculpture. Tech workers, tourists, and luxury shoppers.",
    type: "landmark_display",
    dimensions: JSON.stringify({ width: 35, height: 20, units: "ft" }),
    features: JSON.stringify(["landmark-location", "vessel-sculpture", "tech-workers", "luxury-shopping", "modern-development"]),
    coordinates: JSON.stringify({ lat: 40.7540, lng: -74.0019 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1100,
    pricing: JSON.stringify({
      daily: 1100,
      weekly: 6600,
      monthly: 26400
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    propertyId: 'prop_nyc_12_hudson_yards'
  },
  {
    id: 'area_nyc_17_hudson_mall',
    name: "Hudson Yards Mall Interior",
    title: "Ultra-Modern Shopping Complex",
    description: "Digital displays throughout state-of-the-art shopping center. High-income residents and luxury brand shoppers.",
    type: "modern_mall",
    dimensions: JSON.stringify({ width: 16, height: 9, units: "ft" }),
    features: JSON.stringify(["ultra-modern", "luxury-brands", "high-income", "shopping-complex", "tech-integration"]),
    coordinates: JSON.stringify({ lat: 40.7540, lng: -74.0019 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 950,
    pricing: JSON.stringify({
      daily: 950,
      weekly: 5700,
      monthly: 22800
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800",
    propertyId: 'prop_nyc_12_hudson_yards'
  },
  {
    id: 'area_nyc_18_hudson_observation',
    name: "Edge Observation Deck",
    title: "Highest Outdoor Observation Display",
    description: "Digital display at Edge observation deck entrance. Tourists seeking unique NYC experiences and photo opportunities.",
    type: "observation_deck",
    dimensions: JSON.stringify({ width: 12, height: 8, units: "ft" }),
    features: JSON.stringify(["observation-deck", "tourist-attraction", "photo-opportunities", "unique-experience", "skyline-views"]),
    coordinates: JSON.stringify({ lat: 40.7540, lng: -74.0019 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 750,
    pricing: JSON.stringify({
      daily: 750,
      weekly: 4500,
      monthly: 18000
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    propertyId: 'prop_nyc_12_hudson_yards'
  },

  // Central Park South (Property 7) - 2 areas
  {
    id: 'area_nyc_19_central_billboard',
    name: "Central Park South Billboard",
    title: "Premium Park-View Billboard",
    description: "Classic billboard with Central Park views. Joggers, tourists, and affluent Upper East Side residents.",
    type: "park_billboard",
    dimensions: JSON.stringify({ width: 40, height: 20, units: "ft" }),
    features: JSON.stringify(["central-park-views", "affluent-residents", "joggers", "tourist-destination", "premium-location"]),
    coordinates: JSON.stringify({ lat: 40.7677, lng: -73.9776 }),
    city: "New York",
    state: "NY",
    country: "US",
    baseRate: 1300,
    pricing: JSON.stringify({
      daily: 1300,
      weekly: 7800,
      monthly: 31200
    }),
    rateType: "DAILY",
    currency: "USD",
    status: "active",
    isActive: true,
    images: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    propertyId: 'prop_nyc_7_central_park'
  },
  {
    id: 'area_nyc_20_central_horse',
    name: "Horse Carriage Pickup Area",
    title: "Tourist Carriage Ride Display",
    description: "Digital display at horse carriage pickup point. Romantic tourists and Central Park visitors.",
    type: "tourist_pickup",
    dimensions: JSON.stringify({ width: 8, height: 12, units: "ft" }),
    features: JSON.stringify(["horse-carriages", "romantic-tourists", "park-visitors", "photo-opportunities", "classic-nyc"]),
    coordinates: JSON.stringify({ lat: 40.7677, lng: -73.9776 }),
    city: "New York",
    state: "NY",
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
    images: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    propertyId: 'prop_nyc_7_central_park'
  }
];

async function seedManhattanDatabase() {
  try {
    console.log('🗽 Starting Manhattan database seeding...');
    console.log('🏙️ Creating 15 properties with 20 premium advertising areas');
    console.log('');

    // Create a test user for Manhattan
    let testUser;
    try {
      testUser = await prisma.users.findFirst({
        where: { email: { contains: 'nyc-test' } }
      });
      
      if (!testUser) {
        console.log('👤 Creating Manhattan test user...');
        testUser = await prisma.users.create({
          data: {
            id: 'nyc_test_user_123',
            clerkId: 'nyc_test_user_123',
            email: 'nyc-test@example.com',
            firstName: 'NYC',
            lastName: 'Property Owner',
            full_name: 'NYC Property Owner',
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

    // Create Manhattan properties
    console.log('');
    console.log('🏢 Creating Manhattan properties...');
    const createdProperties = [];
    
    for (const propertyData of manhattanProperties) {
      try {
        const property = await prisma.properties.create({
          data: {
            ...propertyData,
            ownerId: testUser?.id || 'nyc_test_user_123',
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
    
    for (const areaData of manhattanAdvertisingAreas) {
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
    console.log('🎉 Manhattan database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   🏢 Properties: ${createdProperties.length} created`);
    console.log(`   📺 Advertising Areas: ${manhattanAdvertisingAreas.length} total`);
    console.log(`   💰 Premium Pricing: $320-$3,500 daily rates`);
    console.log('');
    console.log('🗽 Iconic NYC Locations:');
    console.log('   • Times Square (4 premium billboard areas)');
    console.log('   • Wall Street Financial District (3 executive areas)');
    console.log('   • Grand Central Terminal (3 commuter areas)');
    console.log('   • Fifth Avenue Luxury Shopping (3 affluent areas)');
    console.log('   • SoHo Art & Fashion District (2 creative areas)');
    console.log('   • Hudson Yards Modern Complex (3 tech areas)');
    console.log('   • Central Park South (2 tourist areas)');
    console.log('   • Plus 8 more Manhattan hotspots');
    console.log('');
    console.log('🚀 Your map should now display all Manhattan properties!');
    console.log('💡 Refresh your map page to see the premium NYC locations.');

  } catch (error) {
    console.error('❌ Error seeding Manhattan database:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedManhattanDatabase();