#!/bin/sh
set -e

# Wait for the app to be ready
echo "Starting ETUK application..."

# Initialize database if needed
if [ -n "$DATABASE_URL" ]; then
  echo "Checking database..."
  cd /app
  # Extract file path from DATABASE_URL if it's a file URL
  DB_PATH=$(echo "$DATABASE_URL" | sed 's/file://')
  DB_DIR=$(dirname "$DB_PATH")
  
  if [ -n "$DB_DIR" ] && [ "$DB_DIR" != "." ]; then
    echo "Ensuring directory $DB_DIR exists..."
    mkdir -p "$DB_DIR"
  fi
  
  # Push schema to database
  echo "Pushing schema to database @6.11.1..."
  npx prisma@6.11.1 db push --accept-data-loss

  # Run seeding to ensure admin account exists
  echo "Running database seed..."
  npx prisma@6.11.1 db seed
fi

# Start the application - executes CMD from Dockerfile
exec "$@"
