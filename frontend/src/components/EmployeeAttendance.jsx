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
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

    // We want Monday (1) to be our first visible day.
    // We'll create a 7-item array where index 0 is a hidden "start" buffer.
    const weekNames = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek;

    const recentHistory = attendanceData.slice(-currentDayIndex);

    return weekNames.map((dayName, index) => {
      // Hidden buffer point (index 0) to force a line segment on Monday
      if (index === 0) {
        const firstData = recentHistory[0] || {};
        return {
          day: "",
          presentToday: firstData.presentToday || 0,
          absent:
            (firstData.totalEmployees || 0) - (firstData.presentToday || 0),
          leave: firstData.leave || 0,
          isToday: false,
          isBuffer: true, // Mark this so we can hide the dot
        };
      }

      // Days with actual data
      if (index <= currentDayIndex && recentHistory[index - 1]) {
        const d = recentHistory[index - 1];
        return {
          day: dayName,
          presentToday: d.presentToday ?? 0,
          absent: (d.totalEmployees || 0) - (d.presentToday || 0),
          leave: d.leave ?? 0,
          isToday: index === currentDayIndex,
        };
      }
      // return {
      //   day: dayName,
      //   presentToday: 0,
      //   absent: 0,
      //   leave: 0,
      //   isToday: false,
      // };
      return {
        day: dayName,
        presentToday: null,
        absent: null,
        leave: null,
        isToday: false,
      };
    });
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
            className="bg-white rounded-xl shadow-sm flex items-center justify-between overflow-hidden relative h-[100px] border border-gray-200"
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
                {Math.min(Math.abs(item.percentage),100)}%
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
              <span className={`${item.iconbg} p-2 rounded-full`}>
                {item.icon}
              </span>
            </div>

            <div className="flex-1 h-full pt-12 pb-1 pr-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ left: -20, right: 10, bottom: 4, top: 10 }}
                >
                  <Area
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={3}
                    fill={`url(#grad-${index})`}
                    connectNulls={false}
                    isAnimationActive={true}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.isToday && payload[item.dataKey] !== null) {
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
