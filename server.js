const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROOT ROUTE (THIS FIXES YOUR ERROR)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// POST ROUTE
app.post("/data", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "Name and email are required"
    });
  }

  console.log("DATA RECEIVED:", name, email);

  res.json({
    success: true,
    message: "Data received successfully",
    name,
    email
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
