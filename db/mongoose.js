const mongoose = require("mongoose");
const debug = require("debug")("app:db");

// connectDB().catch((err) => console.log(err));

const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    debug("database connected");
  } catch (error) {
    debug("database connection failed");
  }
};

module.exports = connectDB;
