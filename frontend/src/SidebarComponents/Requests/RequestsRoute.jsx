import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ManualEntryRequest from "./ManualEntryRequest";
import LeaveRequest from "./LeaveRequest";
import ClaimRequest from "./ClaimRequest";
import BusinessTravelRequest from "./BusinessTravelRequest";
import LeaveSummary from "./LeaveSummary";
import WfhRequest from "./WfhRequest";
import WfhSummary from "./WfhSummary";

const RequestsRoute = ({ user }) => {
  return (
    <div className="bg-[#0f172a]">
      <Navbar user={user} />
      <div className="lg:ml-64 pt-5 pb-12 px-4 md:px-5 lg:pl-6 rounded-t-3xl min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
        <Routes>
          <Route
            path="mannual-entry-req"
            element={<ManualEntryRequest user={user} />}
          />
          <Route path="leave-req" element={<LeaveRequest user={user} />} />
          <Route path="claim-req" element={<ClaimRequest user={user} />} />
          <Route
            path="business-travel-req"
            element={<BusinessTravelRequest user={user} />}
          />
          <Route path="leave-summary" element={<LeaveSummary user={user} />} />
          <Route path="wfh-req" element={<WfhRequest user={user} />} />
          <Route path="wfh-summary" element={<WfhSummary user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default RequestsRoute;
