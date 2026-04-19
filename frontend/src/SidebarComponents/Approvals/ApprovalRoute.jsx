import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ManualEntryApproval from "./MannualEntryApproval";
import LeaveRequestApproval from "./LeaveRequestApproval";
import BusinessTravelApproval from "./BusinessTravelApproval";
import WfhApproval from "./WfhApproval";
import ClaimApproval from "./ClaimApproval";
import MonthlyFireSafetyApproval from "./FormsApprovals/MonthlyFireSafetyApproval";
import IncidentAccidentApproval from "./FormsApprovals/IncidentAccidentApproval";
import LeaveApplicationApproval from "./FormsApprovals/LeaveApplicationApproval";
import OptOutRequestApproval from "./FormsApprovals/OptOutRequestApproval";
import PassportRequestApproval from "./FormsApprovals/PassportRequestApproval";
import ShiftHandOverApproval from "./FormsApprovals/ShiftHandOverApproval";
import StaffTrainingChecklistApproval from "./FormsApprovals/StaffTrainingChecklistApproval";
import TpcApproval from "./FormsApprovals/TpcApproval";
import WeeklyOvertimeApproval from "./FormsApprovals/WeeklyOvertimeApproval";
import PatrollingChecklistApproval from "./FormsApprovals/PatrollingChecklistApproval";
import FacilityComplaintFormApproval from "./FormsApprovals/FacilityComplaintFormApproval";

const ApprovalRoute = ({ user }) => {
  return (
    <div className="bg-[#0f172a]">
      <Navbar user={user} />
      <div className="lg:ml-64 pt-5 pb-12 px-4 md:px-5 lg:pl-6 rounded-t-3xl min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
        <Routes>
          <Route
            path="monthly-fire-safety-approval"
            element={<MonthlyFireSafetyApproval />}
          />
          <Route
            path="incident-accident-approval"
            element={<IncidentAccidentApproval />}
          />

          <Route
            path="leave-application-approval"
            element={<LeaveApplicationApproval />}
          />

          <Route
            path="opt-out-request-approval"
            element={<OptOutRequestApproval />}
          />

          <Route
            path="passport-request-approval"
            element={<PassportRequestApproval />}
          />

          <Route
            path="shift-hand-over-approval"
            element={<ShiftHandOverApproval />}
          />

          <Route
            path="staff-training-checklist-approval"
            element={<StaffTrainingChecklistApproval />}
          />

          <Route path="tpc-approval" element={<TpcApproval />} />

          <Route
            path="weekly-overtime-approval"
            element={<WeeklyOvertimeApproval />}
          />

          <Route
            path="patrolling-checklist-approval"
            element={<PatrollingChecklistApproval />}
          />

          <Route
            path="facility-complaint-form-approval"
            element={<FacilityComplaintFormApproval />}
          />

          <Route
            path="mannual-entry-approval"
            element={<ManualEntryApproval />}
          />
          <Route path="leave-req-approval" element={<LeaveRequestApproval />} />
          <Route
            path="bussiness-travel-approval"
            element={<BusinessTravelApproval />}
          />
          <Route path="wfh-approval" element={<WfhApproval />} />
          <Route path="claim-approval" element={<ClaimApproval />} />
        </Routes>
      </div>
    </div>
  );
};

export default ApprovalRoute;
