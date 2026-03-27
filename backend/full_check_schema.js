import db from "./src/lib/db.js";
import fs from "fs";

async function checkSchema() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'visitor_bookings'
      ORDER BY ordinal_position
    `);
    const output = res.rows.map(row => `${row.column_name}:${row.data_type}`).join("\n");
    fs.writeFileSync("schema_output.txt", output);
    process.exit(0);
  } catch (err) {
    fs.writeFileSync("schema_output.txt", "ERROR: " + err.message);
    process.exit(1);
  }
}

checkSchema();
