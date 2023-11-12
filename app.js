// process.env.DEBUG = "app*,nodemon*";
require("dotenv").config();
require("express-async-errors");

const debug = require("debug")("app");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

const logger = require("morgan");
const cookieParser = require("cookie-parser");

const usersRoute = require("./routes/users");
const postsRoute = require("./routes/posts");

const authMiddleWare = require("./middleware/auth");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const connectDB = require("./db/mongoose");

// app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(xss());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger("dev"));

app.use("/users", usersRoute);
app.use("/posts", authMiddleWare, postsRoute);

app.get("/", (req, res) => {
  res.json({ msg: `welcome` });
});

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_CONNECT);
    app.listen(PORT, () => debug(`server listening on port ${PORT}`));
  } catch (error) {
    debug(error);
  }
};

start();
