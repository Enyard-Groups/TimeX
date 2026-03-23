/* eslint-disable no-unused-vars */
import DonutChart from "../components/DonutChart";
import GeoLocationMap from "../components/GeoLocationMap";
import { useEffect, useState } from "react";
import axios from "axios";
import RecentActivity from "../components/RecentActivity";
import EmployeeAttendance from "../components/EmployeeAttendance";
import AttendanceLineChart from "../components/AttendanceLineChart";

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
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-red-600 to-yellow-500">
            {user?.user_name || "User"}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 items-start">
        <div
          className="col-span-1 lg:col-span-2 bg-white rounded shadow-md p-4 sm:p-6 sm:overflow-hidden   border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <EmployeeAttendance attendanceData={attendanceData} />
          <p className="mt-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Today's Overview
          </p>
        </div>

        <div
          className="col-span-1 lg:col-span-3 bg-white rounded shadow-md p-4 sm:p-6 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <AttendanceLineChart attendanceData={attendanceData} />
          <p className="mt-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Weekly Presentences Report{" "}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
        <div className=" col-span-2 bg-white border border-gray-200 rounded p-6 shadow-lg">
          <GeoLocationMap />
          <p className="mt-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Geographical Distribution
          </p>
        </div>

        <div
          className="col-span-1 text-center bg-white rounded shadow-md p-4 sm:p-6 overflow-x-auto sm:overflow-hidden  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <DonutChart attendanceData={attendanceData} />
          <p className="mt-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Early Vs Late In
          </p>
        </div>
      </div>

      <div
        className="mt-6
      rounded
      p-6
      shadow-md
       border border-gray-200
    "
      >
        <p className="mb-4 text-center text-md font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
          Recent Activity
        </p>
        <RecentActivity />
      </div>
    </>
  );
};

export default AdminDashboard;
