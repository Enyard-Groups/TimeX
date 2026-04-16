const EmployeeDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="mb-10 font-bold">
        <h2 className="text-2xl tracking-tight mt-1 pl-8 lg:pl-0">
          Welcome,{" "}
          <span className="text-[#1b3f93]">
            {user?.user_name.charAt(0).toUpperCase() +
              user?.user_name.slice(1) || "User"}
          </span>
        </h2>
      </div>
      {/* Punch Card */}
      <div className="p-8 bg-white rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl mb-2">Today’s Attendance</h3>
          <p className="text-md opacity-60">
            Make sure to punch in and out on time.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            className="px-6 py-3 rounded-2xl text-white shadow-md transition hover:scale-105"
            style={{
              backgroundColor: "oklch(0.645 0.246 16.439)",
            }}
          >
            Punch In
          </button>

          <button
            className="px-6 py-3 rounded-2xl border transition hover:bg-gray-50"
            style={{
              borderColor: "oklch(0.645 0.246 16.439)",
              color: "oklch(0.645 0.246 16.439)",
            }}
          >
            Punch Out
          </button>
        </div>
      </div>

      {/* History */}
      <div className="p-8 bg-white rounded-3xl border shadow-sm">
        <h3 className="text-md mb-6">February Attendance History</h3>

        <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <table className="w-full text-md">
            <thead className="opacity-50 border-b">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Check In</th>
                <th className="text-left py-3">Check Out</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Feb 20</td>
                <td>09:02 AM</td>
                <td>06:01 PM</td>
                <td
                  style={{
                    color: "oklch(0.645 0.246 16.439)",
                    fontWeight: "600",
                  }}
                >
                  Present
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
