const mongoose = require("mongoose");
const Joi = require("joi");
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const validateComment = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(4).required(),
    body: Joi.string().min(10).required(),
  });
  return schema.validate(data);
};

const ValidateUpdateComment = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(4),
    body: Joi.string().min(10),
  })
    .min(1)
    .messages({ "object.min": `title or body must be provided!` });
  return schema.validate(data);
};

module.exports = {
  Comment: mongoose.model("Comment", CommentSchema),
  validateComment,
  ValidateUpdateComment,
};
