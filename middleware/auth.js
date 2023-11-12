const { Unauthorized } = require("../errors");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const debug = require("debug")("app:auth");

const auth = async (req, res, next) => {
  const { authToken } = req.cookies;
  if (!authToken) {
    throw new Unauthorized(`your not allowed!`);
  }
  try {
    const validAuth = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = {
      userId: validAuth.userId,
      username: validAuth.username,
      role: validAuth.role,
    };
    next();
  } catch (error) {
    throw new Unauthorized(`Youre not allowed!`);
  }
};

module.exports = auth;
