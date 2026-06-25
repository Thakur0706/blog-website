const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { userModel } = require("./models/userModel");
const { postModel } = require("./models/postModel");

dotenv.config();

const seedData = async () => {
  try {
    const url = process.env.MONGO_URL.endsWith('/') ? `${process.env.MONGO_URL}blog` : `${process.env.MONGO_URL}/blog`;
    await mongoose.connect(url);
    console.log("Connected to database for seeding...");

    // Clear existing data to avoid duplication errors on unique fields
    await userModel.deleteMany({});
    await postModel.deleteMany({});
    console.log("Cleared existing data.");

    // Create a dummy user
    const user = await userModel.create({
      clerkId: "user_dummy_12345",
      username: "john_doe",
      email: "john@example.com",
      img: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    });

    console.log("User created:", user.username);

    // Create some posts
    const posts = [
      {
        user: user._id,
        title: "Introduction to React",
        slug: "introduction-to-react",
        desc: "A beginner's guide to understanding React basics.",
        category: "web-design",
        content: "<p>React is a popular JavaScript library for building user interfaces. It uses a component-based architecture which makes it very efficient.</p>",
        img: "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg",
        isFeatured: true,
        visit: 150,
      },
      {
        user: user._id,
        title: "Mastering Node.js",
        slug: "mastering-node-js",
        desc: "Deep dive into backend development with Node.js.",
        category: "development",
        content: "<p>Node.js allows you to run JavaScript on the server. It is built on Chrome's V8 engine.</p>",
        img: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg",
        isFeatured: false,
        visit: 300,
      },
      {
        user: user._id,
        title: "The Future of AI",
        slug: "the-future-of-ai",
        desc: "How AI is changing the landscape of software engineering.",
        category: "databases",
        content: "<p>Artificial intelligence is becoming increasingly capable, changing how we write code and solve problems.</p>",
        img: "https://images.pexels.com/photos/17483874/pexels-photo-17483874.jpeg",
        isFeatured: true,
        visit: 500,
      },
       {
        user: user._id,
        title: "SEO Best Practices in 2024",
        slug: "seo-best-practices-2024",
        desc: "Rank higher on Google with these simple tips.",
        category: "search-engines",
        content: "<p>SEO is all about making your content understandable by search engines and valuable for users.</p>",
        img: "https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg",
        isFeatured: false,
        visit: 80,
      },
      {
        user: user._id,
        title: "Understanding Marketing Strategies",
        slug: "understanding-marketing-strategies",
        desc: "Boost your product visibility.",
        category: "marketing",
        content: "<p>A good marketing strategy involves understanding your target audience and delivering value.</p>",
        img: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        isFeatured: true,
        visit: 120,
      }
    ];

    await postModel.insertMany(posts);
    console.log(`Successfully seeded ${posts.length} posts.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
