import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Requests = ({ user }) => {
  const [openRequests, setOpenRequests] = useState(false);

  const isAdmin = user.role === "admin";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Requests Main Button */}
          <div
            onClick={() => setOpenRequests(!openRequests)}
            className="flex items-center justify-between cursor-pointer text-sm p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <IoInformationCircle />
              <span>REQUESTS</span>
              {openRequests ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {openRequests && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-sm space-y-2">
              <Link
                to="/requests/mannual-entry-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                MANUAL ENTRY REQUEST
              </Link>

              <Link
                to="/requests/leave-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LEAVE REQUEST
              </Link>

              <Link
                to="/requests/claim-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CLAIM REQUEST
              </Link>

              <Link
                to="/requests/business-travel-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                BUSINESS TRAVEL REQUEST
              </Link>

              <Link
                to="/requests/leave-summary"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LEAVE SUMMARY
              </Link>

              <Link
                to="/requests/wft-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                WFT REQUEST
              </Link>

              <Link
                to="/requests/wft-summary"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                WFT SUMMARY
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Requests;
