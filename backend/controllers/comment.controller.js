const { commentModel } = require("../models/commentModel");
const { userModel } = require("../models/userModel");
const { clerkClient } = require("@clerk/express");

async function getPostComments(req, res) {
  const comments = await commentModel
    .find({ post: req.params.postId })
    .populate("user", "username img clerkId")
    .sort({ createdAt: -1 });

  res.json(comments);
}

async function addComment(req, res) {
  const clerkUserId = req.auth().userId;
  const postId = req.params.postId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  let user = await userModel.findOne({
    clerkId: clerkUserId,
  });

  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      user = new userModel({
        clerkId: clerkUserId,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
        email: clerkUser.emailAddresses[0].emailAddress,
        img: clerkUser.imageUrl,
      });
      await user.save();
    } catch (error) {
      console.error("User sync failed:", error);
      return res.status(500).json({ message: "Failed to sync user", error: error.message });
    }
  }

  const newComment = new commentModel({
    ...req.body,
    user: user._id,
    post: postId,
  });

  const savedComment = await newComment.save();

  setTimeout(() => {
    res.status(201).json(savedComment);
  }, 3000);
}
async function deleteComment(req, res) {
  const clerkUserId = req.auth().userId;
  const id = req.params.id;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

//   const role = req.auth.sessionClaims?.metadata?.role || 'user'
const sessionClaims = req.auth().sessionClaims;
  const role =
    sessionClaims?.role ||
    sessionClaims?.metadata?.role ||
    sessionClaims?.metaData?.role ||
    sessionClaims?.metaData?.metadata?.role ||
    sessionClaims?.metadata?.metadata?.role ||
    "user";

  if (role == "admin") {
    await commentModel.findByIdAndDelete(req.params.id);
    return res.status(200).json("Comment deleted successfully");
  }

  const user = await userModel.findOne({
    clerkId: clerkUserId,
  });

  const deletedComment = await commentModel.findOneAndDelete({
    _id: id,
    user: user._id,
  });

  if (!deletedComment) {
    return res
      .status(404)
      .json("You are not authorized to delete this comment");
  }

  res.status(200).json({ message: "Comment deleted successfully" });
}

module.exports = {
  getPostComments,
  addComment,
  deleteComment,
};
