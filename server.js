const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(express.json());

// Google Auth from Render ENV
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Test route
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Save data route
app.post("/data", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
 range: "Betterside leads!A:C",

      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, email, role]],
      },
    });

    console.log("ROW ADDED:", name, email, role);

    res.json({ success: true });
  } catch (err) {
    console.error("Google Sheet Error:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
