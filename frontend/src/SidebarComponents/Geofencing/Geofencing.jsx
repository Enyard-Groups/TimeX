import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoMdLocate } from "react-icons/io";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Geofencing = ({ user }) => {
  const [openGeofencing, setOpenGeofencing] = useState(false);

  const isAdmin = user.role === "admin";
  const isgeofencingActive = location.pathname.startsWith("/geofencing");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Geofencing Main Button */}
          <div
            onClick={() => setOpenGeofencing(!openGeofencing)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isgeofencingActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <IoMdLocate />
              <span>Geofencing</span>
            </div>
            {openGeofencing ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openGeofencing && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-lg space-y-2">
              <NavLink
                to="/geofencing/geofencing-master"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Geofencing Master
              </NavLink>

              <NavLink
                to="/geofencing/employee-geofencing"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Employee Geofencing
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Geofencing;
