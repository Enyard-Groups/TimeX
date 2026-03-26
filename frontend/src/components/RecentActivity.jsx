import React from "react";

const deviceStyles = {
  mobile: "bg-blue-50 text-blue-600",        // soft calm blue
  desktop: "bg-indigo-50 text-indigo-600",   // smooth indigo
  tablet: "bg-purple-50 text-purple-600",    // soft purple
  biometric: "bg-violet-50 text-violet-600", // warm violet
};

const RecentActivity = ({userData}) => {
  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <table className="w-full text-sm text-left border-collapse">
        {/* HEADER */}
        <thead>
          <tr className="border-b border-gray-100 font-semibold text-gray-600">
            <td className="px-2 pb-2 pl-4 sm:pl-12">Name</td>
            <td className="text-center">Check in</td>
            <td className="text-center">Device</td>
            <td className="text-center">Check out</td>
            <td className="text-center">Device</td>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {userData.slice(0, 5).map((user) => (
            <tr
              key={user.enrollmentId}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              {/* NAME */}
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
                      ID: {user.enrollmentId} | {" "}
                      {user.locationName}
                    </p>
                  </div>
                </div>
              </td>

              {/* CHECK-IN TIME */}
              <td className="p-2 text-center">
                <span className="px-2 py-1 text-sm font-medium rounded-full bg-[#e3e9f7] text-gray-700">
                  {user.checkin || "--"}
                </span>
              </td>

              {/* CHECK-IN DEVICE */}
              <td className="p-2 text-center">
                {user.checkin ? (
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      deviceStyles[user.checkinDevice]
                    }`}
                  >
                    {user.checkinDevice.charAt(0).toUpperCase() +
                      user.checkinDevice.slice(1)}
                  </span>
                ) : (
                  "--"
                )}
              </td>

              {/* CHECK-OUT TIME */}
              <td className="p-2 text-center">
                <span className="px-2 py-1 text-sm font-medium rounded-full bg-[#e3f6f7] text-gray-700">
                  {user.checkout || "--"}
                </span>
              </td>

              {/* CHECK-OUT DEVICE */}
              <td className="p-2 text-center">
                {user.checkout ? (
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      deviceStyles[user.checkoutDevice]
                    }`}
                  >
                    {user.checkoutDevice.charAt(0).toUpperCase() +
                      user.checkoutDevice.slice(1)}
                  </span>
                ) : (
                  "--"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;
