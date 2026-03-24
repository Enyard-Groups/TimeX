import React from "react";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";

const EmployeeAttendance = ({ attendanceData = [] }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};

  const total = Number(latest?.totalEmployees) || 0;
  const present = Number(latest?.presentToday) || 0;
  const absent = Math.max(0, total - present);
  const leave = Number(latest?.leave) || 0;

  const stats = [
    {
      title: "Total Employees",
      color: "from-gray-300 to-gray-700",
      value: total,
      percent: 100,
      icon: <Users size={16} />,
    },
    {
      title: "Present",
      color:
        "from-[oklch(0.945_0.246_16.439)]  to-[oklch(0.645_0.246_16.439)] ",
      value: present,
      percent: total ? (present / total) * 100 : 0,
      icon: <UserCheck size={16} />,
    },
    {
      title: "Absent",
      color: "from-red-400 to-red-600",
      value: absent,
      percent: total ? (absent / total) * 100 : 0,
      icon: <UserX size={16} />,
    },
    {
      title: "On Leave",
      color: "from-gray-200 to-gray-400",
      value: leave,
      percent: total ? (leave / total) * 100 : 0,
      icon: <Calendar size={16} />,
    },
  ];

  return (
    <div className="flex justify-center">
      <div className="bg-white w-full max-w-xl ">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Employee Attendance
          </h2>
          <p className="text-xs text-gray-500">
            {latest?.date
              ? new Date(latest.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "Today"}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {stats.map((item, index) => (
            <div key={index} className="group">
              {/* Title Row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-500">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {Math.round(item.percent)}%
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {item.value}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition" />

                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                  style={{
                    width: `${
                      item.percent === 0
                        ? 0
                        : item.percent <= 50
                          ? item.percent + 5
                          : item.percent
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
