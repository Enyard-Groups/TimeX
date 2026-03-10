import React from "react";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";

const EmployeeAttendance = ({ attendanceData }) => {
  const latest = attendanceData[attendanceData.length - 1] || {};

  const total = latest.total || 0;
  const absent = latest.absent || 0;
  const leave = latest.leave || 0;
  const present = total - (absent + leave);

  const stats = [
    {
      title: "Total Employee",
      value: total,
      icon: <Users size={20} />,
      primary: true,
    },
    {
      title: "Total Presents",
      value: present,
      icon: <UserCheck size={20} />,
    },
    {
      title: "Total Absents",
      value: absent,
      icon: <UserX size={20} />,
    },
    {
      title: "Total Leave",
      value: leave,
      icon: <Calendar size={20} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-[300px]">
      {stats.map((item, index) => (
        <div
          key={index}
          className="rounded-xl p-5 flex justify-between items-start shadow-sm"
          style={
            item.primary
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.645 0.246 16.439), oklch(0.72 0.22 16.439))",
                  color: "oklch(0.97 0.001 106.424)",
                }
              : { background: "oklch(0.97 0.001 106.424)" }
          }
        >
          <div>
            <p
              className={`text-sm ${
                item.primary
                  ? "text-oklch(0.97 0.001 106.424)/80"
                  : "text-gray-500"
              }`}
            >
              {item.title}
            </p>

            <h2
              className={`text-2xl font-semibold mt-2 ${
                item.primary
                  ? "text-oklch(0.97 0.001 106.424)"
                  : "text-gray-800"
              }`}
            >
              {item.value}
            </h2>
          </div>

          <div
            className="p-2 rounded-full"
            style={
              item.primary
                ? {
                    background: "rgba(255,255,255,0.2)",
                    color: "oklch(0.97 0.001 106.424)",
                  }
                : {
                    background: "oklch(0.95 0.02 16.439)",
                    color: "oklch(0.645 0.246 16.439)",
                  }
            }
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeAttendance;
