#!/bin/bash
# Build script for Vercel deployment

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generated successfully"

echo "🏗️ Building Next.js application..."
npx next build

echo "✅ Build completed successfully"