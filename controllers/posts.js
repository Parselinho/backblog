const { BadRequest, NotFound, Forbidden } = require("../errors");
const { Post, validatePost, validatePostUpdate } = require("../models/Post");
const { User } = require("../models/User");
const debug = require("debug")("app:postController");

const createPost = async (req, res) => {
  const { error } = validatePost(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const { userId } = req.user;
  const newPost = await Post.create({ ...req.body, author: userId });

  await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

  const populatedPost = await Post.findById(newPost._id).select(
    "-author -_id -__v"
  );
  res.status(201).json({ populatedPost });
};

// get single post by user
const getSinglePost = async (req, res) => {
  const { id: paramId } = req.params;
  const singlePost = await Post.findOne({ _id: paramId }).populate([
    { path: "author", select: "username -_id" },
    {
      path: "comments",
      select: "title body createdAt _id",
      populate: { path: "author", select: "username -_id" },
    },
  ]);
  if (!singlePost) {
    throw new NotFound(`Post not exist`);
  }

  res.status(200).json({ singlePost });
};

// update single post by user
const updateSinglePostbById = async (req, res) => {
  const { error } = validatePostUpdate(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const { id: paramId } = req.params;

  const currentPost = await Post.findOne({ _id: paramId }).exec();
  if (!currentPost) {
    throw new NotFound(`there is not post with this id`);
  }
  if (
    currentPost.author.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbidden(`You are not allowed to update this post`);
  }

  const updateSinglePost = await Post.findOneAndUpdate(
    { _id: paramId },
    req.body,
    {
      new: true,
    }
  ).exec();
  res.status(200).json({ updateSinglePost });
};

// delete single post by user
const deleteSinglePostbById = async (req, res) => {
  const { id: paramId } = req.params;
  const currentPost = await Post.findOne({ _id: paramId }).exec();

  if (!currentPost) {
    throw new NotFound(`there is not post with this id`);
  }
  if (
    currentPost.author.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbidden(`You are not allowed to delete this post`);
  }

  const deleteSinglePost = await Post.findOneAndDelete({ _id: paramId });

  await User.findByIdAndUpdate(currentPost.author, {
    $pull: { posts: paramId },
  });

  const posts = await Post.find({}).populate("author", "username -_id").exec();

  res.status(200).json({ msg: `Post Deleted` });
};

// see all post by user
// const getAllPostsByUserId = async (req, res) => {
//   const { id: userid } = req.params;
//   if (!userid) {
//     throw new NotFound(`no user found`);
//   }
//   const allPosts = await Post.find({ author: userid })
//     .select("-author -_id -updatedAt -__v")
//     .exec();
//   res.status(200).json({ allPosts });
// };

// see all posts
const getAllPosts = async (req, res) => {
  const posts = await Post.find({}).populate([
    { path: "author", select: "username -_id" },
    {
      path: "comments",
      select: "title body createdAt _id",
      populate: { path: "author", select: "username -_id" },
    },
  ]);
  res.status(200).json({ posts });
};

module.exports = {
  getSinglePost,
  createPost,
  updateSinglePostbById,
  deleteSinglePostbById,
  getAllPosts,
};
