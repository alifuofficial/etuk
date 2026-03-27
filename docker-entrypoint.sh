#!/bin/sh
set -e

# Wait for the app to be ready
echo "Starting ETUK application..."

# Initialize database if needed
if [ -n "$DATABASE_URL" ]; then
  echo "Checking database..."
  cd /app
  # Create data directory if using SQLite
  mkdir -p /app/data
  # Push schema to database
  npx prisma db push --skip-generate 2>/dev/null || true
fi

# Start the application
exec node server.js
