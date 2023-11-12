const express = require("express");
const router = express.Router();
const { generateTokenAndSetCookie } = require("../middleware/cookies");

const {
  getUser,
  createUser,
  login,
  logout,
  getAllUsers,
  getMyInfo,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const auth = require("../middleware/auth");

router
  .route("/")
  .get(auth, getAllUsers)
  .post(createUser, generateTokenAndSetCookie);
router.route("/myinfo").get(auth, getMyInfo);
router.route("/login").post(login, generateTokenAndSetCookie);
router.route("/logout").get(auth, logout);
router
  .route("/:id")
  .get(auth, getUser)
  .patch(auth, updateUser, generateTokenAndSetCookie)
  .delete(auth, deleteUser);

module.exports = router;
