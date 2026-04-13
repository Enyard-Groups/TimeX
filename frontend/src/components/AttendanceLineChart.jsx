import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData = [] }) => {
  const [range, setRange] = useState("7d");

  const processedData = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return [];

    // Filter out Sundays first to ensure they don't impact averages or counts
    const filteredData = attendanceData.filter((item) => {
      const day = new Date(item.date).getDay();
      return day !== 0; // 0 is Sunday
    });

    // 1. Daily/Weekly Views (7d, 15d, 1m)
    if (range === "7d" || range === "15d" || range === "1m") {
      const sliceSize = range === "7d" ? -7 : range === "15d" ? -15 : -30;
      return filteredData.slice(sliceSize).map((item) => {
        const dateObj = new Date(item.date);
        return {
          label:
            range === "7d"
              ? dateObj.toLocaleDateString("en-IN", { weekday: "short" })
              : dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                }),
          present: item.presentToday,
          absent: item.totalEmployees - item.presentToday,
          leave: item.leave,
        };
      });
    }

    // 2. 1 Year View - Aggregated by Month
    if (range === "1y") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const months = {};

      // Take last 365 available non-Sunday days
      filteredData.slice(-312).forEach((item) => {
        // ~312 working days in a year
        const dateObj = new Date(item.date);
        const monthLabel = monthNames[dateObj.getMonth()];

        if (!months[monthLabel]) {
          months[monthLabel] = { present: 0, absent: 0, leave: 0, count: 0 };
        }
        months[monthLabel].present += item.presentToday;
        months[monthLabel].absent += item.totalEmployees - item.presentToday;
        months[monthLabel].leave += item.leave;
        months[monthLabel].count += 1;
      });

      return monthNames
        .filter((name) => months[name])
        .map((name) => ({
          label: name,
          present: Math.round(months[name].present / months[name].count),
          absent: Math.round(months[name].absent / months[name].count),
          leave: Math.round(months[name].leave / months[name].count),
        }));
    }

    // 3. 3 Year View - Aggregated by Year
    if (range === "3y") {
      const years = {};
      filteredData.slice(-939).forEach((item) => {
        // ~939 working days in 3 years
        const yearLabel = new Date(item.date).getFullYear().toString();

        if (!years[yearLabel]) {
          years[yearLabel] = { present: 0, absent: 0, leave: 0, count: 0 };
        }
        years[yearLabel].present += item.presentToday;
        years[yearLabel].absent += item.totalEmployees - item.presentToday;
        years[yearLabel].leave += item.leave;
        years[yearLabel].count += 1;
      });

      return Object.keys(years)
        .sort()
        .map((y) => ({
          label: y,
          present: Math.round(years[y].present / years[y].count),
          absent: Math.round(years[y].absent / years[y].count),
          leave: Math.round(years[y].leave / years[y].count),
        }));
    }

    return [];
  }, [attendanceData, range]);

  // ... (Keep rest of the component Chart options and JSX the same)

  if (processedData.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed border-slate-200">
        No data available (Sundays excluded)
      </div>
    );
  }

  const series = [
    { name: "Present", data: processedData.map((d) => d.present) },
    { name: "Absent", data: processedData.map((d) => d.absent) },
    { name: "Leave", data: processedData.map((d) => d.leave) },
  ];

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#2563EB", "#EF4444", "#06B6D4"],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    xaxis: {
      categories: processedData.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#94a3b8", fontSize: "11px" } } },
    tooltip: { theme: "light" },
    legend: { position: "top", horizontalAlign: "right" },
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h3 className="text-md font-bold text-slate-800">
          Attendance Overview
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["7d", "15d", "1m", "1y", "3y"].map((val) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                range === val
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {val.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default AttendanceLineChart;
