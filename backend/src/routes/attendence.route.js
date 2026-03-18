import express from "express";

import { getAttendenceLogs,createAttendenceLog,getDashboardStats } from "../controllers/attendence.controller.js";
const attendenceRouter=express.Router();

attendenceRouter.get("/logs",getAttendenceLogs);
attendenceRouter.post("/logs",createAttendenceLog);
attendenceRouter.get("/stats",getDashboardStats);

export default attendenceRouter;


