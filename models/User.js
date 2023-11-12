const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const debug = require("debug")("app:UserModel");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

UserSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.createToken = function () {
  return jwt.sign(
    { userId: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};

UserSchema.methods.comparePassword = async function (givenPassword) {
  const isMatch = await bcrypt.compare(givenPassword, this.password);
  return isMatch;
};

const userValidationSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.valid(Joi.ref("password")).required().messages({
    "any.only": "password not match",
  }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateUser = (user) => {
  return userValidationSchema.validate(user);
};

const validateLogin = (loginCredintals) => {
  return userLoginSchema.validate(loginCredintals);
};

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50),
    email: Joi.string().email(),
  })
    .min(1)
    .message({ "object.min": `username or email must be provided!` });
  return schema.validate(data);
};

module.exports = {
  User: mongoose.model("User", UserSchema),
  validateUser,
  validateLogin,
  validateUserUpdate,
};
