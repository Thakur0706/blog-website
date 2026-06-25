 const express = require("express");
const { getPostComments, addComment, deleteComment } = require("../controllers/comment.controller");
const commentRouter = express.Router();

commentRouter.get('/:postId', getPostComments)
commentRouter.post('/:postId', addComment)
commentRouter.delete('/:id', deleteComment)

module.exports = {commentRouter}