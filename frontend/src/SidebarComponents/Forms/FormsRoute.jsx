import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
import MonthlyFireSafetyInspections from "./MonthlyFireSafetyInspections";
import IncidentAccident from "./IncidentAccident";
import LeaveApplication from "./LeaveApplication";
import OptOutRequestForm from "./OptOutRequestForm";
import PassportRequest from "./PassportRequest";
import ShiftHandOver from "./ShiftHandOver";
import StaffTrainingChecklist from "./StaffTrainingChecklist";
import TpcForm from "./TpcForm";
import WeeklyOvertimeForm from "./WeeklyOvertimeForm";
import PatrollingChecklist from "./PatrollingChecklist";
import FacilityComplaintForm from "./FacilityComplaintForm";

const FormsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-56 mt-6 py-12 px-4 md:px-5 lg:pl-10 min-h-screen">
        <Routes>
          <Route
            path="monthly-fire-safety-inspections"
            element={<MonthlyFireSafetyInspections />}
          />
          <Route path="incident-accident" element={<IncidentAccident />} />
          <Route path="leave-application" element={<LeaveApplication />} />
          <Route path="opt-out-req-form" element={<OptOutRequestForm />} />
          <Route path="passport-req" element={<PassportRequest />} />
          <Route path="shift-hand-over" element={<ShiftHandOver />} />
          <Route
            path="staff-training-checklist"
            element={<StaffTrainingChecklist />}
          />
          <Route path="tpc-form" element={<TpcForm />} />
          <Route path="weekly-overtime-form" element={<WeeklyOvertimeForm />} />
          <Route path="patolling-checklist" element={<PatrollingChecklist />} />
          <Route
            path="facility-complaint-form"
            element={<FacilityComplaintForm />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default FormsRoute;
