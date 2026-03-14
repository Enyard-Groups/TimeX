import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdOutlineStorage } from "react-icons/md";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Reports = ({ user }) => {
  const [openReports, setOpenReports] = useState(false);
  const [openMannualReports, setOpenMannualReports] = useState(false);
  const [openAttendanceReports, setOpenAttendanceReports] = useState(false);
  const [openAbsenceReports, setOpenAbsenceReports] = useState(false);
  const [openEarlyLateReports, setOpenEarlyLateReports] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  const isAdmin = user.role === "admin";
  const isreportsActive = location.pathname.startsWith("/reports");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Reports Main Button */}
          <div
            onClick={() => setOpenReports(!openReports)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isreportsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
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
            <div className="ml-6 mt-2 flex flex-col gap-2 text-lg space-y-2">
              <NavLink
                to="/reports/employee-report"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Employee Report
              </NavLink>

              <div>
                <div
                  onClick={() => setOpenMannualReports(!openMannualReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
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
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Mannual Entry Status
                    </NavLink>

                    <NavLink
                      to="/reports/mannual-entry-report"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Mannual Entry Report
                    </NavLink>

                    <NavLink
                      to="/reports/mannual-entry-summary"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
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
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                All Transaction Report
              </NavLink>

              <div>
                <div
                  onClick={() =>
                    setOpenAttendanceReports(!openAttendanceReports)
                  }
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
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
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Attendance By Employee
                    </NavLink>
                    <NavLink
                      to="/reports/attendance-by-location"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Attendance By Location
                    </NavLink>

                    <NavLink
                      to="/reports/attendance-summary"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Attendance Summary
                    </NavLink>

                    <NavLink
                      to="/reports/attendance-summary-location"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Attendance Summary Location
                    </NavLink>

                    <NavLink
                      to="/reports/employee-weekly-report"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Employee Weekly Report
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/reports/exception-reports"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Exception Reports
              </NavLink>

              <div>
                <div
                  onClick={() => setOpenAbsenceReports(!openAbsenceReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
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
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Absence Report
                    </NavLink>

                    <NavLink
                      to="/reports/absence-summary-report"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
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
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                In out Report
              </NavLink>

              <div>
                <div
                  onClick={() => setOpenEarlyLateReports(!openEarlyLateReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
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
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Early Out Report
                    </NavLink>
                  </div>
                )}
              </div>

              <div>
                <div
                  onClick={() => setOpenLeave(!openLeave)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>Leave</span>
                  {openLeave ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </div>

                {openLeave && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/reports/leave-montly-summary"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
                      }
                    >
                      Leave Monthly Summary
                    </NavLink>

                    <NavLink
                      to="/reports/leave-summary-datewise"
                      className={({ isActive }) =>
                        isActive
                          ? activeClass
                          : "hover:text-[oklch(0.645_0.246_16.439)]"
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
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                WFH Report
              </NavLink>

              <NavLink
                to="/reports/claim-summary-datewise"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Claim Summary Datewise
              </NavLink>

              <NavLink
                to="/reports/claims-report"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
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
