import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaVimeoV } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Visitor = ({ user }) => {
  const [openVisitor, setOpenVisitor] = useState(false);

  const isAdmin = user.role === "admin";
  const isvisitorActive = location.pathname.startsWith("/visitor");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-violet-300 p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Visitor Main Button */}
          <div
            onClick={() => setOpenVisitor(!openVisitor)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isvisitorActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px]">
              <FaVimeoV />
              <span>Visitor</span>
            </div>
            {openVisitor ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openVisitor && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
              <NavLink
                to="/visitor/visitor-booking"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Visitor Booking
              </NavLink>

              <NavLink
                to="/visitor/card-detach"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Card Detach
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Visitor;
