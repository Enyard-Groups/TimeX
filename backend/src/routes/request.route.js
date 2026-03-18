import express from "express";

import { getleaveRequests,createLeaveRequest,getWfhRequests } from "../controllers/request.controller.js";

const requestRouter=express.Router();

requestRouter.get("/leave",getleaveRequests);
requestRouter.post("/leave",createLeaveRequest);
requestRouter.get("/wfh",getWfhRequests);

export default requestRouter;
