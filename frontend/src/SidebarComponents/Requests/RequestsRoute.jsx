import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ManualEntryRequest from "./ManualEntryRequest";
import LeaveRequest from "./LeaveRequest";
import ClaimRequest from "./ClaimRequest";
import BusinessTravelRequest from "./BusinessTravelRequest";
import LeaveSummary from "./LeaveSummary";
import WftRequest from "./WftRequest";
import WftSummary from "./WftSummary";

const RequestsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="mannual-entry-req" element={<ManualEntryRequest/>} />
          <Route path="leave-req" element={<LeaveRequest/>} />
          <Route path="claim-req" element={<ClaimRequest/>} />
          <Route path="business-travel-req" element={<BusinessTravelRequest/>} />
          <Route path="leave-summary" element={<LeaveSummary/>} />
          <Route path="wft-req" element={<WftRequest/>} />
          <Route path="wft-summary" element={<WftSummary/>} />
        </Routes>
      </div>
    </div>
  );
};

export default RequestsRoute;
