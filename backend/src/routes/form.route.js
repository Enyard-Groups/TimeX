import express from "express";


import {
  getFacilityComplaint,
  createFacilityComplaint,
  updateFacilityComplaint,
  deleteFacilityComplaint,
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
  getPassportRequest,
    createPassportRequest,
  updatePassportRequest,
  deletePassportRequest,
  getShiftOver,
  createShiftOver,
  updateShiftOver,
  deleteShiftOver,
  getStaffTraining,
  createStaffTraining,
  updateStaffTraining,
  deleteStaffTraining,
  getTcpForm, 
  createTcpForm,
  updateTcpForm,
  deleteTcpForm,
  getWeeklyOvertime,
  createWeeklyOvertime,
  updateWeeklyOvertime,
  deleteWeeklyOvertime,
  getPatrollingChecklist,
  createPatrollingChecklist,  
  updatePatrollingChecklist,
  deletePatrollingChecklist,
  getMonthlyFireSafety,
  createMonthlyFireSafety,
  updateMonthlyFireSafety,
  deleteMonthlyFireSafety
} from "../controllers/form.controller.js";

const formRoute = express.Router();



formRoute.get("/FacilityComplaint", getFacilityComplaint);
formRoute.post("/FacilityComplaint", createFacilityComplaint)
formRoute.put("/FacilityComplaint/:id", updateFacilityComplaint);
formRoute.delete("/FacilityComplaint/:id", deleteFacilityComplaint);


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

formRoute.get("/passportRequest", getPassportRequest);
formRoute.post("/passportRequest", createPassportRequest);
formRoute.put("/passportRequest/:id", updatePassportRequest);
formRoute.delete("/passportRequest/:id", deletePassportRequest);

formRoute.get("/shiftHandOver", getShiftOver);
formRoute.post("/shiftHandOver", createShiftOver);
formRoute.put("/shiftHandOver/:id", updateShiftOver);
formRoute.delete("/shiftHandOver/:id", deleteShiftOver);

formRoute.get("/staffTraining", getStaffTraining);
formRoute.post("/staffTraining", createStaffTraining);


formRoute.put("/staffTraining/:id", updateStaffTraining);
formRoute.delete("/staffTraining/:id", deleteStaffTraining);

formRoute.get("/tpcForm", getTcpForm);
formRoute.post("/tpcForm", createTcpForm);
formRoute.put("/tpcForm/:id", updateTcpForm);
formRoute.delete("/tpcForm/:id", deleteTcpForm);

formRoute.get("/weeklyOvertime",getWeeklyOvertime);
formRoute.post("/weeklyOvertime", createWeeklyOvertime);
formRoute.put("/weeklyOvertime/:id", updateWeeklyOvertime);
formRoute.delete("/weeklyOvertime/:id", deleteWeeklyOvertime);

formRoute.get("/patrollingChecklist", getPatrollingChecklist);
formRoute.post("/patrollingChecklist", createPatrollingChecklist);
formRoute.put("/patrollingChecklist/:id", updatePatrollingChecklist);
formRoute.delete("/patrollingChecklist/:id", deletePatrollingChecklist);

formRoute.get("/monthlyFireSafety", getMonthlyFireSafety);
formRoute.post("/monthlyFireSafety", createMonthlyFireSafety);
formRoute.put("/monthlyFireSafety/:id", updateMonthlyFireSafety);
formRoute.delete("/monthlyFireSafety/:id", deleteMonthlyFireSafety);









export default formRoute;