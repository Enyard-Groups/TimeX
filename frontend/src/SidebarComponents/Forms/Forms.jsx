import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Forms = ({ user }) => {
  const [openForms, setOpenForms] = useState(false);

  const isAdmin = user.role === "admin";
  const isformsActive = location.pathname.startsWith("/forms");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <>
      {isAdmin && (
        <div>
          {/* Forms Main Button */}
          <div
            onClick={() => setOpenForms(!openForms)}
            className={`flex flex-col items-center justify-center cursor-pointer text-md p-2 hover:bg-gray-200 rounded ${
              isformsActive ? activeClass : ""
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-lg">
              <span>Forms</span>

              {/* {openForms ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )} */}
            </div>
          </div>

          {/* Sub Menu */}
          {openForms && (
            <div className="mt-2 flex flex-col items-center text-center gap-2 text-lg space-y-2">
              <NavLink
                to="/forms/monthly-fire-safety-inspections"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Monthly Fire Safety Inspections
              </NavLink>

              <NavLink
                to="/forms/incident-accident"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Incident / Accident
              </NavLink>

              <NavLink
                to="/forms/leave-application"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Leave Application
              </NavLink>

              <NavLink
                to="/forms/opt-out-req-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Opt Out Request From
              </NavLink>

              <NavLink
                to="/forms/passport-req"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Passport Request
              </NavLink>

              <NavLink
                to="/forms/shift-hand-over"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Shift Hand Over
              </NavLink>

              <NavLink
                to="/forms/staff-training-checklist"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Staff Training Checklist
              </NavLink>

              <NavLink
                to="/forms/tpc-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                TPC Form
              </NavLink>

              <NavLink
                to="/forms/weekly-overtime-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Weekly Overtime Form
              </NavLink>

              <NavLink
                to="/forms/patolling-checklist"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
                }
              >
                Patrolling Checklist
              </NavLink>

              <NavLink
                to="/forms/facility-complaint-form"
                className={({ isActive }) =>
                  isActive
                    ? activeClass
                    : "hover:text-[oklch(0.645_0.246_16.439)]"
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
