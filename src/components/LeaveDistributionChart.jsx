import Chart from "react-apexcharts";

const LeaveDistributionChart = () => {
 const leaveData = [
    { type: "Sick Leave", value: 18 },
    { type: "Paid Leave", value: 24 },
    { type: "Casual Leave", value: 12 },
    { type: "Unpaid Leave", value: 6 },
  ];

  const series = leaveData.map((item) => item.value);

  const options = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },

    labels: leaveData.map((item) => item.type),

    colors: [
      "oklch(0.72 0.246 16.439)",
      "oklch(0.42 0.245 27.325)",
      "oklch(0.25 0.12 160)",
      "oklch(0.35 0.04 260)",
    ],

    legend: {
      position: "top",
      fontSize: "13px",
    },

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      pie: {
        donut: {
          size: "50%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => series.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },

    stroke: {
      width: 0,
    },
  };

  return (
    <div
      className="
      h-[450px]
     hover:scale-105 active:scale-95 transition-all duration-300
      bg-white/60 backdrop-blur-xl
      border border-white/60
      rounded-3xl
      p-6
      shadow-[0_10px_40px_rgba(0,0,0,0.06)]
    "
    >
      <h2
        className="text-md font-semibold mb-6 text-center"
        style={{ color: "oklch(0.5 0.004 49.25)" }}
      >
        Leave Distribution
      </h2>

      <Chart cl options={options} series={series} type="donut" height={320} />
    </div>
  );
};

export default LeaveDistributionChart;
