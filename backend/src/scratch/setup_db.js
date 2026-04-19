import db from '../lib/db.js';

const setupTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id BIGINT PRIMARY KEY,
        user_id INT REFERENCES employees(id),
        username TEXT,
        date TEXT,
        check_in TEXT,
        check_out TEXT,
        status TEXT,
        hours TEXT,
        location JSONB,
        photo TEXT,
        checkin_device TEXT,
        checkout_device TEXT,
        in_time TIMESTAMPTZ,
        session_seconds INT,
        total_day_seconds INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("Table attendance_records created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
};

setupTable();
