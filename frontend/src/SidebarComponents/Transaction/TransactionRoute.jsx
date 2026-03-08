import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Monitoring from "./Monitoring";
import ShiftPlanner from "./ShiftPlanner";
import ShiftUpload from "./ShiftUpload";

const TransactionRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="shift-planner" element={<ShiftPlanner />} />
          <Route path="shift-upload" element={<ShiftUpload />} />
        </Routes>
      </div>
    </div>
  );
};

export default TransactionRoute;
