import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecord } from "../action";
import { FaEye } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const formatDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

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

const inputStyle =
  "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

const labelStyle =
  "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

const RecentActivity = () => {
  const [currentTime, setCurrentTime] = useState("");
  const dispatch = useDispatch();
  const records = useSelector((state) => state.record);

  const today = formatDate(new Date());

  const todayRecords = records.filter((user) => {
    return user.date === today;
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setopenModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    dispatch(fetchRecord());
  }, [dispatch]);

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

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Parse "Apr 21" → sortable number for date comparison
  const dateToSortKey = (dateStr) => {
    if (!dateStr) return 0;
    const months = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    const [mon, day] = dateStr.split(" ");
    return (months[mon] || 0) * 100 + parseInt(day || 0);
  };

  // Past-day records always show; today's only once checkIn time is reached
  const activeUsers = records.filter((user) => {
    const checkinSec = timeToSeconds(user.checkIn);
    if (!checkinSec) return false;
    if (user.date && user.date !== todayDate) return true;
    return checkinSec <= currentSeconds;
  });

  // Sort: newest date first → within same date, latest event time first
  const sortedUsers = [...activeUsers].sort((a, b) => {
    const dateDiff = dateToSortKey(b.date) - dateToSortKey(a.date);
    if (dateDiff !== 0) return dateDiff;

    const getTime = (user) => {
      const isToday = user.date === todayDate;
      const checkoutSec = timeToSeconds(user?.checkOut);
      const hasCheckout =
        user.checkOut &&
        user.checkOut !== "-" &&
        (!isToday || checkoutSec <= currentSeconds);
      return hasCheckout ? checkoutSec : timeToSeconds(user?.checkIn);
    };

    return getTime(b) - getTime(a);
  });

  const visibleUsers = sortedUsers.slice(0, visibleCount);
  const hasMore = visibleCount < sortedUsers.length;

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex justify-between">
        <h2 className="text-md font-bold text-gray-600 tracking-tight ml-5 my-4">
          Recent Activity
        </h2>

        {/* Show More / Show Less */}
        {(hasMore || visibleCount > 5) && (
          <div className="flex justify-start items-center gap-3 mr-5 py-3 border-t border-gray-100">
            {hasMore && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="flex items-center gap-2 px-4 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all"
              >
                Show More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            {visibleCount > 5 && (
              <button
                onClick={() => setVisibleCount(5)}
                className="flex items-center gap-2 px-4 py-1 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
              >
                Show Less
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 font-semibold text-gray-600">
            <td className="px-2 pb-2 pl-4 sm:pl-12">Name</td>
            <td className="text-center hidden sm:table-cell">Check in</td>
            <td className="text-center hidden sm:table-cell">Check out</td>
            <td className="text-center hidden md:table-cell">Device</td>
            <td className="text-center hidden md:table-cell">Location</td>
            <td className="text-center md:hidden table-cell">Action</td>
          </tr>
        </thead>

        <tbody>
          {visibleUsers.length === 0 ? (
            <tr>
              <td colSpan="6">
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  No Recent Activity
                </div>
              </td>
            </tr>
          ) : (
            visibleUsers.map((user) => {
              const isCheckout = user.checkOut && user.checkOut !== "-";

              // Always prefer checkout device if available, fall back to checkin device
              const device = user.checkoutDevice || user.checkinDevice;
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
                      <div>
                        <p className="font-medium text-gray-800 leading-none">
                          {user?.username
                            ? user.username.charAt(0).toUpperCase() +
                              user.username.slice(1)
                            : "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">
                          ID: {user.userID}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Check In */}
                  <td className="p-2 text-center text-xs hidden sm:table-cell">
                    <span className="px-2 py-1 font-medium rounded-full bg-[#e3e9f7] text-gray-700">
                      {user.checkIn || "--"}
                    </span>
                  </td>

                  {/* Check Out */}
                  <td className="p-2 text-center text-xs hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 font-medium rounded-full ${
                        user.checkOut === "Missed Punch"
                          ? "bg-red-100 text-red-700"
                          : isCheckout
                            ? "bg-[#e3f6f7] text-gray-700"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCheckout ? user.checkOut : "--"}
                    </span>
                  </td>

                  {/* Device — always shows checkin device, upgrades to checkout if available */}
                  <td className="p-2 text-center hidden md:table-cell">
                    {device ? (
                      <span
                        className={`px-2 py-1 rounded-full ${
                          deviceStyles[device] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {device.charAt(0).toUpperCase() + device.slice(1)}
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full font-bold">
                        --
                      </span>
                    )}
                  </td>

                  {/* Location — always from user.location */}
                  <td className="p-2 text-center hidden md:table-cell">
                    {location ? (
                      <span className="text-gray-700">
                        {location.lat} , {location.lng}
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full font-bold">
                        --
                      </span>
                    )}
                  </td>

                  {/* Mobile action */}
                  <td className="p-2 text-center flex justify-center md:hidden">
                    <button
                      onClick={() => {
                        setSelectedItem(user);
                        setopenModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                      title="View"
                    >
                      <FaEye className="text-lg lg:text-xl 3xl:text-2xl" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Detail Modal */}
      {openModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
          onClick={() => setopenModal(false)}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-blue-100/30 mb-6">
              <h1 className="text-xl font-bold text-gray-900">Details</h1>
              <button
                onClick={() => setopenModal(false)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Username</label>
                <input
                  type="text"
                  value={selectedItem.username || "--"}
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>User ID</label>
                <input
                  type="text"
                  value={selectedItem.userID || "--"}
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Check In Time</label>
                <input
                  type="text"
                  value={selectedItem.checkIn || "--"}
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Check Out Time</label>
                <input
                  type="text"
                  value={
                    selectedItem.checkOut && selectedItem.checkOut !== "-"
                      ? selectedItem.checkOut
                      : "--"
                  }
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Check In Device</label>
                <input
                  type="text"
                  value={selectedItem.checkinDevice || "--"}
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Check Out Device</label>
                <input
                  type="text"
                  value={selectedItem.checkoutDevice || "--"}
                  readOnly
                  className={inputStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelStyle}>Location</label>
                <input
                  type="text"
                  value={
                    selectedItem.location
                      ? `${selectedItem.location.lat} , ${selectedItem.location.lng}`
                      : "--"
                  }
                  readOnly
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
