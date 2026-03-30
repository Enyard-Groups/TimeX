import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import GeofencingMaster from "./GeofencingMaster";
import EmployeeGeofencing from "./EmployeeGeofencing";

const GeofencingRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-60 py-12 px-4 md:px-5 lg:pl-10 min-h-screen">
        <Routes>
          <Route path="geofencing-master" element={<GeofencingMaster />} />
          <Route path="employee-geofencing" element={<EmployeeGeofencing />} />
        </Routes>
      </div>
    </div>
  );
};

export default GeofencingRoute;
