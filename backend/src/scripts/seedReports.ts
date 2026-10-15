import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../modules/auth/models/User";
import { Interaction } from "../modules/feed/models/Interaction";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nira";

const seedReports = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const existingReportsCount = await Interaction.countDocuments({ action: "report" });
    if (existingReportsCount > 0) {
      console.log(`Found ${existingReportsCount} existing reports, skipping seed.`);
      process.exit(0);
    }

    const users = await User.find({ role: { $ne: "admin" } }).limit(6);
    if (users.length < 3) {
      console.log("Not enough users to create reports.");
      process.exit(0);
    }

    const sampleComplaints: Array<{
      actorId: any;
      targetId: any;
      action: "report";
      reason: string;
      status: "pending" | "warned" | "resolved" | "dismissed";
      adminNote?: string;
      resolvedAt?: Date;
    }> = [
      {
        actorId: users[0]!._id,
        targetId: users[1]!._id,
        action: "report",
        reason: "Suspicious profile: photos appear to be of an internet model. Profile details don't match.",
        status: "pending",
      },
      {
        actorId: users[2]!._id,
        targetId: users[3]?._id || users[1]!._id,
        action: "report",
        reason: "User requested immediate monetary transfer via UPI citing an urgent hospital emergency.",
        status: "pending",
      },
      {
        actorId: users[4]?._id || users[0]!._id,
        targetId: users[5]?._id || users[2]!._id,
        action: "report",
        reason: "Repeatedly posting direct contact number in about section and inappropriate messages.",
        status: "warned",
        adminNote: "Safety Notice: Sharing personal phone numbers in public bio violates profile standards.",
        resolvedAt: new Date(),
      },
    ];

    for (const report of sampleComplaints) {
      await Interaction.create(report);
    }

    console.log("Successfully seeded demo safety reports!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding reports:", error);
    process.exit(1);
  }
};

seedReports();
