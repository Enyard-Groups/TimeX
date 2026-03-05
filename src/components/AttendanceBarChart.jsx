import React from "react";
import Chart from "react-apexcharts";

const AttendanceBarChart = ({attendanceData}) => {
 
  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: false,
    },

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 10,
        borderRadiusApplication: "end",
      },
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    xaxis: {
      categories: attendanceData.map((item) => item.day),
    },

    legend: {
      position: "bottom",
    },
  };

  const series = [
    {
      name: "Total",
      data: attendanceData.map((item) => item.total),
      color: "oklch(0.8 0.003 48.717)",
    },
    {
      name: "Present",
      data: attendanceData.map(
        (item) => item.total - (item.absent + item.leave),
      ),
      color: " oklch(0.5 0.246 16.439)",
    },
    {
      name: "Absent",
      data: attendanceData.map((item) => item.absent),
      color: "oklch(0.6 0.245 27.325)",
    },
    {
      name: "Leave",
      data: attendanceData.map((item) => item.leave),
      color: "oklch(0.147 0.004 49.25)",
    },
  ];

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default AttendanceBarChart;
