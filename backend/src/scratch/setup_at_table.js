import db from '../lib/db.js';

const setupAttendanceTable = async () => {
  try {
    // Drop existing table if any to avoid confusion, or just create if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          emp_id INTEGER NOT NULL REFERENCES employees(id),
          punch_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          punch_out TIMESTAMP,
          punch_in_image TEXT,
          punch_out_image TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table attendance created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
};

setupAttendanceTable();
