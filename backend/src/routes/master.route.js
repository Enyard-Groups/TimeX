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
  getClaimCategories,
  getIssueTypes,
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
masterRoute.get('/claim-categories', getClaimCategories);
masterRoute.get('/issue-types', getIssueTypes);


export default masterRoute;