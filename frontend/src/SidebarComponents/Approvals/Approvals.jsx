import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

const Approvals = ({ user }) => {
  const [openApprovals, setOpenApprovals] = useState(false);
  const [openFormsApprovals, setOpenFormsApprovals] = useState(false);

  const isAdmin = user.role === "admin";
  const isApprovalsActive = location.pathname.startsWith("/approvals");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Approvals Main Button */}
          <div
            onClick={() => setOpenApprovals(!openApprovals)}
            className={`flex  items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              isApprovalsActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[16px]">
              <FaCheckCircle />
              <span>Approvals</span>
            </div>
            {openApprovals ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openApprovals && (
            <div className="mt-2 flex flex-col pl-10 gap-2 text-[15px]">
              <div className="flex flex-col  cursor-pointer">
                <div
                  onClick={() => setOpenFormsApprovals(!openFormsApprovals)}
                  className={`flex justify-between items-center cursor-pointer ${hoverClass}`}
                >
                  <span>Forms Approval</span>
                  {openFormsApprovals ? (
                    <MdKeyboardArrowUp />
                  ) : (
                    <MdKeyboardArrowDown />
                  )}
                </div>

                {openFormsApprovals && (
                  <div className="ml-4 mt-2 flex flex-col gap-2">
                    <NavLink
                      to="/approvals/monthly-fire-safety-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Monthly Fire Safety Approval
                    </NavLink>

                    <NavLink
                      to="/approvals/incident-accident-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                      Incident / Accident Approval
                    </NavLink>

                    <NavLink
                      to="/approvals/leave-application-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                    >
                     Leave Application Approval
                    </NavLink>

                     <NavLink
                      to="/approvals/opt-out-request-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Opt Out Request Approval
                    </NavLink>

                     <NavLink
                      to="/approvals/passport-request-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Passport Request Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/shift-hand-over-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Shift Hand Over Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/staff-training-checklist-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Staff Training Checklist Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/tpc-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        TPC Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/weekly-overtime-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Weekly Overtime Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/patrolling-checklist-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Patrolling Checklist Approval
                    </NavLink>
                     <NavLink
                      to="/approvals/facility-complaint-form-approval"
                      className={({ isActive }) =>
                        isActive ? activeClass : hoverClass
                      }
                      >
                        Facility Complaint Form Approval
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/approvals/mannual-entry-approval"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Mannual Entry Approval
              </NavLink>

              <NavLink
                to="/approvals/leave-req-approval"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Leave Request Approval
              </NavLink>

              <NavLink
                to="/approvals/bussiness-travel-approval"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Business Travel Approval
              </NavLink>

              <NavLink
                to="/approvals/wfh-approval"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                WFH Approval
              </NavLink>

              <NavLink
                to="/approvals/claim-approval"
                className={({ isActive }) =>
                  isActive ? activeClass : hoverClass
                }
              >
                Claim Approval
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Approvals;
