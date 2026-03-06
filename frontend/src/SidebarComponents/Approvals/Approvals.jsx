import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Approvals = ({ user }) => {
  const [openApprovals, setOpenApprovals] = useState(false);

  const isAdmin = user.role === "admin";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Approvals Main Button */}
          <div
            onClick={() => setOpenApprovals(!openApprovals)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <FaCheckCircle />
              <span>APPROVALS</span>
              {openApprovals ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {openApprovals && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/approvals/mannual-entry-approval"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                MANUAL ENTRY APPROVAL
              </Link>

              <Link
                to="/approvals/leave-req-approval"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LEAVE REQUEST APPROVAL
              </Link>

              <Link
                to="/approvals/bussiness-travel-approval"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                BUSINESS TRAVEL APPROVAL
              </Link>

              <Link
                to="/approvals/wft-approval"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                WFT APPROVAL
              </Link>

              <Link
                to="/approvals/claim-approval"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CLAIM APPROVAL
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Approvals;
