import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ManualEntryApproval from "./MannualEntryApproval";
import LeaveRequestApproval from "./LeaveRequestApproval";
import BusinessTravelApproval from "./BusinessTravelApproval";
import WftApproval from "./WftApproval";
import ClaimApproval from "./ClaimApproval";

const ApprovalRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-60 mt-20 p-6 md:p-10 min-h-screen">
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
          <Route path="wft-approval" element={<WftApproval />} />
          <Route path="claim-approval" element={<ClaimApproval />} />
        </Routes>
      </div>
    </div>
  );
};

export default ApprovalRoute;
