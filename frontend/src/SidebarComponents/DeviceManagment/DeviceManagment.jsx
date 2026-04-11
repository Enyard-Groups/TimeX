import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { TbDeviceDesktopFilled } from "react-icons/tb";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const DeviceManagement = ({ user }) => {
  const [opendevicemanagements, setOpendevicemanagements] = useState(false);
  const isAdmin = user.role === "admin";
  const isdevicemanagementsActive =
    location.pathname.startsWith("/devicemanagements");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* devicemanagements Main Button */}
          <div
            onClick={() => setOpendevicemanagements(!opendevicemanagements)}
            className={`flex justify-between items-center cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              isdevicemanagementsActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[16px]">
              <TbDeviceDesktopFilled />
              <span>Device Management</span>
            </div>
            {opendevicemanagements ? (
              <MdKeyboardArrowUp className="text-2xl" />
            ) : (
              <MdKeyboardArrowDown className="text-2xl" />
            )}
          </div>

          {/* Sub Menu */}
          {opendevicemanagements && (
            <div className="mt-2 flex flex-col pl-10 gap-2 text-[15px]">
              <NavLink
                to="/devicemanagements/location-group"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Location Group
              </NavLink>

              <NavLink
                to="/devicemanagements/device-communication"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Device Communication
              </NavLink>

              <NavLink
                to="/devicemanagements/device-management"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Device Management
              </NavLink>

              <NavLink
                to="/devicemanagements/device-model"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
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
