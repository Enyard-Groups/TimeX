import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";

const GeofencingRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="md:ml-60 mt-20 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="geofencing-master" element={<div>GeofencingMaster</div>} />
          <Route path="employee-geofencing" element={<div>EmployeeGeofencing</div>} />
         
        </Routes>
      </div>
    </div>
  );
};

export default GeofencingRoute;
