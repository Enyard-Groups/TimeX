import DonutChart from "../components/DonutChart";
import GeoLocationMap from "../components/GeoLocationMap";
import { useEffect, useState } from "react";
import axios from "axios";
import RecentActivity from "../components/RecentActivity";
import EmployeeAttendance from "../components/EmployeeAttendance";
import AttendanceCapsuleChart from "../components/AttendanceLineChart";

const AdminDashboard = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([
    {
      day: "Today",
      total: 0,
      leave: 0,
      absent: 0,
      latein: 0,
      earlyin: 0,
    },
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const API_BASE = "http://localhost:3000/api";
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await axios.get(`${API_BASE}/attendence/stats`, {
          headers,
        });

        const { totalEmployees, presentToday } = res.data;
        // console.log(res.data)

        const total = Number(totalEmployees) || 0;
        const present = Number(presentToday) || 0;
        const absent = Math.max(0, total - present);

        setAttendanceData([
          {
            day: "Today",
            total,
            leave: 0,
            absent,
            latein: 0,
            earlyin: 0,
          },
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);


  return (
    <>
      <div className="mb-10 font-bold">
        <h2 className="text-2xl tracking-tight">
          Welcome back,{" "}
          <span style={{ color: "oklch(0.645 0.246 16.439)" }}>
            {user?.user_name || "User"}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 items-start">
        <div
          className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-md p-4 sm:p-6 hover:scale-105 active:scale-95 overflow-x-auto sm:overflow-hidden transition-all duration-300"
          style={{ scrollbarWidth: "none" }}
        >
          <h4
            className="text-center mb-6 p-3 font-semibold "
            style={{ color: "oklch(0.5 0.004 49.25)" }}
          >
            Today's Overview
          </h4>
          <EmployeeAttendance attendanceData={attendanceData} />
        </div>

        <div
          className="col-span-1 lg:col-span-3 bg-white rounded-3xl shadow-md p-4 sm:p-6 overflow-x-auto hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ scrollbarWidth: "none" }}
        >
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
        <div
          className="col-span-1 text-center bg-white rounded-3xl shadow-md p-4 sm:p-6 overflow-x-auto sm:overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ scrollbarWidth: "none" }}
        >
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
