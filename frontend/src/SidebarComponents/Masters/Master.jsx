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
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  // const hoverClass = "hover:text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Masters Main Button */}
          <div
            onClick={() => setOpenMasters(!openMasters)}
            className={`flex justify-between items-center cursor-pointer text-md p-2 pl-4 hover:bg-gray-200 rounded-xl ${
              ismastersActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px]">
              <RiContactsFill />
              <span>Masters</span>
            </div>
            {openMasters ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>
          {/* Sub Menu */}
          {openMasters && (
            <div className="mt-2 flex flex-col pl-10 gap-2 text-md">
              <NavLink
                to="/masters/companies"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Companies
              </NavLink>
              <NavLink
                to="/masters/department"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Department
              </NavLink>

              <NavLink
                to="/masters/designation"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Designation
              </NavLink>

              <NavLink
                to="/masters/shift"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Shift
              </NavLink>

              {/* EMPLOYEE DROPDOWN */}
              <div className="flex flex-col  cursor-pointer">
                <div
                  onClick={() => setOpenEmployee(!openEmployee)}
                  className={`${hoverClass} flex justify-between items-center cursor-pointer`}
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
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Employee Master
                    </NavLink>
                    <NavLink
                      to="/masters/employee-category"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
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
                  isActive ? activeClass : hoverClass
                }
              >
                User Master
              </NavLink>

              <NavLink
                to="/masters/issue-type"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Issue Type
              </NavLink>

              {/* HOLIDAY DROPDOWN */}
              <div className="flex flex-col cursor-pointer">
                <div
                  onClick={() => setOpenHoliday(!openHoliday)}
                  className={`${hoverClass} flex justify-between items-center cursor-pointer`}
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
                        isActive ? activeClass : hoverClass
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
                  isActive ? activeClass : hoverClass
                }
              >
                Claim Category
              </NavLink>

              <NavLink
                to="/masters/leave"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Leave
              </NavLink>

              <NavLink
                to="/masters/performance-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Performance Report
              </NavLink>

              <NavLink
                to="/masters/performance-dashboard"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
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
