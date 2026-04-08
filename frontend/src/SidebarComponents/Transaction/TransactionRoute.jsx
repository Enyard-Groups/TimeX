import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Monitoring from "./Monitoring";
import ShiftPlanner from "./ShiftPlanner";
import ShiftUpload from "./ShiftUpload";

const TransactionRoute = ({ user }) => {
  return (
    <div className="bg-[#0f172a]">
      <Navbar user={user} />
      <div className="lg:ml-64 pt-8 pb-12 px-4 md:px-5 lg:pl-6 rounded-t-3xl min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
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
