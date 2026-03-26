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
import formRouter from "./routes/form.route.js";


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
app.use("/api/form", formRouter);



const testDB = async () => {
  try {
    const result = await db.query("SELECT * FROM users");
    console.log("database is connected");

  }

  catch(error){
    console.log("Error in connect db :",error.message)
  }
};

testDB();



app.listen(PORT, ()=>{
  console.log(`server is running at http://localhost:${PORT}`);
})