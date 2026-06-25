const { postModel } = require("../models/postModel")
// Middleware to increase visit count of a post
// this middleware is intercepting the get post request and increasing the visit count by 1

const increaseVisit = async (req, res, next) => {
    const slug = req.params.slug;
    await postModel.findOneAndUpdate({ slug }, { $inc: { visit: 1 } });
    next();

}


module.exports = {
    increaseVisit
}   