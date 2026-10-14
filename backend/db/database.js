// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {});
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error("Error connecting to MongoDB", err);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

// db.js
const { Pool, types } = require("pg");

types.setTypeParser(1082, (v) => v);            // DATE    -> "YYYY-MM-DD"
types.setTypeParser(1700, (v) => parseFloat(v)); // NUMERIC -> number

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("PostgreSQL connection error", err));

module.exports = pool;





