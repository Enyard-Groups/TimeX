import React from "react";
import { userData } from "../assets/userData";

const RecentActivity = () => {
  return (
    <div
      className="
      mt-6
      col-span-2
      bg-white/50
      backdrop-blur-xl
      border border-white/60
      rounded-3xl
      p-6
      shadow-[0_10px_40px_rgba(0,0,0,0.06)]
    "
    >
      <h2
        className="text-md font-semibold mb-4 text-center"
        style={{ color: "oklch(0.5 0.004 49.25)" }}
      >
        Recent Activity
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-md text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-3 px-4">Employee ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
            </tr>
          </thead>

          <tbody>
            {userData.slice(0,3).map((user) => (
              <tr
                key={user.enrollmentId}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 font-medium">{user.enrollmentId}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.locationName}</td>
                <td className="py-3 px-4 text-green-600">{user.checkin}</td>
                <td className="py-3 px-4 text-red-500">{user.checkout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;
