import React from "react";
import { UserCheck, UserX, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart } from "recharts";

const EmployeeAttendance = ({ attendanceData = [] }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};
  const previous = attendanceData?.[attendanceData.length - 7] || {}; // Data from 7 days ago

  const total = Number(latest?.totalEmployees) || 0;
  const present = Number(latest?.presentToday) || 0;
  const leave = Number(latest?.leave) || 0;
  const absent = Math.max(0, total - (present + leave));

  // Helper to calculate percentage change
  const getPercentage = (current, prev) => {
    if (!prev || prev === 0) return 0;
    const diff = ((current - prev) / prev) * 100;
    return Math.round(diff);
  };

  const getWeeklyProgressData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (dayOfWeek === 0)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({
        day: d,
        presentToday: 0,
        absent: 0,
        leave: 0,
        isLast: false,
      }));

    const currentDayIndex = dayOfWeek - 1;
    const recentHistory = attendanceData.slice(-(currentDayIndex + 1));

    const weekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (dayName, index) => {
        if (index <= currentDayIndex && recentHistory[index]) {
          const d = recentHistory[index];
          return {
            day: dayName,
            presentToday: d.presentToday || 0,
            absent: (d.totalEmployees || 0) - (d.presentToday || 0),
            leave: d.leave || 0,
            isToday: index === currentDayIndex,
          };
        }
        return {
          day: dayName,
          presentToday: 0,
          absent: 0,
          leave: 0,
          isToday: false,
        };
      },
    );

    return weekData;
  };

  const chartData = getWeeklyProgressData();

  const stats = [
    {
      title: "Present",
      value: present,
      percentage: getPercentage(present, previous?.presentToday),
      icon: <UserCheck size={20} />,
      dataKey: "presentToday",
      color: "#2563EB",
      bg: "bg-[#b2d3fe]",
      iconbg: "bg-[#DBEAFE]",
      text: "text-[#0049a8]",
    },
    {
      title: "Absent",
      value: absent,
      percentage: getPercentage(
        absent,
        previous?.totalEmployees - previous?.presentToday,
      ),
      icon: <UserX size={20} />,
      dataKey: "absent",
      color: "#EF4444",
      bg: "bg-[#ffcfcf]",
      iconbg: "bg-[#FEE2E2]",
      text: "text-[#890000]",
    },
    {
      title: "Leave",
      value: leave,
      percentage: getPercentage(leave, previous?.leave),
      icon: <Calendar size={20} />,
      dataKey: "leave",
      color: "#06B6D4",
      bg: "bg-[#b8e3ff]",
      iconbg: "bg-[#E0F2FE]",
      text: "text-[#004e82]",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-sm shadow-md flex items-center justify-between overflow-hidden relative h-[90px] border border-gray-200"
          >
            {/* Top Right Percentage Indicator */}
            <div className="absolute top-2 right-2 flex flex-col items-center gap-0.5 text-[10px] font-bold">
              <div
                className={`flex flex-row ${item.percentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {item.percentage >= 0 ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                {Math.abs(item.percentage)}%
              </div>

              <p className="text-gray-500">this week</p>
            </div>

            <h3 className="text-lg font-bold text-gray-800 absolute top-2 left-26 z-20">
              {item.value}
            </h3>

            <div
              className={`${item.bg} ${item.text} h-full flex flex-col justify-center items-center min-w-[90px] z-10`}
            >
              <span className="text-xs font-medium mb-2">{item.title}</span>
              <span className={`${item.iconbg} p-2 rounded-full`}>{item.icon}</span>
            </div>

            <div className="flex-1 h-full pt-12 pb-1 pr-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ left: 7, right: 7, bottom: 4, top: 4 }}
                >
                  <defs>
                    <linearGradient
                      id={`grad-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={item.color}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={item.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={3}
                    fill={`url(#grad-${index})`}
                    isAnimationActive={true}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.isToday) {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        );
                      }
                      return null;
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
