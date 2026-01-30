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
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working ✅" });
});

/* ===============================
   POST DATA → GOOGLE SHEET
================================ */
app.post("/data", async (req, res) => {
  try {
    const {
      name,        // ✅ FIXED (was fullName)
      email,
      role,
      phone,
      city,
      budget,
      password
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email required" });
    }

    console.log("DATA RECEIVED:", req.body);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          name,                     // A name
          email,                    // B email
          role || "buyer",          // C role
          phone || "",              // D phone
          city || "",               // E city
          budget || "",             // F budget
          password || "",           // G password
          new Date().toLocaleString() // H time
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
