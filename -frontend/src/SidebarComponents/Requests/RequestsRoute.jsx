import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";

const RequestsRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-60 mt-20 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="mannual-entry-req" element={<div>ManualEntryRequest</div>} />
          <Route path="leave-req" element={<div>LeaveRequest</div>} />
          <Route path="claim-req" element={<div>ClaimRequest</div>} />
          <Route path="business-travel-req" element={<div>BusinessTravelRequest</div>} />
          <Route path="leave-summary" element={<div>LeaveSummary</div>} />
          <Route path="wft-req" element={<div>WftRequest</div>} />
          <Route path="wft-summary" element={<div>WftSummary</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default RequestsRoute;
