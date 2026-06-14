import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import TransactionModel from './models/transactions/TransactionModel.js';

dotenv.config({ path: './.env' });

const run = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tvu_fund_management',
    port: parseInt(process.env.DB_PORT) || 3306,
  });

  // Since TransactionModel imports pool from '../../config/db.js', let's check its output
  console.log('Fetching summary from TransactionModel...');
  const summary = await TransactionModel.getTransactionsSummary({});
  console.log(summary);

  await pool.end();
};

run().catch(console.error);
