import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaAngleRight } from "react-icons/fa";

const PerformanceDashboard = () => {
  // Summary Cards
  const summary = [
    {
      title: "Total Employees",
      value: 43,
      icon: <FaUsers />,
      color: "from-gray-300 to-gray-500 text-gray-900",
    },

    {
      title: "Total Present Employees",
      value: 32,
      icon: <FaUserCheck />,
      color: "from-red-300 to-red-500 text-red-900",
    },
    {
      title: "Total Absent Employees",
      value: 8,
      icon: <FaUserTimes />,
      color: "from-red-100 to-red-300 text-red-500",
    },

    {
      title: "Employees On Leave",
      value: 3,
      icon: <FaUserClock />,
      color: "from-gray-100 to-gray-300 text-gray-500",
    },
  ];

  // Chart Data
  const dailyData = [
    { name: "Good", value: 70 },
    { name: "Exact", value: 20 },
    { name: "Poor", value: 10 },
  ];

  const weeklyData = [
    { name: "Good", value: 65 },
    { name: "Poor", value: 35 },
  ];

  const monthlyData = [
    { name: "Good", value: 85 },
    { name: "Poor", value: 15 },
  ];

  const COLORS = ["#153f24", "#d66c32", "#ab0f0f"];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 pt-1.5 text-lg font-semibold flex-wrap mb-6">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          Performance Dashboard
        </h1>
      </div>

      <div className="bg-gray-50 min-h-screen mb-16">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          {summary.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${card.color} rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:-translate-y-1 hover:shadow-xl`}
            >
              <div>
                <p className="text-sm font-medium">{card.title}</p>
                <h2 className="text-3xl font-bold">{card.value}</h2>
              </div>

              <div className="text-3xl opacity-70">{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Daily */}
          <div className="bg-white rounded-xl shadow-lg p-3 ">
            <h3 className="font-semibold mb-4 text-blue-600 text-lg">
              Daily Attendance
            </h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dailyData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  label
                  className="focus:outline-none"
                >
                  {dailyData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <h3 className="font-semibold mb-4 text-green-600 text-lg">
              Weekly Attendance
            </h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={weeklyData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  label
                  className="focus:outline-none"
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <h3 className="font-semibold mb-4 text-orange-500 text-lg">
            Monthly Attendance
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={monthlyData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                label
                className="focus:outline-none"
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default PerformanceDashboard;
