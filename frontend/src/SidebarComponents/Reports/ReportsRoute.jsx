import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import MannualEntryStatus from "./MannualReports/MannualEntryStatus";
import MannualEntryReport from "./MannualReports/MannualEntryReport";
import MannualEntrySummary from "./MannualReports/MannualEntrySummary";
import AttendanceByEmployee from "./AttendanceReports/AttendanceByEmployee";
import AttendanceByLocation from "./AttendanceReports/AttendanceByLocation";
import AttendanceSummary from "./AttendanceReports/AttendanceSummary";
import AttendanceSummaryLocation from "./AttendanceReports/AttendanceSummaryLocation";
import AbsenceReport from "./AbsenceReports/AbsenceReport";
import AbsenceSummaryReport from "./AbsenceReports/AbsenceSummaryReport";
import EarlyOutReport from "./EarlyOutReport/EarlyOutReport";
import LeaveMonthlySummary from "./LeaveReports/LeaveMonthlySummary";
import LeaveSummaryDatewise from "./LeaveReports/LeaveSummaryDatewise";
import EmployeeReport from "./EmployeeReport";
import AllTransactionReport from "./AllTransactionReport";
import ExceptionReports from "./ExceptionReports";
import InOutReport from "./InOutReport";
import WfhReport from "./WfhReport";
import ClaimSummaryDatewise from "./ClaimSummaryDatewise";
import ClaimsReport from "./ClaimsReport";

const ReportsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="employee-report" element={<EmployeeReport />} />
          <Route path="mannual-entry-status" element={<MannualEntryStatus />} />
          <Route path="mannual-entry-report" element={<MannualEntryReport />} />
          <Route
            path="mannual-entry-summary"
            element={<MannualEntrySummary />}
          />
          <Route
            path="all-transaction-report"
            element={<AllTransactionReport />}
          />
          <Route
            path="attendance-by-employee"
            element={<AttendanceByEmployee />}
          />
          <Route
            path="attendance-by-location"
            element={<AttendanceByLocation />}
          />
          <Route path="attendance-summary" element={<AttendanceSummary />} />
          <Route
            path="attendance-summary-location"
            element={<AttendanceSummaryLocation />}
          />

          <Route path="exception-reports" element={<ExceptionReports />} />

          <Route path="absence-report" element={<AbsenceReport />} />
          <Route
            path="absence-summary-report"
            element={<AbsenceSummaryReport />}
          />

          <Route path="in-out-report" element={<InOutReport />} />

          <Route path="early-out-report" element={<EarlyOutReport />} />
          <Route
            path="leave-montly-summary"
            element={<LeaveMonthlySummary />}
          />
          <Route
            path="leave-summary-datewise"
            element={<LeaveSummaryDatewise />}
          />

          <Route path="wft-report" element={<WfhReport />} />
          <Route
            path="claim-summary-datewise"
            element={<ClaimSummaryDatewise />}
          />
          <Route path="claims-report" element={<ClaimsReport />} />
        </Routes>
      </div>
    </div>
  );
};

export default ReportsRoute;
