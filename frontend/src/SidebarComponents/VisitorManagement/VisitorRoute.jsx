import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import VisitorBooking from "./VisitorBooking";
import CardDetach from "./CardDetach";

const VisitorRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-56 mt-6 py-12 px-4 md:px-5 lg:pl-10 min-h-screen">
        <Routes>
          <Route path="visitor-booking" element={<VisitorBooking />} />
          <Route path="card-detach" element={<CardDetach />} />
        </Routes>
      </div>
    </div>
  );
};

export default VisitorRoute;
