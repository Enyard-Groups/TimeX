import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdLocate } from "react-icons/io";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";


const Geofencing = ({ user }) => {
  const [openGeofencing, setOpenGeofencing] = useState(false);

  const isAdmin = user.role === "admin"; 

  return (
    <>
      {isAdmin && (
        <div>
          {/* Geofencing Main Button */}
          <div
            onClick={() => setOpenGeofencing(!openGeofencing)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <IoMdLocate />
              <span>GEOFENCING</span>
              {openGeofencing ? (
                      <MdKeyboardArrowUp className='text-xl'/>
                    ) : (
                      <MdKeyboardArrowDown className='text-xl'/>
                    )}
            </div>
          </div>

          {/* Sub Menu */}
          {openGeofencing && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/geofencing/geofencing-master"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                GEOFENCING MASTER
              </Link>

              <Link
                to="/geofencing/employee-geofencing"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                EMPLOYEE GEOFENCING
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Geofencing;