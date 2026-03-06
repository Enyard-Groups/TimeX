import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LuClipboardList } from "react-icons/lu";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Forms = ({ user }) => {
  const [openForms, setOpenForms] = useState(false);

  const isAdmin = user.role === "admin";
  return (
    <>
      {isAdmin && (
        <div>
          {/* Forms Main Button */}
          <div
            onClick={() => setOpenForms(!openForms)}
            className="flex items-center justify-between cursor-pointer text-md p-2 hover:bg-gray-200 rounded"
          >
            <div className="flex items-center gap-2 font-medium text-md">
              <LuClipboardList />
              <span>FORMS</span>
              {openForms ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              )}
            </div>
          </div>

          {/* Sub Menu */}
          {openForms && (
            <div className="ml-6 mt-2 flex flex-col gap-2 text-md space-y-2">
              <Link
                to="/forms/monthly-fire-safety-inspections"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                MONTHLY FIRE SAFETY INSPECTIONS
              </Link>

              <Link
                to="/forms/incident-accident"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                INCIDENT / ACCIDENT
              </Link>

              <Link
                to="/forms/leave-application"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                LEAVE APPLICATION
              </Link>

              <Link
                to="/forms/opt-out-req-form"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                OPT OUT REQUEST FORM
              </Link>

              <Link
                to="/forms/passport-req"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                PASSPORT REQUEST
              </Link>

              <Link
                to="/forms/shift-hand-over"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                SHIFT HAND OVER
              </Link>

              <Link
                to="/forms/staff-training-checklist"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                STAFF TRAINING CHECKLIST
              </Link>

              <Link
                to="/forms/tpc-form"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                TPC FORM
              </Link>

              <Link
                to="/forms/weekly-overtime-form"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                WEEKLY OVERTIME FORM
              </Link>

              <Link
                to="/forms/patolling-checklist"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                PATROLLING CHECKLIST
              </Link>

              <Link
                to="/forms/facility-complaint-form"
                className="hover:text-[oklch(0.645_0.246_16.439)]"
              >
                FACILITY COMPLAINT FORM
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Forms;
