#!/usr/bin/env node

/**
 * This script detects the DATABASE_URL format and copies the appropriate
 * Prisma schema file (SQLite for local dev, PostgreSQL for production).
 * This allows a single codebase to work with both databases.
 */

const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || '';
const prismaDir = path.dirname(__filename);
const targetSchema = path.join(prismaDir, 'schema.prisma');

// Determine which schema to use based on DATABASE_URL format
let sourceSchema;

if (databaseUrl.startsWith('file:')) {
  // Local development with SQLite
  sourceSchema = path.join(prismaDir, 'schema.sqlite.prisma');
  console.log('✓ Using SQLite schema (file:// detected)');
} else if (databaseUrl.startsWith('postgres') || databaseUrl.startsWith('postgresql')) {
  // Production with PostgreSQL
  sourceSchema = path.join(prismaDir, 'schema.postgresql.prisma');
  console.log('✓ Using PostgreSQL schema');
} else if (databaseUrl === '') {
  // Default to SQLite if no DATABASE_URL is set
  sourceSchema = path.join(prismaDir, 'schema.sqlite.prisma');
  console.log('⚠ No DATABASE_URL set, using SQLite schema');
} else {
  console.error('✗ Unknown DATABASE_URL format:', databaseUrl);
  process.exit(1);
}

// Copy the selected schema to schema.prisma
try {
  const schemaContent = fs.readFileSync(sourceSchema, 'utf-8');
  fs.writeFileSync(targetSchema, schemaContent);
  console.log(`✓ Schema generated at ${targetSchema}`);
} catch (error) {
  console.error('✗ Failed to generate schema:', error.message);
  process.exit(1);
}
