const mongoose = require("mongoose")

const connectDb = async ()=>{
    try {
        mongoose.connection.on("connected",()=>{
            console.log("Connected to MongoDB");
        })    
    
        const url = process.env.MONGO_URL.endsWith('/') ? `${process.env.MONGO_URL}blog` : `${process.env.MONGO_URL}/blog`;
        await mongoose.connect(url)
    } catch (error) {
        console.log(error);
    }
   
}

module.exports = {connectDb}