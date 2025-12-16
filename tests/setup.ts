import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set default test environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-jwt-testing";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
