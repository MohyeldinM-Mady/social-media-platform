import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Post from "./src/models/Post.js";

// Load environment variables from server/.env
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB...");

    // Clear out existing data to avoid duplicates
    await User.deleteMany();
    await Post.deleteMany();
    console.log("🗑️  Cleared existing data...");

    // 1. Create Dummy Users
    // The pre('save') hook in your User model will automatically hash 'password123'
    const users = await User.create([
      {
        username: "tech_dev",
        email: "dev@example.com",
        password: "password123",
        bio: "Writing code, fixing bugs, and deploying apps.",
      },
      {
        username: "cat_lover",
        email: "cats@example.com",
        password: "password123",
        bio: "Proud owner of a Sphynx. Thinking about getting a Ragdoll next.",
      },
      {
        username: "music_fan",
        email: "music@example.com",
        password: "password123",
        bio: "Live music is the best music.",
      },
      {
        username: "sports_guy",
        email: "sports@example.com",
        password: "password123",
        bio: "Football, padel, and hitting the gym.",
      },
    ]);

    console.log("👤 Created dummy users...");

    // 2. Set up some Follower/Following relationships
    users[0].following.push(users[1]._id, users[2]._id, users[3]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);
    users[3].followers.push(users[0]._id);

    // Save the updated relationships
    await Promise.all(users.map((u) => u.save()));

    // 3. Create Dummy Posts
    await Post.create([
      {
        author: users[0]._id,
        content:
          "Just finished modeling a space station in Blender. Took way longer than expected to get the lighting right! 🚀",
        likes: [users[1]._id, users[2]._id],
        comments: [
          { user: users[3]._id, text: "Looks awesome! Drop some screenshots." },
        ],
      },
      {
        author: users[1]._id,
        content:
          "Does anyone have experience introducing a Ragdoll kitten to an adult Sphynx? Want to make sure they get along.",
        likes: [users[0]._id],
        comments: [],
      },
      {
        author: users[2]._id,
        content:
          "The energy at the Cairokee concert was absolutely insane last night. Best live performance I've seen all year. 🎸🔥",
        likes: [users[0]._id, users[3]._id],
        comments: [
          { user: users[0]._id, text: "Ah I wanted to go to that so badly!" },
          { user: users[1]._id, text: "They always put on a great show." },
        ],
      },
      {
        author: users[3]._id,
        content:
          "Great padel match today. My serve is finally getting some consistency. Time to rest before hitting the gym tomorrow.",
        likes: [users[0]._id, users[1]._id, users[2]._id],
        comments: [],
      },
    ]);

    console.log("📝 Created dummy posts...");
    console.log("✨ Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
