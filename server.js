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
   TEST ROUTES
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
      password
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("DATA RECEIVED:", email);

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
          hashedPassword,               // 🔐 hashed password
          new Date().toLocaleString()
        ]]
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error("GOOGLE SHEET ERROR:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});


/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
