import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData = [] }) => {
  const [range, setRange] = useState("7d");

  const processedData = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return [];

    const data = [...attendanceData];

    // 1. Daily/Weekly Views (7d, 15d, 1m)
    if (range === "7d" || range === "15d" || range === "1m") {
      const sliceSize = range === "7d" ? -7 : range === "15d" ? -15 : -30;
      return data.slice(sliceSize).map((item) => {
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

    // 2. 1 Year View - Aggregated by Month (Jan, Feb, Mar...)
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

      data.slice(-365).forEach((item) => {
        const dateObj = new Date(item.date);
        const monthLabel = monthNames[dateObj.getMonth()]; // Get "Jan", "Feb" etc.

        if (!months[monthLabel]) {
          months[monthLabel] = { present: 0, absent: 0, leave: 0, count: 0 };
        }
        months[monthLabel].present += item.presentToday;
        months[monthLabel].absent += item.totalEmployees - item.presentToday;
        months[monthLabel].leave += item.leave;
        months[monthLabel].count += 1;
      });

      // Return in chronological order starting from the earliest month found in the data
      return monthNames
        .filter((name) => months[name])
        .map((name) => ({
          label: name,
          present: Math.round(months[name].present / months[name].count),
          absent: Math.round(months[name].absent / months[name].count),
          leave: Math.round(months[name].leave / months[name].count),
        }));
    }

    // 3. 3 Year View - Aggregated by Year (2024, 2025, 2026)
    if (range === "3y") {
      const years = {};
      data.slice(-1095).forEach((item) => {
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

  if (processedData.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 bg-white rounded-xl">
        No data available
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
    
    dataLabels: {
      enabled: false,
    },
    stroke: { curve: "smooth", width: 3 },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    colors: ["#2563EB", "#EF4444", "#06B6D4"],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [20, 100],
        gradientToColors: ["#DBEAFE", "#FEE2E2", "#E0F2FE"],
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    xaxis: {
      categories: processedData.map((d) => d.label),
      // Ensures only the months/years show without extra ticks
      tickAmount: range === "1y" ? 12 : range === "3y" ? 3 : undefined,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { rotate: -45, style: { colors: "#94a3b8", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#94a3b8", fontSize: "11px" } } },
    tooltip: { theme: "light", x: { show: true } },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      labels: { colors: "#64748b" },
    },
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h3 className="text-lg font-bold text-slate-800">
          Attendance Overview
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["7d", "15d", "1m", "1y", "3y"].map((val) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
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
      <Chart options={options} series={series} type="area" height={345} />
    </div>
  );
};

export default AttendanceLineChart;
