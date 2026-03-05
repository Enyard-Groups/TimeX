/* eslint-disable react-hooks/set-state-in-effect */
import AttendanceBarChart from "../components/AttendanceBarChart";
import DonutChart from "../components/DonutChart";
import GeoLocationMap from "../components/GeoLocationMap";
import LeaveDistributionChart from "../components/LeaveDistributionChart";
import { useEffect, useState } from "react";

const AdminDashboard = ({ user }) => {

   const [attendanceData, setAttendanceData] = useState([]);
  
    useEffect(() => {
      const data = [
        {
          day: "Monday",
          total: 100,
          leave: 5,
          absent: 10,
          latein: 8,
          earlyin: 12,
        },
        {
          day: "Tuesday",
          total: 100,
          leave: 3,
          absent: 2,
          latein: 10,
          earlyin: 15,
        },
        {
          day: "Wednesday",
          total: 100,
          leave: 4,
          absent: 8,
          latein: 9,
          earlyin: 10,
        },
        {
          day: "Thursday",
          total: 100,
          leave: 6,
          absent: 5,
          latein: 11,
          earlyin: 9,
        },
        {
          day: "Friday",
          total: 100,
          leave: 7,
          absent: 0,
          latein: 2,
          earlyin: 11,
        },
        {
          day: "Saturday",
          total: 100,
          leave: 8,
          absent: 15,
          latein: 7,
          earlyin: 6,
        },
      ];
      setAttendanceData(data);
    }, []);

  const formattedName =
    user?.email?.split("@")[0].charAt(0).toUpperCase() +
    user?.email?.split("@")[0].slice(1).toLowerCase();
 

  const latest = attendanceData[attendanceData.length - 1] || {};

  const total = latest.total || 0;
  const absent = latest.absent || 0;
  const leave = latest.leave || 0;
  const present = total - (absent + leave);

  return (
    <>
      <div className="mb-10 font-bold">
        <h2 className="text-xl tracking-tight">
          Welcome back,{" "}
          <span style={{ color: "oklch(0.645 0.246 16.439)" }}>
            {user?.name || formattedName}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-sm mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Total Employees
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "oklch(0.3 0.004 49.25)" }}
          >
            {total}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.3 0.004 49.25)" }}
          />
        </div>

        {/* Present Today */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-sm mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Present Today
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight "
            style={{ color: "oklch(0.6 0.246 16.439)" }}
          >
            {present}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.6 0.246 16.439)" }}
          />
        </div>

        {/* Absent */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-sm mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Absent
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "oklch(0.72 0.245 27.325)" }}
          >
            {absent}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.72 0.245 27.325)" }}
          />
        </div>

        {/* Leave Requests */}
        <div
          className="
          hover:scale-105 active:scale-95 transition-all duration-300
    relative group
    p-6 rounded-3xl
    bg-white/60 backdrop-blur-xl
    border border-white/60
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]
    transition-all duration-300
  "
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          <p
            className="text-sm mb-2"
            style={{ color: "oklch(0.2 0.004 49.25)" }}
          >
            Leave Requests
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight "
            style={{ color: "oklch(0.45 0.004 49.25)" }}
          >
            {leave}
          </h3>

          <div
            className="mt-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: "oklch(0.45 0.004 49.25)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-white rounded-3xl shadow-md  hover:scale-105 active:scale-95 transition-all duration-300">
          <h4
            className="text-center mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Company Attendance Overview
          </h4>
          <AttendanceBarChart className="col-span-2" attendanceData={attendanceData}/>
        </div>

        <div className=" text-center bg-white rounded-3xl shadow-md  hover:scale-105 active:scale-95 transition-all duration-300">
          <h4
            className="mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Early vs Late Check-In
          </h4>
          <DonutChart attendanceData={attendanceData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <LeaveDistributionChart/>
        <GeoLocationMap />
      </div>
    </>
  );
};

export default AdminDashboard;
