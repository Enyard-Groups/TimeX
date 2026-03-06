import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PiNotePencilFill } from "react-icons/pi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";


const Transaction = ({ user }) => {
  const [openTransaction, setOpenTransaction] = useState(false);

  const isAdmin = user.role === "admin";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Transaction Main Button */}
          <div
            onClick={() => setOpenTransaction(!openTransaction)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <PiNotePencilFill />
              <span>TRANSACTION</span>
              {openTransaction ? (
                      <MdKeyboardArrowUp className='text-xl'/>
                    ) : (
                      <MdKeyboardArrowDown className='text-xl'/>
                    )}
            </div>
          </div>

          {/* Sub Menu */}
          {openTransaction && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/transaction/monitoring"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                MONITORING
              </Link>

              <Link
                to="/transaction/shift-planner"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                SHIFT PLANNER
              </Link>

              <Link
                to="/transaction/shift-upload"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                SHIFT UPLOAD
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Transaction;