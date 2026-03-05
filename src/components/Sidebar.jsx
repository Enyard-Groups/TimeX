import { Link } from "react-router-dom";

import Master from "../SidebarComponents/Masters/Master";
import DeviceManagement from "../SidebarComponents/DeviceManagment/DeviceManagment";
import Transaction from "../SidebarComponents/Transaction/Transaction";
import Geofencing from "../SidebarComponents/Geofencing/Geofencing";
import Requests from "../SidebarComponents/Requests/Requests";
import Approvals from "../SidebarComponents/Approvals/Approvals";
import Reports from "../SidebarComponents/Reports/Reports";
import Visitor from "../SidebarComponents/VisitorManagement/Visitor";
import Forms from "../SidebarComponents/Forms/Forms";

const Sidebar = ({ user }) => {
  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div
      className="h-screen overflow-y-auto pt-24 pb-10"
      style={{
        backgroundColor: "oklch(1 0 0)",
        scrollbarWidth: "none",
      }}
    >
      <nav className="px-4 space-y-2">

        {isAdmin ? (
          <div
            className="space-y-5"
            style={{ color: "oklch(0.147 0.004 49.25)" }}
          >
            <Master user={user} />
            <DeviceManagement user={user} />
            <Transaction user={user} />
            <Geofencing user={user} />
            <Requests user={user} />
            <Approvals user={user} />
            <Reports user={user} />
            <Visitor user={user} />
            <Forms user={user} />
          </div>
        ) : (
          <div className="space-y-2">

            <Link
              to="/myattendance"
              className="block w-full text-left px-4 py-3 rounded-2xl font-medium transition-all"
              style={{
                color: "oklch(0.147 0.004 49.25)",
              }}
            >
              My Attendance
            </Link>

            <Link
              to="/applyforleave"
              className="block w-full text-left px-4 py-3 rounded-2xl font-medium transition-all"
              style={{
                color: "oklch(0.147 0.004 49.25)",
              }}
            >
              Apply for Leave
            </Link>

          </div>
        )}

      </nav>
    </div>
  );
};

export default Sidebar;