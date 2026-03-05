const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "my app"   // 👈 EXACT name
});

module.exports = db;
