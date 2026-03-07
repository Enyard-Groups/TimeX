import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
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
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isApprovalsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <FaCheckCircle />
              <span>Approvals</span>
              {openApprovals ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {openApprovals && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-lg space-y-2">
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
                to="/approvals/wft-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                WFT Approval
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
