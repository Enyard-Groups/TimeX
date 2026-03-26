import React from "react";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Area } from "recharts";

const EmployeeAttendance = ({ attendanceData = [] }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};

  const total = Number(latest?.totalEmployees) || 0;
  const present = Number(latest?.presentToday) || 0;
  const absent = Math.max(0, total - present);
  const leave = Number(latest?.leave) || 0;

  const stats = [
    {
      title: "Present",
      value: present,
      icon: <UserCheck size={18} />,
      dataKey: "presentToday",
      gradient: ["#ede9fe", "#8b5cf6", "#5b21b6"], // lavender → deep purple
      
      bg: "bg-purple-50",
    },
    {
      title: "Absent",
      value: absent,
      icon: <UserX size={18} />,
      dataKey: "absent",
      gradient: ["#dbeafe", "#3b82f6", "#1e3a8a"], // light blue → navy
      bg: "bg-blue-50",
    },
    {
      title: "Leave",
      value: leave,
      icon: <Calendar size={18} />,
      dataKey: "leave",
      gradient: ["#e0f2fe", "#6366f1", "#312e81"], // soft blue → indigo
      bg: "bg-indigo-50",
    },
  ];

  // Limit to last 7 days + dynamic values
  const chartData = attendanceData.slice(-7).map((d) => ({
    ...d,
    absent: (d.totalEmployees || 0) - (d.presentToday || 0),
  }));

  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            {/* Left Info */}
            <div
              className={`${item.bg} px-4 py-6 flex flex-col justify-center items-center min-w-[90px]`}
            >
              <span className="text-xs text-gray-500">{item.title}</span>
              <h3 className="text-xl font-bold text-gray-800">{item.value}</h3>
            </div>

            {/* Chart */}
            <div className="flex-1 h-[80px] px-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    {/* Multi-color Line Gradient */}
                    <linearGradient
                      id={`line-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor={item.gradient[0]} />
                      <stop offset="50%" stopColor={item.gradient[1]} />
                      <stop offset="100%" stopColor={item.gradient[2]} />
                    </linearGradient>

                    {/* Soft Area Gradient */}
                    <linearGradient
                      id={`area-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={item.gradient[1]}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={item.gradient[2]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  {/* Area (adds modern feel) */}
                  <Area
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke="none"
                    fill={`url(#area-${index})`}
                  />

                  {/* Line */}
                  <Line
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={`url(#line-${index})`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />

                  {/* Last Point Highlight */}
                  <Line
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke="transparent"
                    dot={(props) => {
                      const { cx, cy, index: i } = props;
                      const isLast = i === chartData.length - 1;

                      if (!isLast) return null;

                      return (
                        <>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={8}
                            fill={item.gradient[1]}
                            opacity={0.15}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4.5}
                            fill={item.gradient[1]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        </>
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
