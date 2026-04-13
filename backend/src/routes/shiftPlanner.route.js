import express from "express";
import { getRoster, assignRoster, bulkAssignRoster } from "../controllers/shiftPlanner.controller.js";

const shiftPlannerRouter = express.Router();

shiftPlannerRouter.get("/", getRoster);
shiftPlannerRouter.post("/assign", assignRoster);
shiftPlannerRouter.post("/bulk-assign", bulkAssignRoster);

export default shiftPlannerRouter;
