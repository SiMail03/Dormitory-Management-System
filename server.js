require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const PORT = 5000;

const db_pass = process.env.DATABASE_PASSWORD;
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: db_pass,
  database: "dormitory-management",
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});
app.use(express.json());
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

const JWT_SECRET = process.env.JWT_SECRET;
// Helper function to hash passwords
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await hashPassword(password); // Hash the password

    const query = "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";
    db.query(query, [email, hashedPassword, name], (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }
      res.status(201).send("User registered");
    });
  } catch (err) {
    res.status(500).send("Error hashing password");
  }
});

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", email); // Log the login attempt

  // Query the database for the user
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const user = results[0];
        console.log("User found:", user); // Log the user data

        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isPasswordMatch); // Log password comparison result

        if (isPasswordMatch) {
          const token = jwt.sign({ email: user.email }, JWT_SECRET, {
            expiresIn: "1h",
          });
          return res.json({ token });
        } else {
          return res.status(401).send("Invalid email or password");
        }
      } else {
        return res.status(401).send("Invalid email or password");
      }
    }
  );
});

// Meal signup route

app.post("/meal-signup", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // Authenticated user's email

  // Query the database for the user
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const user = results[0];

        // Check if the user has already signed up for a meal
        db.query(
          "SELECT * FROM meal_signups WHERE user_id = ?",
          [user.id],
          (err, results) => {
            if (err) {
              return res.status(500).send("Server error");
            }

            if (results.length === 0) {
              // Generate current date for signup
              const signupDate = new Date();

              // Record the meal signup
              db.query(
                "INSERT INTO meal_signups (user_id, signup_date) VALUES (?, ?)",
                [user.id, signupDate],
                (err, results) => {
                  if (err) {
                    return res.status(500).send("Server error");
                  }
                  res.send("Meal signup recorded");
                }
              );
            } else {
              res.status(400).send("User already signed up");
            }
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

// Meal cancel route
app.post("/meal-cancel", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // Authenticated user's email

  // Query the database for the user
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const user = results[0];

        // Check if the user has signed up for a meal
        db.query(
          "SELECT * FROM meal_signups WHERE user_id = ?",
          [user.id],
          (err, results) => {
            if (err) {
              return res.status(500).send("Server error");
            }

            if (results.length > 0) {
              // Cancel the meal signup
              db.query(
                "DELETE FROM meal_signups WHERE user_id = ?",
                [user.id],
                (err, results) => {
                  if (err) {
                    return res.status(500).send("Server error");
                  }
                  res.send("Meal signup canceled");
                }
              );
            } else {
              res.status(400).send("User not signed up");
            }
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

// Fetch meal count route
app.get("/meal-count", authenticateToken, (req, res) => {
  // Query the database to count the number of meal signups
  db.query("SELECT COUNT(*) AS count FROM meal_signups", (err, results) => {
    if (err) {
      return res.status(500).send("Server error");
    }
    const count = results[0].count;
    res.json({ count });
  });
});

// Fetch meal signup status route
app.get("/meal-status", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // Authenticated user's email

  // Query the database for the user
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const user = results[0];

        // Check if the user has signed up for a meal
        db.query(
          "SELECT * FROM meal_signups WHERE user_id = ?",
          [user.id],
          (err, results) => {
            if (err) {
              return res.status(500).send("Server error");
            }

            if (results.length > 0) {
              res.json({ mealSignedUp: true });
            } else {
              res.json({ mealSignedUp: false });
            }
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

app.post("/maintenance-request", authenticateToken, (req, res) => {
  const { roomNumber, description } = req.body;
  const userEmail = req.user.email; // Authenticated user's email

  // Query the database for the user
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const userId = results[0].id;

        // Insert the maintenance request into the database
        db.query(
          "INSERT INTO maintenance_requests (user_id, room_number, description, status) VALUES (?, ?, ?, 'open')",
          [userId, roomNumber, description],
          (err, results) => {
            if (err) {
              return res.status(500).send("Server error");
            }
            res.send("Maintenance request submitted successfully");
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

app.get("/maintenance-requests", authenticateToken, (req, res) => {
  const userEmail = req.user.email; // Authenticated user's email

  // Query the database for the user
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        return res.status(500).send("Server error");
      }

      if (results.length > 0) {
        const userId = results[0].id;

        // Get the user's maintenance requests
        db.query(
          "SELECT * FROM maintenance_requests WHERE user_id = ?",
          [userId],
          (err, results) => {
            if (err) {
              return res.status(500).send("Server error");
            }
            res.json(results);
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.send("Welcome to the protected dashboard route!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
