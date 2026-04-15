import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import GeofencingMaster from "./GeofencingMaster";
import EmployeeGeofencing from "./EmployeeGeofencing";

const GeofencingRoute = ({ user }) => {
  return (
    <div className="bg-[#0f172a]">
      <Navbar user={user} />
     <div className="lg:ml-64 pt-5 pb-12 px-4 md:px-5 lg:pl-6 rounded-t-3xl min-h-screen bg-gradient-to-r from-[#f1f6ff] via-[#e8eefa] to-[#f1f6ff]">
        <Routes>
          <Route path="geofencing-master" element={<GeofencingMaster />} />
          <Route path="employee-geofencing" element={<EmployeeGeofencing />} />
        </Routes>
      </div>
    </div>
  );
};

export default GeofencingRoute;
