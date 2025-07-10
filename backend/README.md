# Backend Environment Setup

## Overview
This document explains how to set up the backend environment for the Property Advertising Platform.

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Clerk account for authentication
- Stripe account for payments

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your values:
```bash
cp .env.example .env
```

### 3. Required Environment Variables

#### Database
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://postgres:password@localhost:5432/mydb`

#### Clerk Authentication
Get these from your [Clerk Dashboard](https://dashboard.clerk.com/):
- `CLERK_SECRET_KEY`: Your Clerk secret key (starts with `sk_test_` or `sk_live_`)
- `CLERK_WEBHOOK_SECRET`: Webhook secret for Clerk events (starts with `whsec_`)

#### Stripe Payments
Get these from your [Stripe Dashboard](https://dashboard.stripe.com/):
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_WEBHOOK_SECRET`: Webhook secret for Stripe events (starts with `whsec_`)

#### JWT Configuration
- `JWT_SECRET`: A strong random string (minimum 32 characters) for JWT token signing

#### Server Configuration
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (`development`, `production`, `test`)
- `FRONTEND_URL`: Frontend application URL for CORS (default: `http://localhost:5173`)

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Security Notes

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate secrets regularly
- Use environment variable management tools in production

### Database Security
- Use connection pooling
- Enable SSL for production databases
- Regularly backup your database
- Use database users with minimal required permissions

### API Security
- CORS is configured for frontend domain
- All sensitive routes require authentication
- Webhooks are verified using secrets
- File uploads are limited in size and type

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `DATABASE_URL` format
   - Ensure database server is running
   - Verify network connectivity to database

2. **Clerk Authentication Issues**
   - Verify `CLERK_SECRET_KEY` is correct
   - Check that your Clerk app is configured properly
   - Ensure webhook endpoints are set up in Clerk dashboard

3. **Stripe Payment Issues**
   - Verify `STRIPE_SECRET_KEY` is correct
   - Check webhook endpoint configuration in Stripe dashboard
   - Ensure test/live mode keys match your environment

4. **CORS Issues**
   - Check `FRONTEND_URL` matches your frontend domain
   - Ensure protocol (http/https) is correct
   - Verify port numbers match

### Logs
Check application logs for detailed error information:
```bash
# View server logs
npm run logs

# Check specific log files
tail -f logs/app.log
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev
   
   # Terminal 2: Start frontend
   cd .. && npm run dev
   ```

2. **Database Changes**
   ```bash
   # After modifying Prisma schema
   npx prisma db push
   npx prisma generate
   ```

3. **Testing**
   ```bash
   # Run tests
   npm test
   
   # Run with coverage
   npm run test:coverage
   ```

## Production Deployment

### Environment Variables
Set all environment variables in your production environment:
- Use production database URL
- Use production Clerk keys
- Use production Stripe keys
- Set `NODE_ENV=production`

### Security Checklist
- [ ] All secrets are properly configured
- [ ] Database is secured with SSL
- [ ] CORS is configured for production domain
- [ ] Webhooks are configured with production URLs
- [ ] File upload restrictions are in place
- [ ] Logging is configured for production

### Monitoring
- Set up application monitoring
- Configure error tracking
- Monitor database performance
- Set up health checks

## Support

For issues with:
- **Database**: Check PostgreSQL documentation
- **Authentication**: Check Clerk documentation
- **Payments**: Check Stripe documentation
- **Application**: Check application logs and contact development team
