#!/usr/bin/env node

// Build optimization script for Render.com deployment
// This script helps reduce memory usage during build

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized build process...');

// Set environment variables for memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512';
process.env.NODE_ENV = 'production';

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Install dependencies with memory optimization
  console.log('📦 Installing dependencies...');
  execSync('yarn install --frozen-lockfile', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
  });

  // Build with optimizations
  console.log('🔨 Building with optimizations...');
  execSync('yarn build:prod', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
  });

  console.log('✅ Build completed successfully!');
  
  // Show build stats
  if (fs.existsSync('dist')) {
    const stats = fs.statSync('dist');
    console.log(`📊 Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 