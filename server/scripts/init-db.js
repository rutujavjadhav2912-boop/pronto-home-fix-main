const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load .env from server folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const ROOT_USER = process.env.DB_ROOT_USER || 'root';
const ROOT_PASSWORD = process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD || 'password';
const HOST = process.env.DB_HOST || 'localhost';

async function run() {
  try {
    const sqlPath = path.resolve(__dirname, '..', 'db', 'init.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('init.sql not found at', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to MySQL as', ROOT_USER, '@', HOST);
    const connection = await mysql.createConnection({
      host: HOST,
      user: ROOT_USER,
      password: ROOT_PASSWORD,
      multipleStatements: true,
      // increase timeout for long scripts
      connectTimeout: 10000
    });

    console.log('Executing init.sql...');
    const cleanedSql = sql
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .replace(/--.*$/gm, '') // remove single-line comments
      .trim();

    const statements = cleanedSql
      .split(/;\s*(?:\r?\n|$)/)
      .map((stmt) => stmt.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        const message = err.message || '';
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME' || /Duplicate column name|Duplicate key name|already exists/i.test(message)) {
          console.warn('Skipping existing schema item:', message);
          continue;
        }
        throw err;
      }
    }

    console.log('Database initialization completed successfully');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message || err);
    process.exit(1);
  }
}

run();
