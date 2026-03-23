import React from "react";
import Chart from "react-apexcharts";

const AttendanceLineChart = ({ attendanceData }) => {
  const formattedData = attendanceData?.map((item) => {
    const total = Number(item.totalEmployees) || 0;
    const present = Number(item.presentToday) || 0;
    const absent = Math.max(0, total - present);
    const day = new Date(item.date).toLocaleDateString("en-IN", {
      weekday: "long",
    });
    const leave = item.leave;
    const latein = item.latein;
    const earlyin = item.earlyin;

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
      enabled: false,
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
      categories: formattedData.map((item) => item.day),
    },

    tooltip: {
      theme: "light",
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
    },

    colors: ["oklch(0.65 0.246 16.439)"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["oklch(0.85 0.08 95)"],
        stops: [0, 100],
        opacityFrom: 0.8,
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
    <div className="py-6 rounded-2xl">
      <Chart options={options} series={series} type="area" height={240} />
    </div>
  );
};

export default AttendanceLineChart;
