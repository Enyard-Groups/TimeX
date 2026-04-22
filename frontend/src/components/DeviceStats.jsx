import React from "react";
import Chart from "react-apexcharts";
import { FaFingerprint, FaMobileAlt } from "react-icons/fa";
import { FaDesktop } from "react-icons/fa6";
import { useSelector } from "react-redux";

const formatDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const DeviceStats = () => {
  const records = useSelector((state) => state.record);
  const today = formatDate(new Date());

  const todayRecords = records.filter((user) => {
    return user.date === today;
  });

  // Count devices from both checkin and checkout
  const deviceCount = {
    mobile: 0,
    desktop: 0,
    biometric: 0,
  };

  let totalActions = 0;

  todayRecords.forEach((user) => {
    // Check Check-in Device
    if (
      user.checkinDevice &&
      Object.prototype.hasOwnProperty.call(deviceCount, user.checkinDevice)
    ) {
      deviceCount[user.checkinDevice] += 1;
      totalActions += 1;
    }
    // Check Check-out Device
    if (
      user.checkoutDevice &&
      Object.prototype.hasOwnProperty.call(deviceCount, user.checkoutDevice)
    ) {
      deviceCount[user.checkoutDevice] += 1;
      totalActions += 1;
    }
  });

  const isEmpty = totalActions === 0; 

  const divisor = totalActions || 1;

  const series = isEmpty
    ? [100]
    : [
        Math.round((deviceCount.mobile / divisor) * 100),
        Math.round((deviceCount.desktop / divisor) * 100),
        Math.round((deviceCount.biometric / divisor) * 100),
      ];

  const options = {
    chart: { type: "donut" },
    labels: isEmpty ? ["No Data"] : ["Mobile", "Desktop", "Biometric"],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: isEmpty ? ["#e2e8f0"] : ["#6366f1", "#3b82f6", "#228eb8"], 
    states: {
      hover: { filter: { type: isEmpty ? "none" : "lighten" } }, 
    },
    tooltip: { enabled: !isEmpty },
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
              fontSize: "14px",
              formatter: () => totalActions, 
            },
          },
        },
      },
    },
  };

  const deviceList = [
    {
      name: "Mobile",
      value: isEmpty ? 0 : series[0],
      color: "#6366f1",
      icon: <FaMobileAlt size={21} />,
    },
    {
      name: "Desktop",
      value: isEmpty ? 0 : series[1],
      color: "#3b82f6",
      icon: <FaDesktop />,
    },
    {
      name: "Biometric",
      value: isEmpty ? 0 : series[2],
      color: "#228eb8",
      icon: <FaFingerprint />,
    },
  ];

  return (
    <>
      <h3 className="text-md font-semibold text-gray-700 pl-5 pt-5 ml-2">
        Device
      </h3>
      <div className="flex justify-center overflow-hidden">
        <div className="bg-white rounded-xl px-4 h-[350px] w-full max-w-sm">
          <div className="flex justify-center">
            <Chart options={options} series={series} type="donut" width={280} />
          </div>
          <div className="mt-4 space-y-2">
            {deviceList.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[16px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-md"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="text-gray-800 font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeviceStats;
