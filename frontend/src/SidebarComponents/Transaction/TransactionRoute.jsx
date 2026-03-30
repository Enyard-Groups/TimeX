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
      <div className="lg:ml-60 py-12 px-4 md:px-5 lg:pl-10 min-h-screen">
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
