const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working ✅" });
});

app.post("/data", (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }

  console.log("DATA RECEIVED:", name, email, role);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
