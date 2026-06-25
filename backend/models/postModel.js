 const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    img:{type:String},
    title:{type:String,required:true},
    slug:{type:String,required:true,unique:true},
    desc:{type:String},
    category:{type:String,default:"general"},
    content:{type:String,required:true},
    isFeatured:{type:Boolean,default:false},
    visit:{type:Number,default:0},
    
},{timestamps:true})

const postModel = mongoose.model("Post", postSchema);


module.exports = {postModel}