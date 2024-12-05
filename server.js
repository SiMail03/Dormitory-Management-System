const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const users = [{}];
let mealSignups = 0; // Variable to track meal signups

const JWT_SECRET = process.env.REACT_APP_JWT_SECRET;
// Helper function to hash passwords
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Registration route to add users
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  users.push({ email, password: hashedPassword });
  res.send("User registered successfully!");
});

// Create a dummy user for testing
const createTestUsers = async () => {
  const testUsers = [
    { email: "user1@test.com", password: "password1" },
    { email: "user2@test.com", password: "password2" },
    { email: "user3@test.com", password: "password3" },
  ];

  for (let user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    users.push({
      email: user.email,
      password: hashedPassword,
      mealSignedUp: false,
    });
  }

  console.log("Test users created:", testUsers);
};

createTestUsers();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("Token missing");
    return res.sendStatus(401); // If no token, unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.sendStatus(403); // If token is invalid, forbidden
    }
    req.user = user;
    next();
  });
};

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).send("Invalid email or password");
  }
});

// Meal signup route
app.post("/meal-signup", authenticateToken, (req, res) => {
  const user = users.find((u) => u.email === req.user.email);
  if (user && !user.mealSignedUp) {
    user.mealSignedUp = true;
    mealSignups += 1;
    res.send("Meal signup recorded");
  } else {
    res.status(400).send("User already signed up");
  }
});

// Meal cancel route
app.post("/meal-cancel", authenticateToken, (req, res) => {
  const user = users.find((u) => u.email === req.user.email);
  if (user && user.mealSignedUp) {
    user.mealSignedUp = false;
    mealSignups -= 1;
    res.send("Meal signup canceled");
  } else {
    res.status(400).send("User not signed up");
  }
});

// Fetch meal count route
app.get("/meal-count", authenticateToken, (req, res) => {
  res.json({ count: mealSignups });
});

// Fetch meal signup status route
app.get("/meal-status", authenticateToken, (req, res) => {
  const user = users.find((u) => u.email === req.user.email);
  if (user) {
    res.json({ mealSignedUp: user.mealSignedUp });
  } else {
    res.status(404).send("User not found");
  }
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.send("Welcome to the protected dashboard route!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
