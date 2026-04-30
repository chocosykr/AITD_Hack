const { Pool } = require('pg');
require('dotenv').config();

async function test() {
  let connectionString = process.env.DATABASE_URL;
  connectionString = connectionString.replace('?sslmode=require', '');
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log("Connected successfully!");
    client.release();
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    pool.end();
  }
}

test();
