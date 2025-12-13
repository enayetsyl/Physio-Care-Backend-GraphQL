/**
 * Seed script to create test data for Phase 7 testing
 * Run with: npx ts-node src/scripts/seed-test-data.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "../config";
import { connectDatabase } from "../config/database";
import { Center, Consultant } from "../models";

dotenv.config();

const seedData = async () => {
  try {
    await connectDatabase();
    console.log("✅ Connected to database");

    // Clear existing test data (optional - comment out if you want to keep existing data)
    // await Center.deleteMany({});
    // await Consultant.deleteMany({});
    // console.log("✅ Cleared existing test data");

    // Create Centers
    const center1 = await Center.create({
      name: "Mumbai Physiotherapy Center",
      address: "123 Marine Drive, Colaba",
      city: "Mumbai",
      isActive: true,
    });

    const center2 = await Center.create({
      name: "Delhi Rehabilitation Center",
      address: "456 Connaught Place",
      city: "Delhi",
      isActive: true,
    });

    const center3 = await Center.create({
      name: "Bangalore Sports Medicine",
      address: "789 MG Road",
      city: "Bangalore",
      isActive: true,
    });

    console.log("✅ Created centers:", {
      center1: center1._id.toString(),
      center2: center2._id.toString(),
      center3: center3._id.toString(),
    });

    // Create Consultants
    const consultant1 = await Consultant.create({
      name: "Dr. Rajesh Kumar",
      specialty: "Orthopedic",
      experience: "10 years",
      rating: 4.5,
      centerId: center1._id,
      isActive: true,
    });

    const consultant2 = await Consultant.create({
      name: "Dr. Priya Sharma",
      specialty: "Sports Medicine",
      experience: "8 years",
      rating: 4.8,
      centerId: center1._id,
      isActive: true,
    });

    const consultant3 = await Consultant.create({
      name: "Dr. Amit Patel",
      specialty: "Orthopedic",
      experience: "12 years",
      rating: 4.7,
      centerId: center2._id,
      isActive: true,
    });

    const consultant4 = await Consultant.create({
      name: "Dr. Sneha Reddy",
      specialty: "Neurological",
      experience: "7 years",
      rating: 4.6,
      centerId: center3._id,
      isActive: true,
    });

    console.log("✅ Created consultants:", {
      consultant1: consultant1._id.toString(),
      consultant2: consultant2._id.toString(),
      consultant3: consultant3._id.toString(),
      consultant4: consultant4._id.toString(),
    });

    console.log("\n📋 Test Data Summary:");
    console.log("===================");
    console.log("\nCenters:");
    console.log(`  - ${center1.name} (ID: ${center1._id})`);
    console.log(`  - ${center2.name} (ID: ${center2._id})`);
    console.log(`  - ${center3.name} (ID: ${center3._id})`);
    console.log("\nConsultants:");
    console.log(
      `  - ${consultant1.name} (ID: ${consultant1._id}) - ${consultant1.specialty} - Center: ${center1.name}`
    );
    console.log(
      `  - ${consultant2.name} (ID: ${consultant2._id}) - ${consultant2.specialty} - Center: ${center1.name}`
    );
    console.log(
      `  - ${consultant3.name} (ID: ${consultant3._id}) - ${consultant3.specialty} - Center: ${center2.name}`
    );
    console.log(
      `  - ${consultant4.name} (ID: ${consultant4._id}) - ${consultant4.specialty} - Center: ${center3.name}`
    );

    console.log("\n✅ Seed data created successfully!");
    console.log("\n💡 Use these IDs in your GraphQL queries for testing.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
