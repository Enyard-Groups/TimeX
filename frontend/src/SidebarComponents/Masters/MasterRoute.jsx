import React from "react";
import { Route, Routes } from "react-router-dom";
import EmployeeMaster from "./Employee/EmployeeMaster";
import EmployeeCategory from "./Employee/EmployeeCategory";
import HolidayMaster from "./Holiday/HolidayMaster";
import Navbar from "../../components/Navbar";
import Department from "./Department";
import Designation from "./Designation";
import Shift from "./Shift";
import UserMaster from "./UserMaster";
import ClaimCategory from "./ClaimCategory";
import IssueType from "./IssueType";
import Leave from "./Leave";
import Performance from "./Performance";
import PerformanceDashboard from "./PerformanceDashboard";
import Companies from "./Companies";

const MasterRoute = ({ user }) => {
  return (
    <div className="bg-[#0f172a]">
      <Navbar user={user} />
      <div className="lg:ml-64 pt-5 pb-12 px-4 md:px-5 lg:pl-6 rounded-t-3xl min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
        <Routes>
          <Route path="companies" element={<Companies />} />
          <Route path="department" element={<Department />} />
          <Route path="designation" element={<Designation />} />
          <Route path="shift" element={<Shift />} />
          <Route path="employee-master" element={<EmployeeMaster />} />
          <Route path="employee-category" element={<EmployeeCategory />} />
          <Route path="holiday-master" element={<HolidayMaster />} />
          <Route path="user-master" element={<UserMaster />} />
          <Route path="claim-category" element={<ClaimCategory />} />
          <Route path="issue-type" element={<IssueType />} />
          <Route path="leave" element={<Leave />} />
          <Route path="performance-report" element={<Performance />} />
          <Route
            path="performance-dashboard"
            element={<PerformanceDashboard />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default MasterRoute;
