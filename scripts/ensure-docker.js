#!/usr/bin/env node

/**
 * Ensures Docker is running before starting the development server.
 * This script checks if Docker daemon is accessible and provides
 * a helpful error message if it's not running.
 */

const { execSync } = require('child_process');

try {
  // Check if Docker daemon is running
  execSync('docker info', { stdio: 'ignore' });

  // Docker is running, exit successfully
  process.exit(0);
} catch (error) {
  // Docker is not running, show helpful error message
  console.error('\n❌ Docker is not running!\n');
  console.error('The Loan Management Platform requires Docker for local development.');
  console.error('\nPlease:');
  console.error('  1. Start Docker Desktop');
  console.error('  2. Wait for Docker to be fully running');
  console.error('  3. Run npm run dev again\n');
  console.error('If you don\'t have Docker installed:');
  console.error('  - Download from: https://www.docker.com/products/docker-desktop\n');

  process.exit(1);
}
