import React from "react";
import { userData } from "../assets/userData";

const RecentActivity = () => {
  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <table className="w-full text-sm text-left border-collapse ">
        <thead>
          <tr className="group border-b border-gray-100 hover:bg-gray-50 transition font-semibold">
            <td className="px-2 pb-1 pl-4 sm:pl-12">Name</td>
            <td className="text-center">Check in</td>
            <td className="text-center">Check out</td>
          </tr>
        </thead>
        <tbody>
          {userData.slice(0, 3).map((user) => (
            <tr
              key={user.enrollmentId}
              className="group border-b border-gray-100 hover:bg-gray-50 transition"
            >
              {/* Avatar + Name */}
              <td className="p-2">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <div className=" w-9 h-9 flex items-center justify-center rounded-full bg-[oklch(0.645_0.246_16.439)] text-white font-semibold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {user.enrollmentId}
                    </p>
                    <p className="text-xs text-gray-400">{user.locationName}</p>
                  </div>
                </div>
              </td>

              {/* Check-in */}
              <td className="p-2 text-center">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 ">
                  {user.checkin}
                </span>
              </td>

              {/* Check-out */}
              <td className="p-2 text-center">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 ">
                  {user.checkout}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;
