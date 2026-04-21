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
import { MdCoPresent } from "react-icons/md";

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
  const isattendanceActive = location.pathname.startsWith("/myattendance");
  const activeClass = "text-white rounded-xl bg-[#1E3A8A] p-2";
  const hoverClass =
    "text-white hover:text-black hover:bg-gray-100 p-2 rounded-xl";

  return (
    <div className="h-screen flex flex-col bg-[#0f172a]">
      {/* TOP */}
      <div className=" pl-13 pt-7 mb-8 mt-2">
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

      {isAdmin && (
        <div
          className={`mt-2.5 mb-5 px-3 mx-2.5 rounded-xl text-md transition-all ${isdashboardActive ? activeClass : hoverClass
            }`}
        >
          <div className="flex items-center gap-3 text-[16px] pl-2">
            <RxDashboard />
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      )}

      {/* MIDDLE (Scrollable Area) */}
      <div
        className="flex-1 overflow-y-auto px-3 space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        {isAdmin ? (
          <>
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
            <div
              className={`mt-2.5 mb-5 px-4 rounded-xl text-md transition-all ${isdashboardActive ? activeClass : hoverClass
                }`}
            >
              <div className="flex items-center gap-3 text-[16px] ">
                <RxDashboard />
                <Link to="/dashboard">Dashboard</Link>
              </div>
            </div>
            <div
              className={`mt-2.5 mb-5 px-4 rounded-xl text-md transition-all ${isattendanceActive ? activeClass : hoverClass
                }`}
            >
              <div className="flex items-center gap-3 text-[16px]">
                <MdCoPresent />
                <Link to="/myattendance">My Attendance</Link>
              </div>
            </div>
            <Requests user={user} />
            <Forms user={user} />
          </>
        )}
      </div>

      {/* BOTTOM */}
      <div className="p-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full xl:text-base flex pl-2 items-center gap-2 font-semibold text-blue-100 hover:text-white transition-all gap-3"
        >
          <span className="text-lg bg-[#1E3A8A] rounded-full p-1 text-white">
            <IoIosLogOut />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
