import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DeviceManagement from "./DeviceCommunication";
import DeviceCommunication from "./DeviceCommunication";
import DeviceManagmentSub from "./DeviceManagmentSub";
import LocationGroup from "./LocationGroup";
import DeviceModel from "./DeviceModel";

const DeviceRoute = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <div className="lg:ml-56 mt-6 p-6 md:p-10 min-h-screen">
        <Routes>
          <Route path="location-group" element={<LocationGroup />} />
          <Route
            path="device-communication"
            element={<DeviceCommunication />}
          />

          <Route path="device-management" element={<DeviceManagmentSub />} />
          <Route path="device-model" element={<DeviceModel />} />
        </Routes>
      </div>
    </div>
  );
};

export default DeviceRoute;
