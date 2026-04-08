import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

const Approvals = ({ user }) => {
  const [openApprovals, setOpenApprovals] = useState(false);

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
            <div className="flex items-center gap-4 text-[18px] xl:text-[21px]">
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
            <div className="mt-2 flex flex-col pl-10 gap-2 text-md xl:text-[19px]">
              <NavLink
                to="/approvals/mannual-entry-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Mannual Entry Approval
              </NavLink>

              <NavLink
                to="/approvals/leave-req-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Leave Request Approval
              </NavLink>

              <NavLink
                to="/approvals/bussiness-travel-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Business Travel Approval
              </NavLink>

              <NavLink
                to="/approvals/wfh-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                WFH Approval
              </NavLink>

              <NavLink
                to="/approvals/claim-approval"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
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
