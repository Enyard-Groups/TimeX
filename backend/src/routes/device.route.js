import express from "express";

import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceModels,
  createDeviceModel,
  updateDeviceModel,
  deleteDeviceModel,
  getDeviceCommunications,
} from "../controllers/device.controller.js";

const deviceRouter = express.Router();

// Devices
deviceRouter.get("/devices", getDevices);
deviceRouter.post("/devices", createDevice);
deviceRouter.put("/devices/:id", updateDevice);
deviceRouter.delete("/devices/:id", deleteDevice);

// Device Models
deviceRouter.get("/device-models", getDeviceModels);
deviceRouter.post("/device-models", createDeviceModel);
deviceRouter.put("/device-models/:id", updateDeviceModel);
deviceRouter.delete("/device-models/:id", deleteDeviceModel);

// Device Communications (read-only — populated by device sync)
deviceRouter.get("/device-communications", getDeviceCommunications);

export default deviceRouter;