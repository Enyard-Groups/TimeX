import express from "express";

const masterRoute=express.Router();

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getShifts,
  createShift,
  updateShift,
  
  deleteShift,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getClaimCategories,
  createClaimCategory,
  updateClaimCategory,
  deleteClaimCategory,
  getIssueTypes,
  createIssueType,
  updateIssueType,
  deleteIssueType,
} from "../controllers/master.controller.js"

masterRoute.get("/departments",getDepartments);
masterRoute.post("/departments",createDepartment);
masterRoute.put("/departments/:id", updateDepartment);
masterRoute.delete("/departments/:id",deleteDepartment);

masterRoute.get("/designation",getDesignations);
masterRoute.post("/designation",createDesignation);
masterRoute.put("/designation/:id",updateDesignation);
masterRoute.delete("/designation/:id",deleteDesignation);

masterRoute.get("/shifts",getShifts);
masterRoute.post("/shifts",createShift);
masterRoute.put("/shifts/:id",updateShift);
masterRoute.delete("/shifts/:id",deleteShift);

masterRoute.get('/holidays', getHolidays);
masterRoute.post('/holidays', createHoliday);
masterRoute.put('/holidays/:id', updateHoliday);
masterRoute.delete('/holidays/:id', deleteHoliday);
masterRoute.get('/claim-categories', getClaimCategories);
masterRoute.post('/claim-categories', createClaimCategory);
masterRoute.put('/claim-categories/:id', updateClaimCategory);
masterRoute.delete('/claim-categories/:id', deleteClaimCategory);
masterRoute.get('/issue-types', getIssueTypes);
masterRoute.post('/issue-types', createIssueType);
masterRoute.put('/issue-types/:id', updateIssueType);
masterRoute.delete('/issue-types/:id', deleteIssueType);


export default masterRoute;