import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { TbDeviceDesktopFilled } from "react-icons/tb";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const DeviceManagement = ({ user }) => {
  const [opendevicemanagements, setOpendevicemanagements] = useState(false);
  const isAdmin = user.role === "admin";
  const isdevicemanagementsActive = location.pathname.startsWith("/devicemanagements");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* devicemanagements Main Button */}
          <div
            onClick={() => setOpendevicemanagements(!opendevicemanagements)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isdevicemanagementsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <TbDeviceDesktopFilled />
              <span>Device Management</span>
              {opendevicemanagements ? (
                <MdKeyboardArrowUp className="text-2xl" />
              ) : (
                <MdKeyboardArrowDown className="text-2xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {opendevicemanagements && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-lg space-y-2">
              <NavLink
                to="/devicemanagements/location-group"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Location Group
              </NavLink>

              <NavLink
                to="/devicemanagements/device-communication"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Device Communication
              </NavLink>

              <NavLink
                to="/devicemanagements/device-management"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Device Management
              </NavLink>

              <NavLink
                to="/devicemanagements/device-model"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Device Model
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DeviceManagement;
