import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Requests = ({ user }) => {
  const [openRequests, setOpenRequests] = useState(false);

  const isAdmin = user.role === "admin";
  const isrequestsActive = location.pathname.startsWith("/requests");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Requests Main Button */}
          <div
            onClick={() => setOpenRequests(!openRequests)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              isrequestsActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px] xl:text-[21px]">
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
            <div className="mt-2 flex flex-col pl-10 gap-2 text-md xl:text-[19px]">
              <NavLink
                to="/requests/mannual-entry-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Mannual Entry Request
              </NavLink>

              <NavLink
                to="/requests/leave-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Leave Request
              </NavLink>

              <NavLink
                to="/requests/claim-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Claim Request
              </NavLink>

              <NavLink
                to="/requests/business-travel-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Business Travel Request
              </NavLink>

              <NavLink
                to="/requests/leave-summary"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Leave Summary
              </NavLink>

              <NavLink
                to="/requests/wfh-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                WFH Request
              </NavLink>

              <NavLink
                to="/requests/wfh-summary"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                WFH Summary
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Requests;
