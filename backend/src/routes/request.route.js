import express from "express";
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  bulkUpdateLeaveStatus,
  getClaimRequests,
  createClaimRequest,
  updateClaimRequest,
  deleteClaimRequest,
  bulkUpdateClaimStatus,
  getTravelRequests,
  createTravelRequest,
  updateTravelRequest,
  deleteTravelRequest,
  bulkUpdateTravelStatus,
  getWfhRequests,
  createWfhRequest,
  updateWfhRequest,
  deleteWfhRequest,
  bulkUpdateWfhStatus,
  getManualRequests,
  createManualRequest,
  updateManualRequest,
  deleteManualRequest,
} from "../controllers/request.controller.js";

const router = express.Router();

// Leave
router.get("/leave", getLeaveRequests);
router.post("/leave", createLeaveRequest);
router.put("/leave/bulk", bulkUpdateLeaveStatus);
router.put("/leave/:id", updateLeaveRequest);
router.delete("/leave/:id", deleteLeaveRequest);

// Claim
router.get("/claim", getClaimRequests);
router.post("/claim", createClaimRequest);
router.put("/claim/bulk", bulkUpdateClaimStatus);
router.put("/claim/:id", updateClaimRequest);
router.delete("/claim/:id", deleteClaimRequest);

// Travel
router.get("/travel", getTravelRequests);
router.post("/travel", createTravelRequest);
router.put("/travel/bulk", bulkUpdateTravelStatus);
router.put("/travel/:id", updateTravelRequest);
router.delete("/travel/:id", deleteTravelRequest);

// WFH
router.get("/wfh", getWfhRequests);
router.post("/wfh", createWfhRequest);
router.put("/wfh/bulk", bulkUpdateWfhStatus);
router.put("/wfh/:id", updateWfhRequest);
router.delete("/wfh/:id", deleteWfhRequest);

// Manual Entry
router.get("/manual", getManualRequests);
router.post("/manual", createManualRequest);
router.put("/manual/:id", updateManualRequest);
router.delete("/manual/:id", deleteManualRequest);

export default router;
