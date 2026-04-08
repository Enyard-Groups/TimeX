import React, { useState } from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData = [] }) => {
  const [range, setRange] = useState("7d");

  //  If no data at all
  if (!attendanceData || attendanceData.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 bg-white rounded-xl">
        No attendance data available
      </div>
    );
  }

  //  Filter Data (with fallback)
  const getFilteredData = () => {
    const data = [...attendanceData];

    let filtered = [];

    switch (range) {
      case "7d":
        filtered = data.slice(-7);
        break;
      case "15d":
        filtered = data.slice(-15);
        break;
      case "1m":
        filtered = data.slice(-30);
        break;
      case "1y":
        filtered = data.slice(-365);
        break;
      case "3y":
        filtered = data.slice(-365 * 3);
        break;
      default:
        filtered = data;
    }

    //  fallback to all data if empty
    return filtered.length > 0 ? filtered : data;
  };

  const filteredData = getFilteredData();
  const isEmptyRange = filteredData.length === 0;

  //  Format Data
  const formattedData = filteredData.map((item) => {
    const total = Number(item.totalEmployees) || 0;
    const present = Number(item.presentToday) || 0;
    const absent = Math.max(0, total - present);

    const day = item.date
      ? new Date(item.date).toLocaleDateString("en-IN", {
          weekday: "short",
        })
      : "Today";

    return {
      day,
      total,
      leave: item.leave || 0,
      absent,
    };
  });

  //  Series
  const series = [
    {
      name: "Present",
      data: formattedData.map(
        (item) => item.total - (item.absent + item.leave),
      ),
    },
    {
      name: "Absent",
      data: formattedData.map((item) => item.absent),
    },
    {
      name: "Leave",
      data: formattedData.map((item) => item.leave),
    },
  ];

  //  Chart Options
  const options = {
    chart: {
      type: "area",
      height: 190,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      padding: { left: 10, right: 10 },
    },

    dataLabels: {
      enabled: false,
    },

    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },

    xaxis: {
      categories: formattedData.map((item) => item.day),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
        },
      },
    },

    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `${val} employees`,
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      labels: {
        colors: "#64748b",
      },
    },

    // colors: ["#8061c9", "#1f7dff", "#274bcd"],
    colors: ["#2563EB", "#EF4444", "#06B6D4"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        // gradientToColors: ["#dbeafe", "#ede9fe", "#e0f2fe"],
        gradientToColors: ["#DBEAFE", "#FEE2E2", "#E0F2FE"], // match bg colors
        opacityFrom: 0.7,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
  };

  return (
    <div className="py-4 bg-white rounded-xl">
      {/*  Filter Buttons */}
      <div className="sm:flex sm:justify-between">
        <h3 className="text-[16px] lg:text-[20px] 3xl:text-[22px] font-semibold text-gray-700 ml-5 mb-3">
          Attendance Overview
        </h3>
        <div className="flex sm:gap-2 mb-3 px-3">
          {[
            { label: "7D", value: "7d" },
            { label: "15D", value: "15d" },
            { label: "1M", value: "1m" },
            { label: "1Y", value: "1y" },
            { label: "3Y", value: "3y" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setRange(btn.value)}
              className={`px-3 py-1 text-xs lg:text-[15px] 3xl:text-lg rounded-lg transition-all ${
                range === btn.value
                  ? "bg-[#042b6a] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/*  Optional warning */}
      {isEmptyRange && (
        <div className="text-xs lg:text-sm 3xl:text-lg text-red-400 text-right mb-2">
          No data for selected range
        </div>
      )}

      {/*  Chart */}
      <Chart options={options} series={series} type="area" height={360} />
    </div>
  );
};

export default AttendanceLineChart;
