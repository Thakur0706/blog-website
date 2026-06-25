const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const { userRouter } = require("./routes/user.route");
const { postRouter } = require("./routes/post.route");
const { commentRouter } = require("./routes/comment.route");
const { connectDb } = require("./lib/connectDb");
const e = require("express");
const { webhookRouter } = require("./routes/webhook.route");
const cors = require("cors");
const {clerkMiddleware, clerkClient ,requireAuth, getAuth} = require("@clerk/express")

dotenv.config();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(clerkMiddleware())
app.use('/webhooks',webhookRouter)
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// app.get('/auth-state',(req,res)=>{
//     const authState = req.auth() 
//     res.json(authState)
// })

// app.get('/protected',requireAuth(),async (req,res)=>{
//     const {userId} = getAuth(req)
//     const user = await clerkClient.users.getUser(userId)

//     if(!userId){
//         return res.status(401).json({message:"Unauthorized"})
//     }   

//     res.status(200).json({message:"You are authorized",userId, user:user,"content":"content"} )
// })


app.use('/users',userRouter)
app.use('/posts',postRouter)
app.use('/comments',commentRouter )

app.use((error,req,res,next)=>{
    res.status(error.status || 500).json({
        message:error.message || "Something went wrong",
        // stack:error.stack 
    })
})

app.listen(port, () => {
    connectDb()
    console.log(`Example app listening on port ${port}`)
})