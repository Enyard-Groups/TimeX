import React from "react";
import { userData } from "../assets/userData";

const RecentActivity = () => {
  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <table className="w-full text-md text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-600 bg-gradient-to-b from-red-200 to-yellow-100">
            <th className="py-3 px-4">Employee ID</th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Check In</th>
            <th className="py-3 px-4">Check Out</th>
          </tr>
        </thead>

        <tbody>
          {userData.slice(0, 5).map((user) => (
            <tr
              key={user.enrollmentId}
              className="border-b border-gray-100 transition even:bg-red-50"
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
  );
};

export default RecentActivity;
