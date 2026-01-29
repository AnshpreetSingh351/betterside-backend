// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ---------- GOOGLE SHEETS SETUP ----------
const auth = new google.auth.GoogleAuth({
  keyFile: "google-key.json", // service account key
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// 🔴 PUT YOUR GOOGLE SHEET ID HERE
const SPREADSHEET_ID = "14A7bDDPWb7H5wuO13A_quypa5WvtbixHFeS2k34tAo4";

// ---------- ROUTES ----------

// Health check
app.get("/", (req, res) => {
  res.send("BetterSide backend running 🚀");
});

// ✅ POST route (frontend / API only)
app.post("/data", async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role required" });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, role, new Date().toLocaleString()]],
      },
    });

    res.json({ message: "Saved to Google Sheet ✅" });
  } catch (error) {
    console.error("Google Sheet Error:", error);
    res.status(500).json({ message: "Failed to save data ❌" });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
