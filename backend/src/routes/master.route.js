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
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getGeofencingLocations,
  createGeofencingLocation,
  updateGeofencingLocation,
  deleteGeofencingLocation,
  getEmployeeGeofencing,
  assignGeofencingToEmployees,

  // getLocationGroups,
  // createLocationGroup,
  // updateLocationGroup,
  // deleteLocationGroup,
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
masterRoute.get('/leave-types', getLeaveTypes);
masterRoute.post('/leave-types', createLeaveType);
masterRoute.put('/leave-types/:id', updateLeaveType);
masterRoute.delete('/leave-types/:id', deleteLeaveType);
masterRoute.get('/geofencing', getGeofencingLocations);
masterRoute.post('/geofencing', createGeofencingLocation);
masterRoute.put('/geofencing/:id', updateGeofencingLocation);
masterRoute.delete('/geofencing/:id', deleteGeofencingLocation);
masterRoute.get('/employee-geofencing', getEmployeeGeofencing);
masterRoute.post('/employee-geofencing', assignGeofencingToEmployees);

// Location Groups
// masterRoute.get('/location-groups', getLocationGroups);
// masterRoute.post('/location-groups', createLocationGroup);
// masterRoute.put('/location-groups/:id', updateLocationGroup);
// masterRoute.delete('/location-groups/:id', deleteLocationGroup);

export default masterRoute;