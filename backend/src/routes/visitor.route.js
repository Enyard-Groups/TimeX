import express from "express";

import { getVisitorBooking, createVisitorBooking, getVisitors} from "../controllers/visitor.controller.js";

const visitorRouter=express.Router();

visitorRouter.get("/booking", getVisitorBooking);
visitorRouter.post("/booking", createVisitorBooking);
visitorRouter.get("/", getVisitors);

export default visitorRouter;

