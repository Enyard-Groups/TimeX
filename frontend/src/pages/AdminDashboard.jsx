/* eslint-disable react-hooks/set-state-in-effect */
import DonutChart from "../components/DonutChart";
import GeoLocationMap from "../components/GeoLocationMap";
import { useEffect, useState } from "react";
import RecentActivity from "../components/RecentActivity";
import EmployeeAttendance from "../components/EmployeeAttendance";
import AttendanceCapsuleChart from "../components/AttendanceLineChart";

const AdminDashboard = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const data = [
      {
        day: "Monday",
        total: 100,
        leave: 15,
        absent: 30,
        latein: 8,
        earlyin: 12,
      },
      {
        day: "Tuesday",
        total: 100,
        leave: 13,
        absent: 12,
        latein: 10,
        earlyin: 15,
      },
      {
        day: "Wednesday",
        total: 100,
        leave: 4,
        absent: 38,
        latein: 19,
        earlyin: 10,
      },
      {
        day: "Thursday",
        total: 100,
        leave: 6,
        absent: 4,
        latein: 11,
        earlyin: 9,
      },
      {
        day: "Friday",
        total: 100,
        leave: 7,
        absent: 20,
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

  return (
    <>
      <div className="mb-10 font-bold">
        <h2 className="text-2xl tracking-tight">
          Welcome back,{" "}
          <span style={{ color: "oklch(0.645 0.246 16.439)" }}>
            {user?.name || formattedName}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 items-start">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-md p-4 sm:p-6 hover:scale-105 active:scale-95 overflow-x-auto sm:overflow-hidden transition-all duration-300">
          <h4
            className="text-center mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Today's Overview
          </h4>
          <EmployeeAttendance attendanceData={attendanceData} />
        </div>

        <div className="col-span-1 lg:col-span-3 bg-white rounded-3xl shadow-md p-4 sm:p-6 overflow-x-auto hover:scale-105 active:scale-95 transition-all duration-300">
          <h4
            className="text-center mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Company Attendance Overview
          </h4>
          <AttendanceCapsuleChart attendanceData={attendanceData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
        <GeoLocationMap />
        <div className="col-span-1 text-center bg-white rounded-3xl shadow-md p-4 sm:p-6 overflow-x-auto sm:overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300">
          <h4
            className="mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Early vs Late Check-In
          </h4>
          <DonutChart attendanceData={attendanceData} />
        </div>
      </div>

      <RecentActivity />
    </>
  );
};

export default AdminDashboard;
