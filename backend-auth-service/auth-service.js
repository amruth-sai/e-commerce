const config =
  process.env.NODE_ENV === "production"
    ? require("./config.prod")
    : require("./config.dev");

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const secretKey = config.SECRET_KEY;
const databaseUrl = config.DATABASE_URL;
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Middleware to check if the user is authenticated
function authenticateToken(req, res, next) {
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
}
// Endpoint for token validation
app.get("/validateToken", authenticateToken, (req, res) => {
  // Access user details from req.user
  res.json({ message: "Validation route content", user: req.user });
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username is taken" });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// User login and token generation
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username and validate password
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT and set it as an HTTP cookie
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.cookie("userId", user.username);

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout (clear the token cookie)
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
