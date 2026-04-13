import React, { useEffect, useState } from "react";

const deviceStyles = {
  mobile: "bg-blue-50 text-blue-600",
  desktop: "bg-indigo-50 text-indigo-600",
  tablet: "bg-purple-50 text-purple-600",
  biometric: "bg-violet-50 text-violet-600",
};

// Convert HH:MM:SS → seconds
const timeToSeconds = (time) => {
  if (!time) return 0;
  const [h = 0, m = 0, s = 0] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const RecentActivity = ({ userData = [] }) => {
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

  const currentSeconds = timeToSeconds(currentTime);

  //  FILTER BASED ON TIME (IMPORTANT)
  const activeUsers = userData.filter((user) => {
    const checkinSec = timeToSeconds(user.checkin);
    return checkinSec <= currentSeconds; // only show when checkin time reached
  });

  // GET LATEST EVENT TIME
  const getLatestTime = (user) => {
    const checkin = timeToSeconds(user?.checkin);
    const checkout = timeToSeconds(user?.checkout);

    // if checkout happened → use checkout
    if (user.checkout && checkout <= currentSeconds) {
      return checkout;
    }

    // else use checkin
    return checkin;
  };

  //  SORT + LIMIT
  const sortedUsers = [...activeUsers]
    .sort((a, b) => getLatestTime(b) - getLatestTime(a))
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
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan="5">
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  No Recent Activity
                </div>
              </td>
            </tr>
          ) : (
            sortedUsers.map((user) => {
              const checkinSec = timeToSeconds(user.checkin);
              const checkoutSec = timeToSeconds(user.checkout);

              const isCheckout = user.checkout && checkoutSec <= currentSeconds;

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
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-gray-800 leading-none">
                          {user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">
                          ID: {user.enrollmentId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-2 text-center text-xs">
                    <span className="px-2 py-1 font-medium rounded-full bg-[#e3e9f7] text-gray-700">
                      {user.checkin || "--"}
                    </span>
                  </td>

                  <td className="p-2 text-center text-xs">
                    <span className="px-2 py-1 font-medium rounded-full bg-[#e3f6f7] text-gray-700">
                      {isCheckout ? user.checkout : "--"}
                    </span>
                  </td>

                  <td className="p-2 text-center">
                    {device ? (
                      <span
                        className={` px-2 py-1 rounded-full ${
                          deviceStyles[device] || "bg-gray-100 text-gray-600"
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
                      <span className=" text-gray-700">
                        {location?.lat ?? "--"} , {location?.lng ?? "--"}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;
