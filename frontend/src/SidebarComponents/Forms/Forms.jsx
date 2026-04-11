import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LuClipboardList } from "react-icons/lu";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Forms = ({ user }) => {
  const [openForms, setOpenForms] = useState(false);

  const isAdmin = user.role === "admin";
  const isformsActive = location.pathname.startsWith("/forms");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass =
    "text-white hover:text-black hover:bg-gray-100 rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Forms Main Button */}
          <div
            onClick={() => setOpenForms(!openForms)}
            className={`flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded pl-4 ${
              isformsActive ? activeClass : hoverClass
            }`}
          >
            <div className="flex items-center gap-4 text-[18px] ">
              <LuClipboardList />
              <span>Forms</span>
            </div>
            {openForms ? (
              <MdKeyboardArrowUp className="text-xl" />
            ) : (
              <MdKeyboardArrowDown className="text-xl" />
            )}
          </div>

          {/* Sub Menu */}
          {openForms && (
            <div className="mt-2 flex flex-col pl-10 gap-2 text-md">
              <NavLink
                to="/forms/monthly-fire-safety-inspections"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Monthly Fire Safety Inspections
              </NavLink>

              <NavLink
                to="/forms/incident-accident"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Incident / Accident
              </NavLink>

              <NavLink
                to="/forms/leave-application"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Leave Application
              </NavLink>

              <NavLink
                to="/forms/opt-out-req-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Opt Out Request From
              </NavLink>

              <NavLink
                to="/forms/passport-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Passport Request
              </NavLink>

              <NavLink
                to="/forms/shift-hand-over"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Shift Hand Over
              </NavLink>

              <NavLink
                to="/forms/staff-training-checklist"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Staff Training Checklist
              </NavLink>

              <NavLink
                to="/forms/tpc-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                TPC Form
              </NavLink>

              <NavLink
                to="/forms/weekly-overtime-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Weekly Overtime Form
              </NavLink>

              <NavLink
                to="/forms/patolling-checklist"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Patrolling Checklist
              </NavLink>

              <NavLink
                to="/forms/facility-complaint-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : hoverClass
                }
              >
                Facility Complaint Form
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Forms;
