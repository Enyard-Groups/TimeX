import db from "./src/lib/db.js";

async function checkTables() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:");
    res.rows.forEach(row => console.log("- " + row.table_name));
    process.exit(0);
  } catch (err) {
    console.error("Error checking tables:", err);
    process.exit(1);
  }
}

checkTables();
