/* eslint-disable no-unused-vars */
import DonutChart from "../components/DonutChart";
import GeoLocationMap from "../components/GeoLocationMap";
import { useEffect, useState } from "react";
import axios from "axios";
import RecentActivity from "../components/RecentActivity";
import EmployeeAttendance from "../components/EmployeeAttendance";
import AttendanceLineChart from "../components/AttendanceLineChart";
import PendingRequest from "../components/PendingRequest";

const AdminDashboard = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // const API_BASE = "http://localhost:3000/api";
        // const token = localStorage.getItem("token");
        // const headers = {
        //   "Content-Type": "application/json",
        //   ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // };

        // let res = await axios.get(`${API_BASE}/attendence/stats`, {
        //   headers,
        // });

        const res = {
          data: [
            {
              date: "2026-03-17",
              totalEmployees: 120,
              presentToday: 95,
              leave: 1,
              earlyin: 15,
              latein: 4,
            },
            {
              date: "2026-03-18",
              totalEmployees: 120,
              presentToday: 89,
              leave: 6,
              earlyin: 12,
              latein: 3,
            },
            {
              date: "2026-03-19",
              totalEmployees: 120,
              presentToday: 100,
              leave: 5,
              earlyin: 10,
              latein: 5,
            },
            {
              date: "2026-03-20",
              totalEmployees: 120,
              presentToday: 110,
              leave: 7,
              earlyin: 14,
              latein: 2,
            },
            {
              date: "2026-03-21",
              totalEmployees: 120,
              presentToday: 108,
              leave: 7,
              earlyin: 9,
              latein: 6,
            },
            {
              date: "2026-03-22",
              totalEmployees: 120,
              presentToday: 115,
              leave: 7,
              earlyin: 16,
              latein: 3,
            },
            {
              date: "2026-03-23",
              totalEmployees: 120,
              presentToday: 98,
              leave: 10,
              earlyin: 14,
              latein: 5,
            },
          ],
        };

        setAttendanceData(res.data);
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
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[oklch(0.6_0.246_16.439)] to-[oklch(0.7_0.146_16.439)]">
            {user?.user_name || "User"}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
        {/* Line Chart */}
        <div
          className="md:col-span-2 bg-white rounded shadow-md p-2 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <AttendanceLineChart attendanceData={attendanceData} />
        </div>

        {/* Today Attendance */}
        <div
          className="bg-white rounded shadow-md p-4 sm:p-6 sm:overflow-hidden   border border-gray-200 h-[270px]"
          style={{ scrollbarWidth: "none" }}
        >
          <EmployeeAttendance attendanceData={attendanceData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        {/* Recent Actvity */}
        <div
          className=" bg-white rounded shadow-md p-4 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <RecentActivity />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div
            className="text-center bg-white rounded shadow-md p-4 overflow-x-auto sm:overflow-hidden  border border-gray-200 h-[245px]"
            style={{ scrollbarWidth: "none" }}
          >
            <PendingRequest />
          </div>

          <div
            className="text-center bg-white rounded shadow-md p-4 overflow-x-auto sm:overflow-hidden  border border-gray-200 h-[245px]"
            style={{ scrollbarWidth: "none" }}
          >
            <DonutChart attendanceData={attendanceData} />
          </div>
        </div>

        {/* <div className=" col-span-2 bg-white border border-gray-200 rounded p-6 shadow-lg">
          <GeoLocationMap />
          <p className="mt-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Geographical Distribution
          </p>
        </div> */}
      </div>
    </>
  );
};

export default AdminDashboard;
