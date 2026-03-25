/* eslint-disable react-hooks/rules-of-hooks */
import { Link, useNavigate } from "react-router-dom";

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  const isAdmin = user.role === "admin";
  console.log(user);

  const isdashboardActive = location.pathname.startsWith("/dashboard");
  const activeClass = "text-[oklch(0.645_0.246_16.439)]";

  return (
    <div
      className="h-screen overflow-y-auto bg-red-50/40"
      style={{
        // backgroundColor: "oklch(1 0 0)",
        scrollbarWidth: "none",
      }}
    >
      {/* Logo */}
      <div className="flex justify-center items-center gap-4 py-4 bg-white">
        {/* Logo */}
        <div className="text-2xl font-black tracking-tight text-[oklch(0.147_0.004_49.25)]">
          <Link to="/dashboard">
            <img src="../timexlogo.png" alt="" height="120px" width="120px" />
          </Link>
        </div>
      </div>

      {/* Profile */}
      <div className="flex justify-center items-start  py-5 ">
        <div className="text-center">
          <div
            src="/profile.jpg"
            alt="Profile"
            className="w-20 h-20 rounded-full flex items-center justify-center font-black shadow-md cursor-pointer transition-all hover:scale-105 bg-[oklch(0.645_0.246_16.439)] text-white object-cover mx-auto mb-4 text-3xl"
          >
            {" "}
            {user?.user_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user?.user_name}
          </h3>
          <p className="text-sm text-gray-500">{user?.enrollment_id}</p>
          <p className="text-sm text-gray-500">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
        </div>
      </div>

      {/* Sidebar Components */}
      <nav className=" pl-7 pr-2 pb-8 space-y-2">
        {isAdmin ? (
          <div>
            {" "}
            <div
              className="space-y-5 pt-1 "
              style={{ color: "oklch(0.147 0.004 49.25)" }}
            >
              <div
                className={`mt-5 pl-2 font-bold text-md ${isdashboardActive ? activeClass : ""}`}
              >
                <div className="flex items-center gap-2 font-medium text-lg">
                  <RxDashboard />
                  <span>
                    <Link to="/dashboard">Dashboard</Link>
                  </span>
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
            </div>
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer flex flex-row gap-2 my-10 font-bold"
            >
              <span className="text-lg mt-1 bg-red-600 rounded-full p-1 text-white">
                <IoIosLogOut />
              </span>
              <span className="mt-1">Logout</span>
            </button>
          </div>
        ) : (
          <div>
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
            <div className="absolute bottom-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex flex-row gap-2 my-10 font-bold"
              >
                <span className="text-lg mt-1 bg-red-600 rounded-full p-1 text-white">
                  <IoIosLogOut />
                </span>
                <span className="mt-1">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
