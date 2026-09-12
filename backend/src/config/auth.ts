import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import dotenv from "dotenv";

dotenv.config();

// Create a native MongoDB client specifically for Better Auth
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
});
