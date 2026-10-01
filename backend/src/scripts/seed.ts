import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { User } from "../modules/auth/models/User";
import { Profile } from "../modules/profile/models/Profile";
import { Preference } from "../modules/profile/models/Preference";

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nira";

const NUM_USERS = 20; // 10 males, 10 females

const indianNames = {
  male: ["Rahul", "Mohammed", "Arjun", "Aditya", "Vishnu", "Ajay", "Pranav", "Zain", "Omar", "Kiran"],
  female: ["Aiswarya", "Fatima", "Neha", "Meenakshi", "Priya", "Sara", "Anjali", "Kavya", "Zoya", "Amira"]
};

const religions = ["Hindu", "Islam", "Christian"];
const professions = ["Software Engineer", "Doctor", "Business", "Architect", "Teacher", "Nurse", "Manager", "Designer", "Accountant"];
const educations = ["Bachelors", "Masters", "Doctorate", "Diploma"];
const bloodGroups = ["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"];
const motherTongues = ["Malayalam", "English", "Hindi", "Tamil"];

// Realistic unsplash portraits
const malePhotos = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1507081323647-4d250478b919?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=600&h=800"
];

const femalePhotos = [
  "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1555529733-0e670560f0e1?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600&h=800",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=600&h=800"
];

let malePhotoIndex = 0;
let femalePhotoIndex = 0;

const getPhoto = (gender: "male" | "female"): string => {
  if (gender === "male") {
    const photo = malePhotos[malePhotoIndex % malePhotos.length];
    malePhotoIndex++;
    return photo as string;
  }
  const photo = femalePhotos[femalePhotoIndex % femalePhotos.length];
  femalePhotoIndex++;
  return photo as string;
};

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Clearing old fake users...");
    // Only delete users with @fake.com to avoid deleting the actual tester's account
    const fakeUsers = await User.find({ email: { $regex: "@fake.com$" } });
    const fakeUserIds = fakeUsers.map(u => u._id);
    
    await User.deleteMany({ _id: { $in: fakeUserIds } });
    await Profile.deleteMany({ userId: { $in: fakeUserIds } });
    await Preference.deleteMany({ userId: { $in: fakeUserIds } });
    console.log(`Cleared ${fakeUserIds.length} old fake users.`);

    console.log(`Generating ${NUM_USERS} new fake users...`);
    const defaultPassword = await bcrypt.hash("password123", 10);

    for (let i = 0; i < NUM_USERS; i++) {
      const gender = i % 2 === 0 ? "male" : "female";
      const firstName = faker.helpers.arrayElement(indianNames[gender]);
      const lastName = faker.person.lastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@fake.com`;
      const religion = faker.helpers.arrayElement(religions);
      
      // 1. Create User
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        gender,
        createdFor: "self",
        isOnboardingComplete: true
      });

      // Generate random DOB for age between 21 and 35
      const dob = faker.date.birthdate({ min: 21, max: 35, mode: 'age' });
      const height = faker.number.int({ min: 150, max: 190 }).toString();

      // 2. Create Profile
      await Profile.create({
        userId: user._id,
        dob,
        height,
        weight: faker.number.int({ min: 50, max: 90 }).toString(),
        bloodGroup: faker.helpers.arrayElement(bloodGroups),
        maritalStatus: "Never Married",
        haveChildren: "No",
        numberOfChildren: "0",
        nationality: "India",
        grewUpIn: "India",
        city: faker.helpers.arrayElement(["Kochi", "Trivandrum", "Calicut", "Bangalore", "Chennai", "Dubai", "Mumbai"]),
        state: "Kerala", // keeping state simple or can leave it
        country: "India",
        religion,
        caste: "Not Specified",
        ethnicity: "Indian",
        motherTongue: faker.helpers.arrayElement(motherTongues),
        educationLevel: faker.helpers.arrayElement(educations),
        profession: faker.helpers.arrayElement(professions),
        annualIncome: faker.number.int({ min: 500000, max: 3000000 }).toString(),
        diet: faker.helpers.arrayElement(["Vegetarian", "Non-Vegetarian", "Eggetarian"]),
        dressingSense: faker.helpers.arrayElement(["Traditional", "Western", "Casual"]),
        smoke: "No",
        drink: "No",
        personality: faker.helpers.arrayElements(["Introvert", "Extrovert", "Ambivert", "Creative", "Logical"], 2),
        interests: faker.helpers.arrayElements(["Reading", "Travel", "Music", "Sports", "Movies", "Cooking"], 3),
        bio: faker.lorem.paragraph(),
        whatBringsYouHere: "Marriage",
        knowSomeoneFor: "1-2 Years",
        marryWithin: "1-2 Years",
        moveAbroad: faker.helpers.arrayElement(["Yes", "No", "Depends"]),
        mainPhoto: getPhoto(gender),
        galleryPhotos: [getPhoto(gender), getPhoto(gender)],
        photoPrivacy: "Public"
      });

      // 3. Create Preferences
      await Preference.create({
        userId: user._id,
        prefAgeMin: faker.number.int({ min: 21, max: 25 }),
        prefAgeMax: faker.number.int({ min: 26, max: 35 }),
        prefHeightMin: "150",
        prefHeightMax: "190",
        prefMaritalStatus: ["Never Married"],
        prefLocation: "Doesn't Matter",
        prefEducation: "Doesn't Matter",
        prefProfession: "Doesn't Matter",
        prefReligion: religion, // Prefers same religion
        prefSmoking: "No",
        prefDrinking: "No",
        prefDiet: "Doesn't Matter",
        prefValues: ["Honesty", "Family Oriented"]
      });
    }

    console.log("Database seeded successfully with fake users!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
