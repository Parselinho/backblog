const mongoose = require("mongoose");
const Joi = require("joi");
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    body: String,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const validatePostSchema = Joi.object({
  title: Joi.string().min(4).required(),
  body: Joi.string().min(10).required(),
});

const validatePost = (post) => {
  return validatePostSchema.validate(post);
};

const validatePostUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(4),
    body: Joi.string().min(10),
  })
    .min(1)
    .messages({
      "object.min": `title or body must be provided!`,
    });
  return schema.validate(data);
};

module.exports = {
  Post: mongoose.model("Post", PostSchema),
  validatePost,
  validatePostUpdate,
};
