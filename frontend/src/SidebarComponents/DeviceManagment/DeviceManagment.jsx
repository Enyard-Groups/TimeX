import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TbDeviceDesktopFilled } from "react-icons/tb";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const DeviceManagement = ({ user }) => {
  const [opendevicemanagements, setOpendevicemanagements] = useState(false);
  const isAdmin = user.role === "admin";
  return (
    <>
      {isAdmin && (
        <div>
          {/* devicemanagements Main Button */}
          <div
            onClick={() => setOpendevicemanagements(!opendevicemanagements)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <TbDeviceDesktopFilled />
              <span>DEVICE MANAGEMENT</span>
              {opendevicemanagements ? (
                <MdKeyboardArrowUp className="text-2xl" />
              ) : (
                <MdKeyboardArrowDown className="text-2xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {opendevicemanagements && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/devicemanagements/location-group"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LOCATION GROUP
              </Link>

              <Link
                to="/devicemanagements/device-communication"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                DEVICE COMMUNICATION
              </Link>

              <Link
                to="/devicemanagements/device-management"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                DEVICE MANAGEMENT
              </Link>

              <Link
                to="/devicemanagements/device-model"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                DEVICE MODEL
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DeviceManagement;
