#!/bin/sh
set -e

# Run Prisma migrations/push on startup
npx prisma db push --skip-generate 2>/dev/null || true

# Start the Next.js server
exec node server.js
