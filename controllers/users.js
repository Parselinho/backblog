const { BadRequest, Unauthorized, NotFound, Forbidden } = require("../errors");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const {
  User,
  validateUser,
  validateLogin,
  validateUserUpdate,
} = require("../models/User");
const debug = require("debug")("app:controllerUser");

const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .select("-password -__v")
    .populate([
      { path: "posts", select: "title createdAt" },
      { path: "comments", select: "title post" },
    ]);
  if (!user) {
    throw new NotFound(`user not found`);
  }
  res.status(200).json({ user });
};

const getMyInfo = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .select("-password -__v")
    .populate([
      { path: "posts", select: "title createdAt -_id" },
      { path: "comments", select: "title post -_id" },
    ]);
  if (!user) {
    throw new NotFound(`Not Found`);
  }
  res.status(200).json({ user });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .populate([
      { path: "posts", select: "title createdAt -_id" },
      { path: "comments", select: "title post -_id" },
    ]);
  res.json({ users });
};

const login = async (req, res, next) => {
  const { error } = validateLogin(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthorized(`Invalid Credentials!`);
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Unauthorized(`Invalid Credentials!`);
  }
  req.user = user;
  next();
};

const logout = async (req, res, next) => {
  res.cookie("authToken", "", { expires: new Date(0), path: "/" });
  res.status(200).json({ msg: `Logged Out Successfully` });
};

const createUser = async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const user = await User.create({ ...req.body });
  if (!user) {
    throw new BadRequest("error creating user:", error);
  }
  req.statusCode = 201;
  req.user = user;
  next();
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { error } = validateUserUpdate(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  const findUser = await User.findById(id);
  if (!findUser) {
    throw new NotFound(`User Not Found`);
  }
  if (
    findUser._id.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbidden(`Not Allowed!`);
  }

  await User.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select("-password -posts -role -comments -__v -_id");

  const updatedUser = await User.findById(id).select(
    "-password -posts -role -comments -__v -_id"
  );
  const { username, email } = updatedUser;

  req.user.username = username;
  req.user.email = email;
  res.status(200).json({ user: updatedUser });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const findUser = await User.findById(id);
  if (!findUser) {
    throw new NotFound(`User Not Found`);
  }
  if (
    findUser._id.toString() !== req.user.userId &&
    req.user.role !== "admin"
  ) {
    throw new Forbidden(`Not Allowed!`);
  }
  if (findUser._id.toString() === req.user.userId) {
    res.cookie("authToken", "", { expires: new Date(0), path: "/" });
  }

  await Post.deleteMany({ author: id });
  await Comment.deleteMany({ author: id });
  await User.findByIdAndDelete(id);

  res.status(200).json({ msg: "user deleted successfully" });
};

module.exports = {
  getUser,
  createUser,
  login,
  logout,
  getAllUsers,
  getMyInfo,
  updateUser,
  deleteUser,
};
