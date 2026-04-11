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

  // useEffect(() => {
  //   const fetchDashboardStats = async () => {
  //     try {
  //       const API_BASE = "http://localhost:3000/api";
  //       const token = localStorage.getItem("token");
  //       const headers = {
  //         "Content-Type": "application/json",
  //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //       };

  //       let res = await axios.get(`${API_BASE}/attendence/stats`, {
  //         headers,
  //       });

  //       setAttendanceData(res.data);
  //     } catch (error) {
  //       console.error("Failed to load dashboard stats:", error);
  //     }
  //   };

  //   fetchDashboardStats();
  // }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // 1. Generate dates for the last 10 years (3650 days)
        function getDecadeDates() {
          const dates = [];
          const today = new Date();
          const totalDays = 365 * 10; // Approx 3650 days

          for (let i = totalDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dates.push(d.toISOString().split("T")[0]);
          }
          return dates;
        }

        // 2. Generate data with weekend logic and growth trend
        function generateDecadeData(dates) {
          return dates.map((date, index) => {
            const d = new Date(date);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            /** * Realistic Growth Logic:
             * Company starts with 50 employees and grows to 150 over 10 years
             */
            const totalEmployees =
              50 + Math.floor((index / dates.length) * 100);

            // Weekend: ~10% present | Weekday: 70-90% present
            const presentToday = isWeekend
              ? Math.floor(Math.random() * (totalEmployees * 0.1)) + 5
              : Math.floor(Math.random() * (totalEmployees * 0.2)) +
                Math.floor(totalEmployees * 0.7);

            return {
              date,
              totalEmployees,
              presentToday,
              leave: isWeekend
                ? 0
                : Math.floor(Math.random() * (totalEmployees * 0.05)),
              earlyin: isWeekend
                ? 0
                : Math.floor(Math.random() * (totalEmployees * 0.1)),
              latein: isWeekend
                ? 0
                : Math.floor(Math.random() * (totalEmployees * 0.08)),
            };
          });
        }

        const allDates = getDecadeDates();
        const finalData = generateDecadeData(allDates);

        console.log("Generated 10 years of data successfully.");
        setAttendanceData(finalData);
      } catch (error) {
        console.error("Failed to load 10-year dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <>
      <div className="md:flex md:items-center justify-between w-full mb-4">
        {/* LEFT - Welcome */}
        <div className="flex-1 flex justify-center md:justify-start text-center mt-10 sm:mt-0 md:pl-10 lg:pl-0 md:whitespace-nowrap md:mr-10">
          <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
            Dashboard
            {/* Welcome back,{" "}
            <span className="bg-clip-text font-bold text-transparent bg-blue-900">
              {user?.user_name || "User"}
            </span> */}
          </h2>
        </div>

        {/* CENTER - Search */}
        <div className="flex-1 flex justify-center my-2 md:my-0">
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 w-full max-w-[300px] lg:max-w-[500px] shadow-md">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm xl:text-base w-full placeholder-gray-400"
            />
          </div>
        </div>

        {/* RIGHT - Icon */}
        <div className="flex-1 flex justify-end"></div>
      </div>

      {/* Today Attendance */}
      <div className="bg-white rounded mt-8" style={{ scrollbarWidth: "none" }}>
        <EmployeeAttendance attendanceData={attendanceData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 items-start">
        {/* Line Chart */}
        <div
          className="xl:col-span-2 bg-white rounded shadow-md p-2 overflow-x-auto  border border-gray-200 min-h-[430px]"
          style={{ scrollbarWidth: "none" }}
        >
          <AttendanceLineChart attendanceData={attendanceData} />
        </div>
        <div
          className=" bg-white rounded shadow-md p-2 overflow-x-auto  border border-gray-200 min-h-[430px]"
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
