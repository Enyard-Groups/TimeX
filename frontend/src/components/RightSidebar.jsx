import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../action";
import { IoIosLogOut } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";

const RightSidebar = ({ user, setOpenModal }) => {
  const [notifications] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto bg-white"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-6 pb-5 px-4 border-b border-gray-50">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black shadow-md cursor-pointer transition-all hover:scale-105 bg-[#0f172a] text-white text-2xl md:text-3xl mb-3">
          {user?.user_name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="text-center w-full overflow-hidden">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
            {user?.user_name}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="px-4 py-4 flex-1">
        <h2 className="text-gray-600 text-xs md:text-sm font-medium flex justify-between items-center mb-4">
          Notifications
          <IoNotifications className="text-base" />
        </h2>
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-[150px] text-gray-400 text-xs italic">
            No Notifications
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-50 text-xs text-gray-700 border border-gray-100"
              >
                {item.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors rounded-xl text-xs font-medium border border-gray-200 cursor-pointer"
          >
            <span>Logout</span>
            <IoIosLogOut className="text-lg" />
          </button>

          {/* This button triggers the Modal in Dashboard */}
          <button
            onClick={() => setOpenModal(true)}
            className="w-full px-4 py-2 bg-[#00173d] text-white hover:bg-opacity-90 transition-all rounded-xl text-xs font-medium cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
