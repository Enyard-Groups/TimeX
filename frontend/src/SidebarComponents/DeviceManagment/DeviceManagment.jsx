import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const DeviceManagement = ({ user }) => {
  const [opendevicemanagements, setOpendevicemanagements] = useState(false);
  const isAdmin = user.role === "admin";
  const isdevicemanagementsActive =
    location.pathname.startsWith("/devicemanagements");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* devicemanagements Main Button */}
          <div
            onClick={() => setOpendevicemanagements(!opendevicemanagements)}
            className={`flex flex-col justify-center items-center cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isdevicemanagementsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <span className="whitespace-nowrap">Device Management</span>
              {/* {opendevicemanagements ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )} */}
            </div>
          </div>

          {/* Sub Menu */}
          {opendevicemanagements && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
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
