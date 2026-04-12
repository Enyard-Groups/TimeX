import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function main() {
  try {
    const payload = {
      device_enrollment_id: "TEST001",
      company_enrollment_id: "TEST001",
      full_name: "Test Employee",
      mobile: "1234567890",
      company: 1,
      location: "Test Location",
      designation_id: 35,
      department_id: 2,
      shift_id: null
    };

    const result = await pool.query(
      `INSERT INTO employees (
        device_enrollment_id, company_enrollment_id, full_name, phone,
        company, location,
        department_id, designation_id, shift_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        payload.device_enrollment_id,
        payload.company_enrollment_id,
        payload.full_name,
        payload.mobile,
        payload.company,
        payload.location,
        payload.department_id,
        payload.designation_id,
        payload.shift_id,
      ]
    );
    console.log("Success:", result.rows[0]);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
