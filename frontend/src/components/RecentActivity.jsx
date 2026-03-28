import React, { useEffect, useState } from "react";

const deviceStyles = {
  mobile: "bg-blue-50 text-blue-600",
  desktop: "bg-indigo-50 text-indigo-600",
  tablet: "bg-purple-50 text-purple-600",
  biometric: "bg-violet-50 text-violet-600",
};

const RecentActivity = ({ userData }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 8));
    };

    updateTime(); 

    const interval = setInterval(updateTime, 1000); 

    return () => clearInterval(interval);
  }, []);

  const getLatestTime = (user) => {
    return user.checkout || user.checkin || "00:00:00";
  };

  const filteredUsers = userData.filter((user) => {
    const latestTime = getLatestTime(user);
    return latestTime <= currentTime;
  });

  const sortedUsers = [...filteredUsers]
    .sort((a, b) => {
      const timeA = getLatestTime(a);
      const timeB = getLatestTime(b);
      return timeB.localeCompare(timeA);
    })
    .slice(0, 5);

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 font-semibold text-gray-600">
            <td className="px-2 pb-2 pl-4 sm:pl-12">Name</td>
            <td className="text-center">Check in</td>
            <td className="text-center">Check out</td>
            <td className="text-center">Device</td>
            <td className="text-center">Location</td>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.map((user) => {
            const isCheckout = !!user.checkout;

            const device = isCheckout
              ? user.checkoutDevice
              : user.checkinDevice;

            const location = isCheckout
              ? user.checkoutLocation
              : user.checkinLocation;

            return (
              <tr
                key={user.enrollmentId}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#002259] text-white font-semibold shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        ID: {user.enrollmentId}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-2 text-center">
                  <span className="px-2 py-1 text-sm font-medium rounded-full bg-[#e3e9f7] text-gray-700">
                    {user.checkin || "--"}
                  </span>
                </td>

                <td className="p-2 text-center">
                  <span className="px-2 py-1 text-sm font-medium rounded-full bg-[#e3f6f7] text-gray-700">
                    {user.checkout || "--"}
                  </span>
                </td>

                <td className="p-2 text-center">
                  {device ? (
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        deviceStyles[device]
                      }`}
                    >
                      {device.charAt(0).toUpperCase() + device.slice(1)}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>

                <td className="p-2 text-center">
                  {location ? (
                    <span className="text-sm text-gray-700">
                      {location.lat} , {location.lng}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;