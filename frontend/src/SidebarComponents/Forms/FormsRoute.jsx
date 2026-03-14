import React from "react";
import { Routes,Route } from "react-router-dom";
import Navbar from "../../components/Navbar";

const FormsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="monthly-fire-safety-inspections" element={<div>MonthlyFireSafetyInspections</div>} />
          <Route path="incident-accident" element={<div>IncidentAccident</div>} />
          <Route path="leave-application" element={<div>LeaveApplication</div>} />
          <Route path="opt-out-req-form" element={<div>OptOutRequestForm</div>} />
          <Route path="passport-req" element={<div>PassportRequest</div>} />
          <Route path="shift-hand-over" element={<div>ShiftHandOver</div>} />
          <Route path="staff-training-checklist" element={<div>StaffTrainingChecklist</div>} />
          <Route path="tpc-form" element={<div>TpcForm</div>} />
          <Route path="weekly-overtime-form" element={<div>WeeklyOvertimeForm</div>} />
          <Route path="patolling-checklist" element={<div>PatrollingChecklist</div>} />
          <Route path="facility-complaint-form" element={<div>FacilityComplaintForm</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default FormsRoute;
