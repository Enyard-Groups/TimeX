import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Approvals = ({ user }) => {
  const [openApprovals, setOpenApprovals] = useState(false);

  const isAdmin = user.role === "admin";
  const isApprovalsActive = location.pathname.startsWith("/approvals");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Approvals Main Button */}
          <div
            onClick={() => setOpenApprovals(!openApprovals)}
            className={`flex flex-col items-center justify-center cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isApprovalsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <span>Approvals</span>

              {/* {openApprovals ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )} */}
            </div>
          </div>

          {/* Sub Menu */}
          {openApprovals && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
              <NavLink
                to="/approvals/mannual-entry-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Mannual Entry Approval
              </NavLink>

              <NavLink
                to="/approvals/leave-req-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Leave Request Approval
              </NavLink>

              <NavLink
                to="/approvals/bussiness-travel-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Business Travel Approval
              </NavLink>

              <NavLink
                to="/approvals/wfh-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                WFH Approval
              </NavLink>

              <NavLink
                to="/approvals/claim-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
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
