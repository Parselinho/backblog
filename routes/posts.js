const express = require("express");
const router = express.Router();

const {
  getSinglePost,
  createPost,
  updateSinglePostbById,
  deleteSinglePostbById,
  getAllPosts,
} = require("../controllers/posts");
const {
  postcomment,
  updateComment,
  deleteComment,
} = require("../controllers/comments");

router.route("/").get(getAllPosts).post(createPost);
// router.route("/users/:id").get(getAllPostsByUserId); // didnt do FrontEnd
router
  .route("/:id")
  .get(getSinglePost)
  .patch(updateSinglePostbById)
  .delete(deleteSinglePostbById);
router.route("/:id/comments").post(postcomment);
router
  .route("/:id/comments/:commentId")
  .patch(updateComment)
  .delete(deleteComment);

module.exports = router;
