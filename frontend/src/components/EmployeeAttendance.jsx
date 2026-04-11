import React from "react";
import { UserCheck, UserX, Calendar } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart } from "recharts";

const EmployeeAttendance = ({ attendanceData = [] }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};
  const total = Number(latest?.totalEmployees) || 0;
  const present = Number(latest?.presentToday) || 0;
  const leave = Number(latest?.leave) || 0;
  const absent = Math.max(0, total - (present + leave));

  const getWeeklyProgressData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

    // Sunday reset: If Sunday, show a flat line at 0
    if (dayOfWeek === 0)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({
        day: d,
        presentToday: 0,
        absent: 0,
        leave: 0,
        isLast: false,
      }));

    const currentDayIndex = dayOfWeek - 1; // Mon=0, Tue=1...
    const recentHistory = attendanceData.slice(-(currentDayIndex + 1));

    // Create a full Mon-Sat array
    const weekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (dayName, index) => {
        // If the day has passed or is today, use real data
        if (index <= currentDayIndex && recentHistory[index]) {
          const d = recentHistory[index];
          return {
            day: dayName,
            presentToday: d.presentToday || 0,
            absent: (d.totalEmployees || 0) - (d.presentToday || 0),
            leave: d.leave || 0,
            isToday: index === currentDayIndex, // Logic for the marker
          };
        }
        // Future days: Set values to 0 so the line drops to the bottom
        return {
          day: dayName,
          presentToday: 10,
          absent: 5,
          leave: 3,
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
      icon: <UserCheck />,
      dataKey: "presentToday",
      color: "#2563EB",
      bg: "bg-[#DBEAFE]",
      text: "text-[#0049a8]",
    },
    {
      title: "Absent",
      value: absent,
      icon: <UserX />,
      dataKey: "absent",
      color: "#EF4444",
      bg: "bg-[#FEE2E2]",
      text: "text-[#890000]",
    },
    {
      title: "Leave",
      value: leave,
      icon: <Calendar />,
      dataKey: "leave",
      color: "#06B6D4",
      bg: "bg-[#E0F2FE]",
      text: "text-[#004e82]",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md flex items-center justify-between overflow-hidden relative h-[100px] border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 absolute top-2 left-26 z-20">
              {item.value}
            </h3>

            {/* Left Header Info */}
            <div
              className={`${item.bg} ${item.text} h-full flex flex-col justify-center items-center min-w-[90px] z-10`}
            >
              <span className="text-sm font-medium mb-2">{item.title}</span>
              <span>{item.icon}</span>
            </div>

            {/* Progress Chart */}
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
                    style={{ outline: "none" }}
                    className="focus:outline-none"
                    isAnimationActive={true}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      // Only render the marker dot on the "Current Day" node
                      if (payload.isToday) {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth={2}
                            style={{
                              filter:
                                "drop-shadow(0px 2px 2px rgba(0,0,0,0.2))",
                            }}
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
