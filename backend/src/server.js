import express from "express";
import dotenv from "dotenv";
import db from "./lib/db.js" 
import userRouter from "./routes/users.route.js";
import deviceRouter from "./routes/device.route.js";
import attendenceRouter from "./routes/attendence.route.js";
import requestRouter from "./routes/request.route.js";
import employeesRoute from "./routes/employees.route.js";
import masterRoute from "./routes/master.route.js";
import visitorRouter from "./routes/visitor.route.js";
import cors from "cors";


const PORT=process.env.PORT;

const app=express();
dotenv.config();
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials:true
}));

app.use("/api/users", userRouter);
app.use("/api/employee",employeesRoute);
app.use("/api/master",masterRoute);
app.use("/api/device",deviceRouter);
app.use("/api/attendence",attendenceRouter);
app.use("/api/requests",requestRouter);
app.use("/api/visitor", visitorRouter);



const testDB = async () => {
  try {
    const result = await db.query("SELECT * FROM users");
    console.log("database is connected");

    // Recreate employees table with full schema matching frontend
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        device_enrollment_id VARCHAR(100),
        company_enrollment_id VARCHAR(100),
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20),
        dob DATE,
        doj DATE,
        company VARCHAR(255),
        location VARCHAR(255),
        designation VARCHAR(255),
        shift VARCHAR(100),
        leave_plan VARCHAR(100),
        first_approver VARCHAR(255),
        second_approver VARCHAR(255),
        is_manager BOOLEAN DEFAULT false,
        type VARCHAR(50) DEFAULT 'User',
        break_hours_friday BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT false,
        is_mobile_user BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Employees table ready");

    // Drop and recreate holidays table to ensure latest schema
    await db.query(`DROP TABLE IF EXISTS holidays;`);

    // Create holidays table if it doesn't exist
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

    // Check if claim_categories table exists and has the correct structure
    try {
      await db.query(`SELECT name FROM claim_categories LIMIT 1;`);
    } catch (error) {
      // Table doesn't exist or doesn't have 'name' column, create it
      await db.query(`DROP TABLE IF EXISTS claim_categories CASCADE;`);
      await db.query(`
        CREATE TABLE claim_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          description TEXT,
          is_attachment BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Create indexes (these will be created if they don't exist)
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_claim_categories_name ON claim_categories(name);`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_claim_categories_company ON claim_categories(company);`);
    } catch (indexError) {
      console.log("Index creation skipped:", indexError.message);
    }

    console.log("Holidays and Claim Categories tables ready");
  } 
  catch (error) {
    console.error(error); 
  }
};

testDB();



app.listen(PORT, ()=>{
  console.log(`server is running at http://localhost:${PORT}`);
})