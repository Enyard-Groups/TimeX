import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaVimeoV } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";


const Visitor = ({ user }) => {
  const [openVisitor, setOpenVisitor] = useState(false);

  const isAdmin = user.role === "admin"; 
  return (
    <>
      {isAdmin && (
        <div>
          {/* Visitor Main Button */}
          <div
            onClick={() => setOpenVisitor(!openVisitor)}
            className="flex items-center justify-between cursor-pointer text-sm p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <FaVimeoV />
              <span>VISITOR</span>
              {openVisitor ? (
                      <MdKeyboardArrowUp className='text-xl'/>
                    ) : (
                      <MdKeyboardArrowDown className='text-xl'/>
                    )}
            </div>
          </div>

          {/* Sub Menu */}
          {openVisitor && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-sm space-y-2">
              <Link
                to="/visitor/visitor-booking"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                VISITOR BOOKING
              </Link>

              <Link
                to="/visitor/card-detach"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                CARD DETACH
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Visitor;