require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { pool } = require('../db/index');

async function run() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('DB query result', rows);
    const [tables] = await pool.query(`SHOW TABLES`);
    console.log('Existing tables:', tables.map(r => Object.values(r)[0]));
    process.exit(0);
  } catch (err) {
    console.error('DB test failed', err);
    process.exit(1);
  }
}

run();
