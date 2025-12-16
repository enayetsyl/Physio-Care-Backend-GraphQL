// Jest Configuration File - With Detailed Comments
// This file tells Jest how to run your tests

module.exports = {
  // ============================================
  // BASIC SETUP
  // ============================================

  // Use ts-jest to handle TypeScript files
  // Without this, Jest can't understand .ts files
  preset: "ts-jest",

  // Run tests in Node.js environment (not browser)
  // Your backend code runs on Node.js, so tests should too
  testEnvironment: "node",

  // ============================================
  // WHERE TO FIND FILES
  // ============================================

  // Tell Jest where your code and tests are located
  // <rootDir> = the folder where this config file is
  roots: [
    "<rootDir>/src", // Your source code (the actual app)
    "<rootDir>/tests", // Your test files
  ],

  // Tell Jest which files are test files
  // These patterns match files that should be run as tests:
  testMatch: [
    "**/__tests__/**/*.ts", // Files in __tests__ folders
    "**/?(*.)+(spec|test).ts", // Files ending in .spec.ts or .test.ts
  ],

  // ============================================
  // HOW TO PROCESS FILES
  // ============================================

  // Convert TypeScript to JavaScript before running tests
  // "^.+\\.ts$" means "any file ending in .ts"
  transform: {
    "^.+\\.ts$": "ts-jest", // Use ts-jest to transform .ts files
  },

  // ============================================
  // TEST COVERAGE
  // ============================================

  // Which files to include when calculating test coverage
  // Coverage = how much of your code is tested
  collectCoverageFrom: [
    "src/**/*.ts", // Include all .ts files in src/
    "!src/**/*.d.ts", // EXCLUDE type definition files
    "!src/index.ts", // EXCLUDE main entry point
    "!src/config/**", // EXCLUDE config folder
  ],
  // The ! means "exclude" or "don't include"

  // ============================================
  // IMPORT ALIASES (OPTIONAL)
  // ============================================

  // Create shortcuts for imports
  // Lets you write: import { User } from "@/models/User"
  // Instead of: import { User } from "../../models/User"
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // @/ becomes src/
  },

  // ============================================
  // SETUP & TIMEOUTS
  // ============================================

  // Run this file before every test
  // Useful for setting up environment variables, etc.
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Maximum time a test can run (10 seconds)
  // If a test takes longer, Jest will stop it and mark as failed
  testTimeout: 10000,
};

// ============================================
// QUICK REFERENCE
// ============================================
//
// What this config does:
// 1. Finds all .test.ts files in tests/ folder
// 2. Converts TypeScript to JavaScript
// 3. Runs tests in Node.js environment
// 4. Measures how much code is tested
// 5. Sets up test environment before running
//
// To run tests: npm test
// To watch tests: npm run test:watch
// To see coverage: npm run test:coverage
//
