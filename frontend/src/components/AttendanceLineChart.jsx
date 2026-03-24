import React from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData }) => {
  const formattedData = attendanceData.map((item) => {
    const total = Number(item.totalEmployees) || 0;
    const present = Number(item.presentToday) || 0;
    const absent = Math.max(0, total - present);

    const day = item.date
      ? new Date(item.date).toLocaleDateString("en-IN", {
          weekday: "short",
        })
      : "Today";

    const leave = item.leave || 0;
    const latein = item.latein || 0;
    const earlyin = item.earlyin || 0;

    return {
      day,
      total,
      leave,
      absent,
      latein,
      earlyin,
    };
  });

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
      padding: {
        left: 10,
        right: 10,
      },
    },

    dataLabels: {
      enabled: false,
    },

    markers: {
      size: 0,
      strokeWidth: 2,
      strokeColors: "#fff",
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
      style: {
        fontSize: "12px",
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      labels: {
        colors: "#64748b",
      },
    },

    colors: ["oklch(0.645 0.246 16.439)"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["oklch(0.745 0.246 16.439)"],
        stops: [0, 100],
        opacityFrom: 0.7,
        opacityTo: 0.05,
      },
    },
  };

  const series = [
    {
      name: "Present",
      data: formattedData.map(
        (item) => item.total - (item.absent + item.leave),
      ),
    },
  ];

  return (
    <div className="py-4 bg-white">
      <Chart options={options} series={series} type="area" height={205} />
    </div>
  );
};

export default AttendanceLineChart;
