import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { PiNotePencilFill } from "react-icons/pi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Transaction = ({ user }) => {
  const [openTransaction, setOpenTransaction] = useState(false);

  const isAdmin = user.role === "admin";
  const istransactionActive = location.pathname.startsWith("/transaction");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Transaction Main Button */}
          <div
            onClick={() => setOpenTransaction(!openTransaction)}
            className={`flex justify-between items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              istransactionActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px] xl:text-[21px]">
              <PiNotePencilFill />
              <span>Transaction</span>
            </div>
            {openTransaction ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openTransaction && (
            <div className="mt-2 flex flex-col pl-10 gap-2 text-md xl:text-[19px]">
              <NavLink
                to="/transaction/monitoring"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Monitoring
              </NavLink>

              <NavLink
                to="/transaction/shift-planner"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Shift Planner
              </NavLink>

              <NavLink
                to="/transaction/shift-upload"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
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
