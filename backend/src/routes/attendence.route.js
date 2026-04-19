import express from "express";

import {
  getAttendenceLogs,
  createAttendenceLog,
  getDashboardStats,
  punchIn,
  punchOut,
  getAttendanceRecordsByUser,
  createAttendanceRecord,
  updateAttendanceRecord,
} from "../controllers/attendence.controller.js";
const attendenceRouter = express.Router();

attendenceRouter.post("/punch-in/:id", punchIn);
attendenceRouter.post("/punch-out/:id", punchOut);
attendenceRouter.get("/logs", getAttendenceLogs);
attendenceRouter.post("/logs", createAttendenceLog);
attendenceRouter.get("/stats", getDashboardStats);

// AttendancePunch.jsx (new schema) endpoints
attendenceRouter.get("/records/:userId", getAttendanceRecordsByUser);
attendenceRouter.post("/records", createAttendanceRecord);
attendenceRouter.put("/records/:attendanceId", updateAttendanceRecord);

export default attendenceRouter;


