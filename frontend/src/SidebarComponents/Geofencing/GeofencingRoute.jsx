import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import GeofencingMaster from "./GeofencingMaster";
import EmployeeGeofencing from "./EmployeeGeofencing";

const GeofencingRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-56 mt-6 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="geofencing-master" element={<GeofencingMaster />} />
          <Route path="employee-geofencing" element={<EmployeeGeofencing />} />
        </Routes>
      </div>
    </div>
  );
};

export default GeofencingRoute;
