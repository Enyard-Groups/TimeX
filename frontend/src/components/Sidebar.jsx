/* eslint-disable react-hooks/rules-of-hooks */
import { Link, useNavigate, useLocation } from "react-router-dom";

import Master from "../SidebarComponents/Masters/Master";
import DeviceManagement from "../SidebarComponents/DeviceManagment/DeviceManagment";
import Transaction from "../SidebarComponents/Transaction/Transaction";
import Geofencing from "../SidebarComponents/Geofencing/Geofencing";
import Requests from "../SidebarComponents/Requests/Requests";
import Approvals from "../SidebarComponents/Approvals/Approvals";
import Reports from "../SidebarComponents/Reports/Reports";
import Visitor from "../SidebarComponents/VisitorManagement/Visitor";
import Forms from "../SidebarComponents/Forms/Forms";
import { RxDashboard } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { logout } from "../action";
import { IoIosLogOut } from "react-icons/io";

const Sidebar = ({ user }) => {
  if (!user) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  const isAdmin = user.role === "admin";

  const isdashboardActive = location.pathname.startsWith("/dashboard");

  const activeClass = "text-white rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <div className="h-screen flex flex-col bg-[#0f172a]">
      {/* TOP */}
      <div className="flex justify-center items-center py-4 mt-2">
        <Link to="/dashboard">
          <img
            src="../timexlogo.png"
            className="bg-white"
            alt=""
            height="120px"
            width="120px"
          />
        </Link>
      </div>

      {/* MIDDLE (Scrollable Area) */}
      <div
        className="flex-1 overflow-y-auto px-3 space-y-5 "
        style={{ scrollbarWidth: "none" }}
      >
        {isAdmin ? (
          <>
            <div
              className={`mt-5 mb-5 px-1.5 py-2 rounded-xl text-md transition-all ${
                isdashboardActive ? activeClass : hoverClass
              }`}
            >
              <div className="flex items-center gap-4 text-[18px] pl-2">
                <RxDashboard />
                <Link to="/dashboard">Dashboard</Link>
              </div>
            </div>

            <Master user={user} />
            <DeviceManagement user={user} />
            <Transaction user={user} />
            <Geofencing user={user} />
            <Requests user={user} />
            <Approvals user={user} />
            <Reports user={user} />
            <Visitor user={user} />
            <Forms user={user} />
          </>
        ) : (
          <>
            <Link
              to="/myattendance"
              className="block px-4 py-3 rounded-2xl font-medium text-white"
            >
              My Attendance
            </Link>

            <Link
              to="/applyforleave"
              className="block px-4 py-3 rounded-2xl font-medium text-white"
            >
              Apply for Leave
            </Link>
          </>
        )}
      </div>

      {/* BOTTOM */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex justify-center items-center gap-2 font-semibold text-blue-100 hover:text-white transition-all"
        >
          <span>Logout</span>
          <span className="text-lg bg-[#1E3A8A] rounded-full p-1 text-white">
            <IoIosLogOut />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
