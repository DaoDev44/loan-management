#!/usr/bin/env node
/**
 * Test database setup helper
 * Automates test database creation and migration
 */

const { execSync } = require('child_process')
const { config } = require('dotenv')
const { resolve } = require('path')
const fs = require('fs')

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  config({ path: envPath })
}

const DEV_PASSWORD = process.env.POSTGRES_PASSWORD || 'loanly_dev_password_change_in_production'

console.log('🧪 Setting up test database...')
console.log(`Using password: ${DEV_PASSWORD.substring(0, 10)}...`)
console.log()

try {
  // 1. Ensure Docker is running
  console.log('1. Checking Docker PostgreSQL...')
  execSync('npm run db:up', { stdio: 'inherit' })

  // 2. Create test database if it doesn't exist
  console.log('2. Creating test database (if needed)...')
  const createDbCommand = `docker exec loanly-postgres psql -U loanly -d loanly_db -c "CREATE DATABASE loanly_test_db;" || echo "Database already exists"`
  execSync(createDbCommand, { stdio: 'inherit' })

  // 3. Run migrations
  console.log('3. Running migrations on test database...')
  
  // Temporarily rename .env to avoid conflicts
  const fs = require('fs')
  const envExists = fs.existsSync('.env')
  if (envExists) {
    fs.renameSync('.env', '.env.temp')
  }
  
  try {
    // Use .env.test file for migrations
    const migrateCommand = `npx dotenv -e .env.test -- npx prisma migrate deploy`
    execSync(migrateCommand, { 
      stdio: 'inherit',
      shell: true
    })
  } finally {
    // Restore .env file
    if (envExists) {
      fs.renameSync('.env.temp', '.env')
    }
  }

  console.log('\n✅ Test database setup complete!')
  console.log('🏃 Run tests with: npm test')

} catch (error) {
  console.error('\n❌ Test database setup failed:', error.message)
  process.exit(1)
}