import React from "react";
import Chart from "react-apexcharts";

const DeviceStats = ({ data = [] }) => {
  // Count devices
  const deviceCount = {
    mobile: 0,
    desktop: 0,
    biometric: 0,
  };

  data.forEach((user) => {
    const device = user.checkinDevice;
    if (Object.prototype.hasOwnProperty.call(deviceCount, device)) {
      deviceCount[device] += 1;
    }
  });

  const total = data.length || 1;

  // Convert to %
  const series = [
    Math.round((deviceCount.mobile / total) * 100),
    Math.round((deviceCount.desktop / total) * 100),
    Math.round((deviceCount.biometric / total) * 100),
  ];

  const options = {
    chart: {
      type: "donut",
    },
    labels: ["Mobile", "Desktop", "Biometric"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    colors: [
      "#6366f1", // indigo
      "#3b82f6", // blue
      "#228eb8", // green
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Devices",
              color: "#64748b",
              fontSize: "15px",
            },
          },
        },
      },
    },
  };

  const deviceList = [
    { name: "Mobile", value: series[0], color: "#6366f1" },
    { name: "Desktop", value: series[1], color: "#3b82f6" },
    { name: "Biometric", value: series[2], color: "#228eb8" },
  ];

  return (
    <div className="flex justify-center overflow-hidden">
      <div className="bg-white rounded-xl p-4 h-[450px] w-full max-w-sm">
        {/* Title */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] lg:text-[18px] 3xl:text-[20px] font-semibold text-gray-700">Device</h3>
        </div>

        {/* Donut Chart */}
        <div className="flex justify-center">
          <Chart options={options} series={series} type="donut" width={280} />
        </div>

        {/* Device List */}
        <div className="mt-4 space-y-2">
          {deviceList.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[16px] xl:text-[17px]">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="text-gray-800 font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceStats;
