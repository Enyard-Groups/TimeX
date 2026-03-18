import express from "express";

import {getDevices,createDevice,getDeviceModels} from "../controllers/device.controller.js"

const deviceRouter=express.Router();


deviceRouter.get("/",getDevices);
deviceRouter.post("/",createDevice);
deviceRouter.get("/models",getDeviceModels);

export default deviceRouter;