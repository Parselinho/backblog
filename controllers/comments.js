const { BadRequest, NotFound, Forbidden } = require("../errors");
const {
  Comment,
  validateComment,
  ValidateUpdateComment,
} = require("../models/Comment");
const { Post } = require("../models/Post");
const { User } = require("../models/User");

const debug = require("debug")("app:commentController");

const postcomment = async (req, res) => {
  const { error } = validateComment(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const { id: postId } = req.params;
  const findPost = await Post.findById(postId);
  if (!findPost) {
    throw new NotFound(`Post Not Found`);
  }

  const { userId } = req.user;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new NotFound(`User Not Found`);
  }

  const createComment = await Comment.create({
    ...req.body,
    author: userId,
    post: postId,
  });

  await User.findByIdAndUpdate(userId, {
    $push: { comments: createComment._id },
  });
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: createComment._id },
  });

  res.status(201).json({ createComment });
};

const updateComment = async (req, res) => {
  const { error } = ValidateUpdateComment(req.body);
  if (error) throw new BadRequest(error.details[0].message);
  const { commentId } = req.params;
  const findComment = await Comment.findById(commentId);
  if (!findComment) {
    throw new NotFound(`Comment not found`);
  }
  if (
    findComment._id.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbiiden(`Youre Not Allowed`);
  }
  const updateComment = await Comment.findByIdAndUpdate(commentId, req.body, {
    new: true,
  }).select("title body _id");

  res.status(200).json({ msg: updateComment });
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const findComment = await Comment.findById(commentId);
  if (!findComment) {
    throw new NotFound(`Comment Not Found!`);
  }
  if (
    findComment._id.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbidden(`You Are Not Allowed!`);
  }
  await Comment.findByIdAndDelete(commentId);

  res.status(200).send("redirect to the post page maybe..");
};

module.exports = { postcomment, updateComment, deleteComment };
