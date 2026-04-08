import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { IoMdLocate } from "react-icons/io";

const Geofencing = ({ user }) => {
  const [openGeofencing, setOpenGeofencing] = useState(false);

  const isAdmin = user.role === "admin";
  const isgeofencingActive = location.pathname.startsWith("/geofencing");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Geofencing Main Button */}
          <div
            onClick={() => setOpenGeofencing(!openGeofencing)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              isgeofencingActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px] xl:text-[21px]">
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
            <div className="mt-3 flex flex-col pl-10 gap-2 text-md xl:text-[19px]">
              <NavLink
                to="/geofencing/geofencing-master"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Geofencing Master
              </NavLink>

              <NavLink
                to="/geofencing/employee-geofencing"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
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
