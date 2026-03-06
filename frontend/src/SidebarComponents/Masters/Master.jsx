import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiContactsFill } from "react-icons/ri";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Master = ({ user }) => {
  const [openMasters, setOpenMasters] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openHoliday, setOpenHoliday] = useState(false);
  const isAdmin = user.role === "admin";
  return (
    <>
      {isAdmin && (
        <div>
          {/* Masters Main Button */}
          <div
            onClick={() => setOpenMasters(!openMasters)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <RiContactsFill />
              <span>MASTERS</span>
              {openMasters ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {openMasters && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/masters/department"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                DEPARTMENT
              </Link>

              <Link
                to="/masters/designation"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
               DESIGNATION
              </Link>

              <Link
                to="/masters/shift"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                SHIFT NAME
              </Link>

              {/* EMPLOYEE DROPDOWN */}
              <div>
                <div
                  onClick={() => setOpenEmployee(!openEmployee)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>EMPLOYEE</span>
                  {openEmployee ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openEmployee && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/masters/employee-master"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      EMPLOYEE MASTER
                    </Link>
                    <Link
                      to="/masters/employee-category"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      EMPLOYEE CATEGORY
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/masters/user-master"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                USER MASTER
              </Link>

              <Link
                to="/masters/issue-type"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                ISSUE TYPE
              </Link>

              {/* HOLIDAY DROPDOWN */}
              <div>
                <div
                  onClick={() => setOpenHoliday(!openHoliday)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>HOLIDAY</span>
                  {openHoliday ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openHoliday && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/masters/holiday-master"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      HOLIDAY MASTER
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/masters/claim-category"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CLAIM CATEGORY
              </Link>

              <Link
                to="/masters/leave"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LEAVE
              </Link>

              <Link
                to="/masters/performance-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                PERFORMANCE REPORT
              </Link>

              <Link
                to="/masters/performance-dashboard"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                PERFORMANCE DASHBOARD
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Master;
