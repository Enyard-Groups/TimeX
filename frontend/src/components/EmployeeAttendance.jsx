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
      title: "Total Employee",
      color: "bg-gradient-to-r from-gray-300 to-gray-600",
      value: total,
      percent: 100,
      icon: <Users size={20} />,
    },
    {
      title: "Total Presents",
      color:
        "bg-gradient-to-r from-[oklch(0.99_0.15_25)] to-[oklch(0.50_0.25_25)]",
      value: present,
      percent: total ? (present / total) * 100 : 0,
      icon: <UserCheck size={20} />,
    },
    {
      title: "Total Absents",
      color:
        "bg-gradient-to-r from-[oklch(0.9_0.15_25)] to-[oklch(0.45_0.25_25)]",
      value: absent,
      percent: total ? (absent / total) * 100 : 0,
      icon: <UserX size={20} />,
    },
    {
      title: "Total Leave",
      color:
        "bg-gradient-to-r from-[oklch(0.90_0.1_30)] to-[oklch(0.7_0.18_60)]",
      value: leave,
      percent: total ? (leave / total) * 100 : 0,
      icon: <Calendar size={20} />,
    },
  ];

  return (
    <div className="flex justify-center pb-4">
      <div className="bg-white w-full max-w-xl h-[290px]">
        <div className="space-y-4">
          {stats.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">{item.title}</span>
                <span>{item.value}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden">
                <div
                  className={`h-7 flex items-center justify-end pr-1 text-xs font-semibold text-white ${item.color}`}
                  style={{
                    width: `${
                      item.percent === 0
                        ? 0
                        : item.percent <= 50
                          ? item.percent + 5
                          : item.percent
                    }%`,
                  }}
                >
                  {Math.round(item.percent)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Total Employees: <span className="font-semibold">{total}</span>
          </p>
          <p>
            Day:{" "}
            <span className="font-semibold">
              {latest?.date
                ? new Date(latest.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                  })
                : "-"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
