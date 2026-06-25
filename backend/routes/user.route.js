const express = require("express"); 
const { savePost, getUserSavedPosts } = require("../controllers/user.controllers");
const userRouter = express.Router();

userRouter.get('/saved',getUserSavedPosts)
userRouter.patch('/save',savePost)



module.exports = {userRouter};