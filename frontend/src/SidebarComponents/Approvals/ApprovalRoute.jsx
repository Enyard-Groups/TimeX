import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ManualEntryApproval from "./MannualEntryApproval";
import LeaveRequestApproval from "./LeaveRequestApproval";
import BusinessTravelApproval from "./BusinessTravelApproval";
import WfhApproval from "./WfhApproval";
import ClaimApproval from "./ClaimApproval";

const ApprovalRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-60 pt-8 pb-12 px-4 md:px-5 lg:pl-10 min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
        <Routes>
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
