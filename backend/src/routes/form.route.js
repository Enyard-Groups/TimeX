import express from "express";


import {
  getMonthly,
  createMonthly,
  updateMonthly,
  deleteMonthly,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  getLeaveApplication,
  createLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
  getOptRequest,
  createOptRequest,
  updateOptRequest,
  deleteOptRequest,
  getPassport,
  createPassport,
  updatePassport,
  deletePassport,
  getShiftOver,
  createShiftOver,
  updateShiftOver,
  deleteShiftOver,
  getstafftraining,
  createstafftraining,
  updateStaffTraining,
  deleteStaffTraining,
  getTcpForm,
  createTcpForm,
  updateTcpForm,
  deleteTcpForm,
  getweeklyOvertime,
  createweeklyOvertime,
  updateweeklyOvertime,
  deleteweeklyOvertime,
  getpatrollingChecklist,
  createpatrollingChecklist,
  updatepatrollingChecklist,
  deletepatrollingChecklist,
  getFacilityComplaint,
  createFacilityComplaint,
  updateFacilityComplaint,
  deleteFacilityComplaint,
} from "../controllers/form.controller.js";

const formRoute = express.Router();



formRoute.get("/monthly", getMonthly);
formRoute.post("/monthly", createMonthly);
formRoute.put("/monthly/:id", updateMonthly);
formRoute.delete("/monthly/:id", deleteMonthly);


formRoute.get("/incident", getIncident);
formRoute.post("/incident", createIncident);
formRoute.put("/incident/:id", updateIncident);
formRoute.delete("/incident/:id", deleteIncident);
 
formRoute.get("/leaveApplication", getLeaveApplication);
formRoute.post("/leaveApplication", createLeaveApplication);
formRoute.put("/leaveApplication/:id", updateLeaveApplication);
formRoute.delete("/leaveApplication/:id", deleteLeaveApplication);

formRoute.get("/optRequest", getOptRequest);
formRoute.post("/optRequest", createOptRequest);
formRoute.put("/optRequest/:id", updateOptRequest);
formRoute.delete("/optRequest/:id", deleteOptRequest);

formRoute.get("/passportRequest", getPassport);
formRoute.post("/passportRequest", createPassport);
formRoute.put("/passportRequest/:id", updatePassport);
formRoute.delete("/passportRequest/:id", deletePassport);

formRoute.get("/shiftHandOver", getShiftOver);
formRoute.post("/shiftHandOver", createShiftOver);
formRoute.put("/shiftHandOver/:id", updateShiftOver);
formRoute.delete("/shiftHandOver/:id", deleteShiftOver);

formRoute.get("/staffTraining", getstafftraining);
formRoute.post("/staffTraining", createstafftraining);
formRoute.put("/staffTraining/:id", updateStaffTraining);
formRoute.delete("/staffTraining/:id", deleteStaffTraining);

formRoute.get("/tpcForm", getTcpForm);
formRoute.post("/tpcForm", createTcpForm);
formRoute.put("/tpcForm/:id", updateTcpForm);
formRoute.delete("/tpcForm/:id", deleteTcpForm);

formRoute.get("/weeklyOvertime", getweeklyOvertime);
formRoute.post("/weeklyOvertime", createweeklyOvertime);
formRoute.put("/weeklyOvertime/:id", updateweeklyOvertime);
formRoute.delete("/weeklyOvertime/:id", deleteweeklyOvertime);

formRoute.get("/patrollingChecklist", getpatrollingChecklist);
formRoute.post("/patrollingChecklist", createpatrollingChecklist);
formRoute.put("/patrollingChecklist/:id", updatepatrollingChecklist);
formRoute.delete("/patrollingChecklist/:id", deletepatrollingChecklist);

formRoute.get("/facilityComplaint", getFacilityComplaint);
formRoute.post("/facilityComplaint", createFacilityComplaint);
formRoute.put("/facilityComplaint/:id", updateFacilityComplaint);
formRoute.delete("/facilityComplaint/:id", deleteFacilityComplaint);







export default formRoute;