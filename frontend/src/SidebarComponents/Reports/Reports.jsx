import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineStorage,
} from "react-icons/md";

const Reports = ({ user }) => {
  const [openReports, setOpenReports] = useState(false);
  const [openMannualReports, setOpenMannualReports] = useState(false);
  const [openAttendanceReports, setOpenAttendanceReports] = useState(false);
  const [openAbsenceReports, setOpenAbsenceReports] = useState(false);
  const [openEarlyLateReports, setOpenEarlyLateReports] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  const isAdmin = user.role === "admin";
  const isreportsActive = location.pathname.startsWith("/reports");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-violet-300 p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Reports Main Button */}
          <div
            onClick={() => setOpenReports(!openReports)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isreportsActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px]">
              <MdOutlineStorage />
              <span>Reports</span>
            </div>
            {openReports ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openReports && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
              <NavLink
                to="/reports/employee-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Employee Report
              </NavLink>

              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenMannualReports(!openMannualReports)}
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Mannual Reports</span>
                  {openMannualReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openMannualReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/mannual-entry-status"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Mannual Entry Status
                    </NavLink>

                    <NavLink
                      to="/reports/mannual-entry-report"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Mannual Entry Report
                    </NavLink>

                    <NavLink
                      to="/reports/mannual-entry-summary"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Mannual Entry Summary
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/reports/all-transaction-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                All Transaction Report
              </NavLink>

              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() =>
                    setOpenAttendanceReports(!openAttendanceReports)
                  }
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Attendance Reports</span>
                  {openAttendanceReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openAttendanceReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/attendance-by-employee"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Attendance By Employee
                    </NavLink>
                    <NavLink
                      to="/reports/attendance-by-location"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Attendance By Location
                    </NavLink>

                    <NavLink
                      to="/reports/attendance-summary"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Attendance Summary
                    </NavLink>

                    <NavLink
                      to="/reports/attendance-summary-location"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Attendance Summary Location
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/reports/exception-reports"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Exception Reports
              </NavLink>

              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenAbsenceReports(!openAbsenceReports)}
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Absence Reports</span>
                  {openAbsenceReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openAbsenceReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/absence-report"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Absence Report
                    </NavLink>

                    <NavLink
                      to="/reports/absence-summary-report"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Absence Summary Report
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/reports/in-out-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                In out Report
              </NavLink>

              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenEarlyLateReports(!openEarlyLateReports)}
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Early Late Reports</span>
                  {openEarlyLateReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openEarlyLateReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/early-out-report"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Early Out Report
                    </NavLink>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  onClick={() => setOpenLeave(!openLeave)}
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Leave</span>
                  {openLeave ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </div>

                {openLeave && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/leave-montly-summary"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Leave Monthly Summary
                    </NavLink>

                    <NavLink
                      to="/reports/leave-summary-datewise"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Leave Summary Datewise
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/reports/wft-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                WFH Report
              </NavLink>

              <NavLink
                to="/reports/claims-report"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Claims Report
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Reports;
