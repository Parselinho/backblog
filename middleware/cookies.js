const { Unauthorized } = require("../errors");
const debug = require("debug")("app:cookiesMiddleWare");

const isProduction = process.env.NODE_ENV === "production";

// const cookiesOption = {
//   httpOnly: isProduction ? true : false,
//   secure: isProduction ? true : false,
//   expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
// };
debug(`Environment: ${process.env.NODE_ENV}, Secure: ${isProduction}`);

const cookiesOption = {
  httpOnly: false, // Recommended to prevent client-side script access to the cookie
  secure: true, // Should be true if SameSite=None, but only set on HTTPS
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Your desired expiry time
  sameSite: "none", // Explicitly set SameSite attribute
};

const generateTokenAndSetCookie = async (req, res, next) => {
  if (!req.user) {
    throw new Unauthorized(`User authentication required.`);
  }
  const token = req.user.createToken();
  res.cookie("authToken", token, cookiesOption);
  const { _id: userId, username, role } = req.user;
  req.userData = { userId, username, token };
  const statusCode = req.statusCode || 200;
  return res.status(statusCode).json({ userId, username, token, role });
};

module.exports = { generateTokenAndSetCookie };
