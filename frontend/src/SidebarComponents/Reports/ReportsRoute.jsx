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
import EmployeeWeeklyReport from "./AttendanceReports/EmployeeWeeklyReport";
import AbsenceReport from "./AbsenceReports/AbsenceReport";
import AbsenceSummaryReport from "./AbsenceReports/AbsenceSummaryReport";
import EarlyOutReport from "./EarlyOutReport/EarlyOutReport";
import LeaveMonthlySummary from "./LeaveReports/LeaveMonthlySummary";
import LeaveSummaryDatewise from "./LeaveReports/LeaveSummaryDatewise";

const ReportsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="employee-report" element={<div>EmployeeReport</div>} />
          <Route path="mannual-entry-status" element={<MannualEntryStatus />} />
          <Route path="mannual-entry-report" element={<MannualEntryReport />} />
          <Route
            path="mannual-entry-summary"
            element={<MannualEntrySummary />}
          />
          <Route
            path="all-transaction-report"
            element={<div>AllTransactionReport</div>}
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
          <Route
            path="employee-weekly-report"
            element={<EmployeeWeeklyReport />}
          />

          <Route path="exception-reports" element={<div>ExceptionReports</div>} />

          <Route
            path="absence-report"
            element={<AbsenceReport />}
          />
          <Route
            path="absence-summary-report"
            element={<AbsenceSummaryReport />}
          />

          <Route path="in-out-report" element={<div>InOutReport</div>} />

          <Route
            path="early-out-report"
            element={<EarlyOutReport />}
          />
          <Route
            path="leave-montly-summary"
            element={<LeaveMonthlySummary />}
          />
          <Route path="leave-summary-datewise" element={<LeaveSummaryDatewise />} />

          <Route path="wft-report" element={<div>WftReport</div>} />
          <Route
            path="claim-summary-datewise"
            element={<div>ClaimSummaryDatewise</div>}
          />
          <Route
            path="claims-report"
            element={<div>ClaimsReport</div>}
          />
        </Routes>
      </div>
    </div>
  );
};

export default ReportsRoute;
