import React from "react";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// helper  function to calculate percentage change
function getPercentChange(current, prev) {
  if (!prev || prev === 0) return 0;
  const change = ((current - prev) / prev) * 100;
  return Math.min(100, Math.max(-100, change));
}

function TrendBadge({ pct }) {
  const isUp = pct >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "1px",
        color: isUp ? "#2da45b" : "#d62b2b",
        fontSize: "11px",
        fontWeight: 500,
        borderRadius: "999px",
      }}
    >
      {isUp ? "↑" : "↓"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

const EmployeeAttendance = ({ attendanceData = [] }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};

  const total = Number(latest?.totalEmployees) || 0;
  const present = Number(latest?.presentToday) || 0;
  const leave = Number(latest?.leave) || 0;
  const absent = Math.max(0, total - (present + leave));

  const prevData = attendanceData?.[attendanceData.length - 2] || {};
  const prevPresent = Number(prevData?.presentToday) || 0;
  const prevAbsent = Math.max(0, (prevData?.totalEmployees || 0) - prevPresent);
  const prevLeave = Number(prevData?.leave) || 0;

  const stats = [
    {
      title: "Present",
      value: present,
      icon: <UserCheck size={18} />,
      dataKey: "presentToday",
      color: "#2563EB",
      bg: "bg-[#DBEAFE]",
      pct: getPercentChange(present, prevPresent),
    },
    {
      title: "Absent",
      value: absent,
      icon: <UserX size={18} />,
      dataKey: "absent",
      color: "#EF4444",
      bg: "bg-[#FEE2E2]",
      pct: getPercentChange(absent, prevAbsent),
    },
    {
      title: "Leave",
      value: leave,
      icon: <Calendar size={18} />,
      dataKey: "leave",
      color: "#06B6D4",
      bg: "bg-[#E0F2FE]",
      pct: getPercentChange(leave, prevLeave),
    },
  ];

  // const stats = [
  //   {
  //     title: "Present",
  //     value: present,
  //     icon: <UserCheck size={18} />,
  //     dataKey: "presentToday",
  //     gradient: ["#ede9fe", "#8b5cf6", "#5b21b6"], // lavender → deep purple

  //     bg: "bg-purple-50",
  //   },
  //   {
  //     title: "Absent",
  //     value: absent,
  //     icon: <UserX size={18} />,
  //     dataKey: "absent",
  //     gradient: ["#dbeafe", "#3b82f6", "#1e3a8a"], // light blue → navy
  //     bg: "bg-blue-50",
  //   },
  //   {
  //     title: "Leave",
  //     value: leave,
  //     icon: <Calendar size={18} />,
  //     dataKey: "leave",
  //     gradient: ["#e0f2fe", "#6366f1", "#312e81"], // soft blue → indigo
  //     bg: "bg-indigo-50",
  //   },
  // ];

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
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between overflow-hidden relative h-[100px] border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 absolute top-1 left-26">
              {item.value}
            </h3>
            <div className="absolute top-1 right-1">
              <TrendBadge pct={item.pct} />
              <p className="text-xs text-gray-500">this week</p>
            </div>

            {/* Left Info */}
            <div
              className={`${item.bg} h-full flex flex-col justify-center items-center min-w-[90px]`}
            >
              <span className="text-sm text-gray-500">{item.title}</span>
            </div>

            {/* Chart */}
            <div className="flex-1 h-[80px] px-2 pt-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    {/* Shadow fill gradient top to bottom */}
                    <linearGradient
                      id={`shadowGrad-${item.dataKey}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={item.color}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor={item.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  {/* Line + shadow area */}
                  <Area
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={2.5}
                    fill={`url(#shadowGrad-${item.dataKey})`}
                    dot={false}
                    activeDot={{ r: 5, fill: item.color }}
                  />

                  {/* Dot highlight */}
                  <Line
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke="transparent"
                    dot={(props) => {
                      const { cx, cy, index: i } = props;
                      const isTarget = i === chartData.length - 3;
                      if (!isTarget) return null;
                      return (
                        <>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={8}
                            fill={item.color}
                            opacity={0.15}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4.5}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        </>
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
