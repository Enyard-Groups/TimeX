import db from "./src/lib/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  const sqlFilePath = path.join(__dirname, "src", "sql", "form.sql");
  try {
    const sql = fs.readFileSync(sqlFilePath, "utf8");
    await db.query(sql);
    console.log("Database tables initialized successfully from form.sql");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

initDB();
