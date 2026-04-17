import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const deviceStyles = {
  mobile: "bg-blue-50 text-blue-600",
  desktop: "bg-indigo-50 text-indigo-600",
  tablet: "bg-purple-50 text-purple-600",
  biometric: "bg-violet-50 text-violet-600",
};

// Handle both "09:32 AM" and "HH:MM:SS" formats
const timeToSeconds = (time) => {
  if (!time || time === "-") return 0;

  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const isPM = match[3].toUpperCase() === "PM";
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 3600 + m * 60;
  }

  // Fallback: HH:MM:SS
  const [h = 0, m = 0, s = 0] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const RecentActivity = () => {
  const records = useSelector((state) => state.record);
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

  // Filter: only show records where checkIn time has been reached
  const activeUsers = records.filter((user) => {
    const checkinSec = timeToSeconds(user.checkIn);
    return checkinSec <= currentSeconds && checkinSec > 0;
  });

  // Get the latest event time for sorting
  const getLatestTime = (user) => {
    const checkinSec = timeToSeconds(user?.checkIn);
    const checkoutSec = timeToSeconds(user?.checkOut);

    if (
      user.checkOut &&
      user.checkOut !== "-" &&
      checkoutSec <= currentSeconds
    ) {
      return checkoutSec;
    }
    return checkinSec;
  };

  // Sort by latest event, show top 5
  const sortedUsers = [...activeUsers]
    .sort((a, b) => getLatestTime(b) - getLatestTime(a))
    .slice(0, 5);

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <h2 className="text-md font-bold text-gray-600 tracking-tight ml-5 my-4">
        Recent Activity
      </h2>
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
              const checkoutSec = timeToSeconds(user.checkOut);
              const isCheckout =
                user.checkOut &&
                user.checkOut !== "-" &&
                checkoutSec <= currentSeconds;

              const device = isCheckout
                ? user.checkoutDevice
                : user.checkinDevice;
              const location = user.location;

              return (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Name */}
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#002259] text-white font-semibold shadow-sm">
                          {user?.photo ? (
                            <img
                              src={user.photo}
                              alt={user?.username || "User"}
                              className="w-9 h-9 rounded-full object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#002259] text-white font-semibold shadow-sm">
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 leading-none">
                          {user?.username || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Check In */}
                  <td className="p-2 text-center text-xs">
                    <span className="px-2 py-1 font-medium rounded-full bg-[#e3e9f7] text-gray-700">
                      {user.checkIn || "--"}
                    </span>
                  </td>

                  {/* Check Out */}
                  <td className="p-2 text-center text-xs">
                    <span className="px-2 py-1 font-medium rounded-full bg-[#e3f6f7] text-gray-700">
                      {isCheckout ? user.checkOut : "--"}
                    </span>
                  </td>

                  {/* Device */}
                  <td className="p-2 text-center">
                    {device ? (
                      <span
                        className={`px-2 py-1 rounded-full ${
                          deviceStyles[device] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {device.charAt(0).toUpperCase() + device.slice(1)}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>

                  {/* Location */}
                  <td className="p-2 text-center">
                    {location ? (
                      <span className="text-gray-700">
                        {location.lat} , {location.lng}
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
