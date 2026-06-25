const { userModel } = require("../models/userModel");
const { clerkClient } = require("@clerk/express");

const getUserSavedPosts = async (req,res) => {
    const clerkUserId = req.auth().userId;

    if(!clerkUserId){
        return res.status(401).json({message:"Not Authenticated"})
    }
    
    let user = await userModel.findOne({
        clerkId: clerkUserId
    })

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

    res.status(200).json(user.savedPosts)
}

const savePost = async (req,res) => {
    const clerkUserId = req.auth().userId;
    const {postId} = req.body

    if(!clerkUserId){
        return res.status(401).json({message:"Not Authenticated"})
    }
    
    let user = await userModel.findOne({
        clerkId: clerkUserId
    })

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

    const isSaved = user.savedPosts.some(id => id === postId)

    if(!isSaved){
        await userModel.findByIdAndUpdate(user._id,{
            $push:{savedPosts:postId}
        })
    }else{
        await userModel.findByIdAndUpdate(user._id,{
            $pull:{savedPosts:postId}
        })
    }

    res.status(200).json(isSaved ? "Post unsaved" : "Post saved")


}

module.exports = {
    getUserSavedPosts,
    savePost
}
