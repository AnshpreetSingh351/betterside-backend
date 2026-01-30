const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
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
   TEST ROUTES
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working ✅" });
});

/* ===============================
   REGISTER → SAVE TO GOOGLE SHEET
================================ */
app.post("/data", async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
      phone,
      city,
      budget,
      password,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          fullName,                  // A - Name
          email,                     // B - Email
          role || "buyer",           // C - Role
          phone || "",               // D - Phone
          city || "",                // E - City
          budget || "",              // F - Budget
          hashedPassword,            // G - 🔐 Hashed Password
          new Date().toLocaleString()// H - Time
        ]]
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

/* ===============================
   LOGIN → CHECK PASSWORD
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
      return res.status(401).json({ error: "User not found" });
    }

    // Remove header row
    const users = rows.slice(1);

    // Find user by email (Column B)
    const user = users.find(row => row[1] === email);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const hashedPassword = user[6]; // Column G

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Login success
    res.json({
      success: true,
      user: {
        name: user[0],
        email: user[1],
        role: user[2],
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===============================
   START SERVER (MUST BE LAST)
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
