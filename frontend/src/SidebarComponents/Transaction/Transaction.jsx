import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { PiNotePencilFill } from "react-icons/pi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Transaction = ({ user }) => {
  const [openTransaction, setOpenTransaction] = useState(false);

  const isAdmin = user.role === "admin";
  const istransactionActive = location.pathname.startsWith("/transaction");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Transaction Main Button */}
          <div
            onClick={() => setOpenTransaction(!openTransaction)}
            className={`flex flex-col justify-center items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              istransactionActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <span>Transaction</span>
              {/* {openTransaction ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )} */}
            </div>
          </div>

          {/* Sub Menu */}
          {openTransaction && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
              <NavLink
                to="/transaction/monitoring"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Monitoring
              </NavLink>

              <NavLink
                to="/transaction/shift-planner"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Shift Planner
              </NavLink>

              <NavLink
                to="/transaction/shift-upload"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Shift Upload
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Transaction;
