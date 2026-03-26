import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../action";
import { IoIosLogOut } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";

const RightSidebar = ({ user }) => {
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
      className="overflow-y-auto max-h-[88vh]"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Profile */}
      <div className="flex justify-center items-start pb-5">
        <div className="text-center ">
          <div
            src="/profile.jpg"
            alt="Profile"
            className="w-20 h-20 mt-5 rounded-full flex items-center justify-center font-black shadow-md cursor-pointer transition-all hover:scale-105 bg-[#003386] text-white object-cover mx-auto mb-4 text-3xl"
          >
            {" "}
            {user?.user_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {user?.user_name}
            </h3>
            <p className="text-sm text-gray-500">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 h-full ">
        <h1 className="text-gray-600 font-medium flex justify-between">
          Notifications <IoNotifications className="text-lg mt-1" />
        </h1>

        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-md opacity-60 text-[oklch(0.147_0.004_49.25)]">
            No Notifications
          </div>
        ) : (
          notifications.map((item, index) => (
            <div
              key={index}
              className="p-3 mb-2 rounded-xl bg-[oklch(0.97_0.001_106.424)] hover:bg-[oklch(0.923_0.003_48.717)] h-[220px] transition text-md text-[oklch(0.147_0.004_49.25)]"
            >
              {item.message}
            </div>
          ))
        )}
      </div>

      <div className="mb-14 flex justify-between">
        <button
          onClick={handleLogout}
          className="h-fit mt-4 px-3 py-1 cursor-pointer flex flex-row gap-2 rounded-full shadow text-xs"
        >
          Logout
          <span className="text-[15px] bg-[#00173d] rounded-full text-white p-1">
            <IoIosLogOut />
          </span>
        </button>
        <button className="mt-2 px-3 py-1 cursor-pointer rounded-full shadow text-xs">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;