require("dotenv").config();

const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => {
    console.log("POSTGRES ONLINE CONNECTED");
  })
  .catch((err) => {
    console.error("POSTGRES ERROR:", err.message);
  });

module.exports = db;