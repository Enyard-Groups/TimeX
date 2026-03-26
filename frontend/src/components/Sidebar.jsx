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
  // console.log(user);

  const isdashboardActive = location.pathname.startsWith("/dashboard");
  // const activeClass = "text-[oklch(0.645_0.246_16.439)]";
  const activeClass = "text-white rounded-xl bg-violet-300 p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <div
      className="h-screen overflow-y-auto bg-[#00173d] backdrop-blur-md"
      style={{
        // backgroundColor: "oklch(1 0 0)",
        scrollbarWidth: "none",
      }}
    >
      {/* Logo */}
      <div className="flex justify-center items-center gap-4 py-4">
        {/* Logo */}
        <div className="text-2xl font-black tracking-tight text-[oklch(0.147_0.004_49.25)]">
          <Link to="/dashboard">
            <img src="../timexlogo.png" className="bg-white" alt="" height="120px" width="120px" />
          </Link>
        </div>
      </div>


      {/* Sidebar Components */}
      <nav className="px-3 pb-8 space-y-2">
        {isAdmin ? (
          <div>
            {" "}
            <div
              className="space-y-5 pt-1 "
              style={{ color: "oklch(0.147 0.004 49.25)" }}
            >
              <div
                className={`mt-5 mb-6 px-3 py-2 rounded-xl text-md transition-all duration-200 ${
                  isdashboardActive ? activeClass : hoverClass
                }`}
              >
                <div className="flex items-center gap-4 text-[18px] pl-2">
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
              className="w-full flex justify-center items-center gap-2 my-10 font-semibold text-blue-100 hover:text-white transition-all"
            >
              <span className="mt-1">Logout</span>

              <span className="text-lg mt-1 bg-violet-300 rounded-full p-1 text-white">
                <IoIosLogOut />
              </span>
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
                className="w-full flex justify-center items-center gap-2 my-10 font-semibold text-blue-100 hover:text-white transition-all"
              >
                <span className="text-lg mt-1 bg-violet-300 rounded-full p-1 text-white">
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
