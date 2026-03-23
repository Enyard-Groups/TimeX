import express from "express";

import { getVisitorBooking, createVisitorBooking, getVisitors, updateVisitorBooking, deleteVisitorBooking } from "../controllers/visitor.controller.js";

const visitorRouter=express.Router();

visitorRouter.get("/booking", getVisitorBooking);
visitorRouter.post("/booking", createVisitorBooking);
visitorRouter.put("/booking/:id", updateVisitorBooking);
visitorRouter.delete("/booking/:id", deleteVisitorBooking);
visitorRouter.get("/", getVisitors);


export default visitorRouter;

