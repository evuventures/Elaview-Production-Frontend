# backend/verify-prisma.sh
# Run these commands to verify your Prisma schema is properly synced

echo "🔍 Checking Prisma schema status..."
echo ""

# 1. Check if schema is in sync with database
echo "📋 Checking schema sync status:"
npx prisma db status

echo ""
echo "📊 Current database schema:"
npx prisma db show

echo ""
echo "🔧 If schema is out of sync, run:"
echo "npx prisma db push"

echo ""
echo "📝 To see what changes would be made:"
echo "npx prisma db diff"