import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  return (
    <>
      {isAdmin && (
        <div>
          {/* Reports Main Button */}
          <div
            onClick={() => setOpenReports(!openReports)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <MdOutlineStorage/>
              <span>REPORTS</span>
              {openReports ? (
                      <MdKeyboardArrowUp className='text-xl'/>
                    ) : (
                      <MdKeyboardArrowDown className='text-xl'/>
                    )}
            </div>
          </div>

          {/* Sub Menu */}
          {openReports && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/reports/employee-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                EMPLOYEE REPORT
              </Link>

              <div>
                <div
                  onClick={() => setOpenMannualReports(!openMannualReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>MANUAL REPORTS</span>
                  {openMannualReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openMannualReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/reports/mannual-entry-status"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      MANUAL ENTRY STATUS
                    </Link>

                    <Link
                      to="/reports/mannual-entry-report"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      MANUAL ENTRY REPORT
                    </Link>

                    <Link
                      to="/reports/mannual-entry-summary"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      MANUAL ENTRY SUMMARY
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/reports/all-transaction-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                ALL TRANSACTION REPORT
              </Link>

              <div>
                <div
                  onClick={() =>
                    setOpenAttendanceReports(!openAttendanceReports)
                  }
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>ATTENDANCE REPORTS</span>
                  {openAttendanceReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openAttendanceReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/reports/attendance-by-employee"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ATTENDANCE BY EMPLOYEE
                    </Link>
                    <Link
                      to="/reports/attendance-by-location"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ATTENDANCE BY LOCATION
                    </Link>

                    <Link
                      to="/reports/attendance-summary"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ATTENDANCE SUMMARY
                    </Link>

                    <Link
                      to="/reports/attendance-summary-location"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ATTENDANCE SUMMARY LOCATION
                    </Link>

                    <Link
                      to="/reports/employee-weekly-report"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      EMPLOYEE WEEKLY REPORT
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/reports/exception-reports"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                EXCEPTION REPORTS
              </Link>

              <div>
                <div
                  onClick={() => setOpenAbsenceReports(!openAbsenceReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>ABSENCE REPORTS</span>
                  {openAbsenceReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openAbsenceReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/reports/absence-report"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ABSENCE REPORT
                    </Link>

                    <Link
                      to="/reports/absence-summary-report"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      ABSENCE SUMMARY REPORT
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/reports/in-out-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                IN OUT REPORT
              </Link>

              <div>
                <div
                  onClick={() => setOpenEarlyLateReports(!openEarlyLateReports)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>EARLY LATE REPORTS</span>
                  {openEarlyLateReports ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openEarlyLateReports && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/reports/early-out-report"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      EARLY OUT REPORT
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <div
                  onClick={() => setOpenLeave(!openLeave)}
                  className="flex justify-between items-center cursor-pointer hover:text-[oklch(0.645_0.246_16.439)]"
                >
                  <span>LEAVE</span>
                  {openLeave ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openLeave && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <Link
                      to="/reports/leave-montly-summary"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      LEAVE MONTHLY SUMMARY
                    </Link>

                    <Link
                      to="/reports/leave-summary-datewise"
                      className="hover:text-[oklch(0.645_0.246_16.439)]"
                    >
                      LEAVE SUMMARY DATEWISE
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/reports/wft-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                WFT REPORT
              </Link>

              <Link
                to="/reports/claim-summary-datewise"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CLAIM SUMMARY DATEWISE
              </Link>

              <Link
                to="/reports/claims-report"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CLAIMS REPORT
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Reports;
