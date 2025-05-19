import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { UserModel } from "./models/user.model"; // Adjusted path
import { IUser } from "../../domain/entities/user.entity"; // Adjusted path

// This dotenv.config() is for running the seed script standalone.
// When imported by server.ts, server.ts's dotenv.config() should take precedence.
if (require.main === module) {
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}

// Standalone DB connection for the seed script if run directly
const connectDBForSeed = async () => {
  if (mongoose.connection.readyState === 0) { // 0 = disconnected
    try {
      const mongoURI = process.env.MONGODB_URI;
      if (!mongoURI) {
        console.error("Error: MONGODB_URI is not defined for seeding.");
        process.exit(1);
      }
      await mongoose.connect(mongoURI);
      console.log("MongoDB Connected for seeding...");
    } catch (err: any) {
      console.error("Seed DB Connection Error:", err.message);
      process.exit(1);
    }
  }
};

export const ensureSeedData = async () => {
  try {
    // Ensure DB is connected. If called from server.ts, mongoose should already be connected.
    // If run as standalone, this will connect.
    if (mongoose.connection.readyState === 0) {
      await connectDBForSeed();
    }

    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log("Users collection is not empty. Skipping seed.");
      return;
    }

    // ../../../users.json relative to backend/src/infrastructure/database/seed.ts
    const usersFilePath = path.resolve(__dirname, "../../../users.json");
    if (!fs.existsSync(usersFilePath)) {
      console.error(`Error: users.json not found at ${usersFilePath}. Cannot seed data.`);
      return;
    }
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

    const usersToInsert: Partial<IUser>[] = usersData.map((user: any) => ({
      gender: user.gender,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password, // Passwords in JSON are pre-hashed
      phone: user.phone,
      birthdate: new Date(user.birthdate),
      city: user.city,
      country: user.country,
      photo: user.photo,
      category: user.category,
      isAdmin: user.isAdmin || false,
    }));

    if (usersToInsert.length > 0) {
      await UserModel.create(usersToInsert);
      console.log("Users seeded successfully!");
    } else {
      console.log("No users found in users.json to seed.");
    }

  } catch (error) {
    console.error("Error during data seeding:", error);
    // Do not exit process here, let the server handle its lifecycle
  }
  // Do not disconnect mongoose here; server manages connection lifecycle
};

// Allow running this script directly using `npm run seed` or `ts-node seed.ts`
if (require.main === module) {
  (async () => {
    await ensureSeedData();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected after standalone seed.");
    }
    process.exit();
  })();
}
