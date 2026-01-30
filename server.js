const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* ===============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* ===============================
   REGISTER (SAVE USER)
================================ */
app.post("/data", async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      city,
      budget,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          fullName,
          email,
          role || "buyer",
          phone || "",
          city || "",
          budget || "",
          hashedPassword,
          new Date().toLocaleString()
        ]]
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ===============================
   LOGIN (STEP 2)
================================ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(401).json({ error: "No users found" });
    }

    // remove header
    const users = rows.slice(1);

    // find user by email (column B)
    const user = users.find(row => row[1] === email);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const storedHashedPassword = user[6]; // column G

    const isMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // SUCCESS
    res.json({
      success: true,
      user: {
        name: user[0],
        email: user[1],
        role: user[2]
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
