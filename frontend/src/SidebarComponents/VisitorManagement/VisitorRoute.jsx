import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import VisitorBooking from "./VisitorBooking";
import CardDetach from "./CardDetach";

const VisitorRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-50 mt-16 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="visitor-booking" element={<VisitorBooking/>} />
          <Route path="card-detach" element={<CardDetach/>} />
        </Routes>
      </div>
    </div>
  );
};

export default VisitorRoute;
