import React from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData }) => {
  const options = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    grid: {
      borderColor: "oklch(0.923 0.003 48.717)",
      strokeDashArray: 4,
    },

    dataLabels: {
      enabled: true,
      enabledOnSeries: [1, 3],
      offsetY: -3,
      style: {
        fontSize: "10px",
        colors: ["oklch(0.147 0.004 49.25)"],
        fontWeight: 600,
      },
      background: {
        enabled: false,
      },
    },

    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: "#fff",
      hover: {
        size: 6,
      },
    },

    xaxis: {
      categories: attendanceData.map((item) => item.day),
      labels: {
        style: {
          colors: "oklch(0.147 0.004 49.25)",
        },
      },
      axisBorder: {
        color: "oklch(0.923 0.003 48.717)",
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "oklch(0.147 0.004 49.25)",
        },
      },
    },

    tooltip: {
      theme: "light",
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "oklch(0.147 0.004 49.25)",
      },
    },

    colors: [
      "oklch(0.4 0.003 48.717)",
      "oklch(0.45 0.246 16.439)",
      "oklch(0.25 0.245 27.325)",
      "oklch(0.2 0.02 260)",
    ],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: [
          "oklch(0.9 0.003 48.717)",
          "oklch(0.845 0.246 16.439)",
          "oklch(0.577 0.245 27.325)",
          "oklch(0.6 0.02 260)",
        ],
        stops: [50, 100],
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
  };

  const series = [
    {
      name: "Total",
      data: attendanceData.map((item) => item.total),
    },
    {
      name: "Present",
      data: attendanceData.map(
        (item) => item.total - (item.absent + item.leave),
      ),
    },
    {
      name: "Absent",
      data: attendanceData.map((item) => item.absent),
    },
    {
      name: "Leave",
      data: attendanceData.map((item) => item.leave),
    },
  ];

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "oklch(0.98 0.001 106.424)",
      }}
    >
      <Chart options={options} series={series} type="line" height={240} />
    </div>
  );
};

export default AttendanceLineChart;
