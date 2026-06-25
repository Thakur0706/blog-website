const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId:{ type: String, required: true, unique: true } ,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    img: { type: String },
    savedPosts: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);


module.exports = {userModel}