import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Requests = ({ user }) => {
  const [openRequests, setOpenRequests] = useState(false);

  const isAdmin = user.role === "admin";
  const isrequestsActive = location.pathname.startsWith("/requests");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Requests Main Button */}
          <div
            onClick={() => setOpenRequests(!openRequests)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isrequestsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <IoInformationCircle />
              <span>Requests</span>
            </div>
            {openRequests ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openRequests && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-lg space-y-2">
              <NavLink
                to="/requests/mannual-entry-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Mannual Entry Request
              </NavLink>

              <NavLink
                to="/requests/leave-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Leave Request
              </NavLink>

              <NavLink
                to="/requests/claim-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Claim Request
              </NavLink>

              <NavLink
                to="/requests/business-travel-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Business Travel Request
              </NavLink>

              <NavLink
                to="/requests/leave-summary"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Leave Summary
              </NavLink>

              <NavLink
                to="/requests/wft-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                WFT Request
              </NavLink>

              <NavLink
                to="/requests/wft-summary"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                WFT Summary
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Requests;
