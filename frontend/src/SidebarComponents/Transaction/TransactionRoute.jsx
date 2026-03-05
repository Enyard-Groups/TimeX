import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";

const TransactionRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-60 mt-20 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="monitoring" element={<div>Monitoring</div>} />
          <Route path="shift-planner" element={<div>ShiftPlanner</div>} />
          <Route path="shift-upload" element={<div>ShiftUpload</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default TransactionRoute;
