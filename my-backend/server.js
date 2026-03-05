require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DB Connection (no duplicate)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "my app"
});

// ✅ Test DB connection
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ DB Error:", err);
  } else {
    console.log("✅ Database connected!");
  }
});

// 🔐 Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User created" });
    }
  );
});

// 🔑 Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "SECRET123", { expiresIn: "1d" });
    res.json({ token });
  });
});

// 📝 Save Form
app.post("/api/forms", (req, res) => {
  const { user_id, title, message } = req.body;

  db.query(
    "INSERT INTO forms (user_id, title, message) VALUES (?, ?, ?)",
    [user_id, title, message],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Form saved" });
    }
  );
});

// 👑 Admin: Get all forms
app.get("/api/admin/forms", (req, res) => {
  db.query("SELECT * FROM forms", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🚀 Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
