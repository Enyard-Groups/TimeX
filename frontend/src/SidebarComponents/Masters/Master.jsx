import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiContactsFill } from "react-icons/ri";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Master = ({ user }) => {
  const [openMasters, setOpenMasters] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openHoliday, setOpenHoliday] = useState(false);
  const isAdmin = user.role === "admin";
  const ismastersActive = location.pathname.startsWith("/masters");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Masters Main Button */}
          <div
            onClick={() => setOpenMasters(!openMasters)}
            className={`flex flex-col items-center justify-center cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              ismastersActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 mt-2 font-medium text-lg">
              <span>Masters</span>
              {/* {openMasters ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )} */}
            </div>
          </div>

          {/* Sub Menu */}
          {openMasters && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">

              <NavLink
                to="/masters/companies"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Companies
              </NavLink>
              <NavLink
                to="/masters/department"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Department
              </NavLink>

              <NavLink
                to="/masters/designation"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Designation
              </NavLink>

              <NavLink
                to="/masters/shift"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Shift
              </NavLink>

              {/* EMPLOYEE DROPDOWN */}
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenEmployee(!openEmployee)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>Employee</span>
                  {openEmployee ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openEmployee && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/masters/employee-master"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Employee Master
                    </NavLink>
                    <NavLink
                      to="/masters/employee-category"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Employee Category
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/masters/user-master"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                User Master
              </NavLink>

              <NavLink
                to="/masters/issue-type"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Issue Type
              </NavLink>

              {/* HOLIDAY DROPDOWN */}
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenHoliday(!openHoliday)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>Holiday</span>
                  {openHoliday ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openHoliday && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/masters/holiday-master"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Holiday Master
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/masters/claim-category"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Claim Category
              </NavLink>

              <NavLink
                to="/masters/leave"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Leave
              </NavLink>

              <NavLink
                to="/masters/performance-report"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Performance Report
              </NavLink>

              <NavLink
                to="/masters/performance-dashboard"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Performance Dashboard
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Master;
