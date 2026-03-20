import db from "./src/lib/db.js";

const createHolidaysTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        holidaystart DATE NOT NULL,
        holidayend DATE NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_holidays_code ON holidays(code);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_holidays_company ON holidays(company);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_holidays_location ON holidays(location);`);

    console.log("Holidays table created successfully");
  } catch (error) {
    console.error("Error creating holidays table:", error);
  }
};

createHolidaysTable();