import { useEffect, useState } from "react";
import axios from "axios";
import RecentActivity from "../components/RecentActivity";
import EmployeeAttendance from "../components/EmployeeAttendance";
import AttendanceLineChart from "../components/AttendanceLineChart";
import DeviceStats from "../components/DeviceStats";
import { userData } from "../assets/userData";
import Timeline from "../components/Timeline";

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
              presentToday: 50,
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
              presentToday: 88,
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
      <div className="md:flex md:items-center justify-between w-full mb-4">
        {/* LEFT - Welcome */}
        <div className="flex-1 flex justify-center md:justify-start text-center mt-10 sm:mt-0 md:pl-10 lg:pl-0 md:whitespace-nowrap md:mr-10">
          <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Dashboard
            {/* Welcome back,{" "}
            <span className="bg-clip-text font-bold text-transparent bg-blue-900">
              {user?.user_name || "User"}
            </span> */}
          </h2>
        </div>

        {/* CENTER - Search */}
        <div className="flex-1 flex justify-center my-2 md:my-0">
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 w-full max-w-[300px] shadow-md">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder-gray-400"
            />
          </div>
        </div>

        {/* RIGHT - Icon */}
        <div className="flex-1 flex justify-end"></div>
      </div>

      {/* Today Attendance */}
      <div className="bg-white rounded " style={{ scrollbarWidth: "none" }}>
        <EmployeeAttendance attendanceData={attendanceData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
        {/* Line Chart */}
        <div
          className="md:col-span-2 bg-white rounded shadow-md p-2 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <AttendanceLineChart attendanceData={attendanceData} />
        </div>
        <div
          className=" bg-white rounded shadow-md p-2 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <DeviceStats data={userData} />
        </div>
      </div>

      <div className=" mt-6 items-start">
        {/* Recent Actvity */}
        <div
          className=" bg-white rounded shadow-md p-4 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <RecentActivity userData={userData} />
        </div>
      </div>

      <div className="my-6 items-start">
        {/* Timeline Actvity */}
        <div
          className="bg-white rounded shadow-md p-4 overflow-x-auto  border border-gray-200"
          style={{ scrollbarWidth: "none" }}
        >
          <Timeline userData={userData} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
