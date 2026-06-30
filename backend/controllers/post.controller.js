const ImageKit = require("imagekit");
const { postModel } = require("../models/postModel");
const { userModel } = require("../models/userModel");
const { clerkClient } = require("@clerk/express");
const { main } = require("../lib/gemini");

const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  // we are going to build a dynamic query object based on the query params, this will help us to filter the posts based on category, author, search etc. and prevent multiple if conditions
  const query = {};

  const cat = req.query.cat;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;

  if (cat) {
    query.category = cat;
  }

  if (searchQuery) {
    // case insensitive search, used regex for that
    query.title = { $regex: searchQuery, $options: "i" };
  }

  if (author) {
    // first we need to find the user with the username
    const user = await userModel.findOne({ username: author }).select("_id");
    if (!user) {
      // can return empty posts array if no user found
      return res.status(200).json("No post found");
    }

    query.user = user._id;
  }

  let sortObj = { createdAt: -1 }; // default sort by newest

  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };

        break;
      case "popular":
        sortObj = { visit: -1 };

        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        }; // last 7 days

        break;
    }
  }

  if (featured) {
    query.isFeatured = true;
  }

  const savedQuery = req.query.saved;
  if (savedQuery) {
    const clerkUserId = req.auth().userId;
    if (!clerkUserId) {
      return res.status(401).json("Not authenticated");
    }
    const user = await userModel.findOne({ clerkId: clerkUserId });
    if (user) {
      query._id = { $in: user.savedPosts };
    } else {
      query._id = { $in: [] };
    }
  }

  const posts = await postModel
    .find(query)
    .populate("user", "username img clerkId")
    .sort(sortObj)
    .where(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await postModel.countDocuments();

  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};

const getPost = async (req, res) => {
  const { slug } = req.params;
  const post = await postModel
    .findOne({ slug })
    .populate("user", "username img clerkId");
  res.status(200).json(post);
};

const createPost = async (req, res) => {
  const clerkUserId = req.auth().userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  let user = await userModel.findOne({
    clerkId: clerkUserId,
  });

  if (!user) {
    // Attempt to sync user from Clerk on the fly
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const username = clerkUser.username ||
                         (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null) ||
                         clerkUser.emailAddresses[0].emailAddress;
        user = new userModel({
          clerkId: clerkUserId,
          username: username,
          email: clerkUser.emailAddresses[0].emailAddress,
          img: clerkUser.imageUrl,
        });
      await user.save();
    } catch (syncError) {
      console.error("User sync failed:", syncError);
      return res.status(404).json({ message: "User not found" });
    }
  }

  if (!req.body.title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!req.body.img) {
    return res.status(400).json({ message: "Cover image is required" });
  }

  try {
    // My new Post => my-new-post (but it should be unique)
    // here we are checking for unique slug, if it already exists then we will add a number at the end of it like my-new-post-2, my-new-post-3 etc.
    let slug = req.body.title.replace(/ /g, "-").toLowerCase();

    let existingPost = await postModel.findOne({ slug });

    let counter = 2;

    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await postModel.findOne({ slug });
      counter++;
    }

    const newPost = new postModel({ user: user._id, slug, ...req.body });
    const post = await newPost.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};
const deletePost = async (req, res) => {
  const clerkUserId = req.auth().userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const sessionClaims = req.auth().sessionClaims;
  // Handle various casing/nesting scenarios from Clerk JWT templates
  const role =
    sessionClaims?.role ||
    sessionClaims?.metadata?.role ||
    sessionClaims?.metaData?.role ||
    sessionClaims?.metaData?.metadata?.role ||
    sessionClaims?.metadata?.metadata?.role ||
    "user";

  if (role === "admin") {
    await postModel.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post deleted successfully");
  }

  const user = await userModel.findOne({
    clerkId: clerkUserId,
  });

  const deletedPost = await postModel.findByIdAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedPost) {
    return res.status(404).json({
      message:
        "You are not authorized to delete this post, can only delete your own posts",
    });
  }

  res.status(200).json({
    message: "Post deleted successfully",
  });
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});
const uploadAuth = async (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    res
      .status(500)
      .json({ message: "Failed to authenticate upload", error: error.message });
  }
};

const featurePost = async (req, res) => {
  const clerkUserId = req.auth().userId;
  const { postId } = req.body;

  // Only admin can feature a post
  if (!clerkUserId) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  // Check if user is admin
  const sessionClaims = req.auth().sessionClaims;

  // Handle various casing/nesting scenarios from Clerk JWT templates
  const role =
    sessionClaims?.role ||
    sessionClaims?.metadata?.role ||
    sessionClaims?.metaData?.metadata?.role ||
    sessionClaims?.metadata?.metadata?.role ||
    "user";

  if (role !== "admin") {
    return res.status(403).json("Only admin can feature a post");
  }

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json("Post not found");
  }

  const isFeatured = post.isFeatured;

  const updatedPost = await postModel.findByIdAndUpdate(
    postId,
    { isFeatured: !isFeatured },
    { new: true },
  );

  res.status(200).json(updatedPost);
};

const generateContent = async (req, res) => {
  try {
    const clerkUserId = req.auth().userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    const { prompt } = req.body;
    const response = await main(
      prompt + "Generate a blog content for this topic in simple text format",
    );
    if (!response) {
      return res.status(400).json({ message: "Failed to generate content" });
    }
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ message: "Failed to generate content", error: error.message });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  deletePost,
  uploadAuth,
  featurePost,
  generateContent,
};
