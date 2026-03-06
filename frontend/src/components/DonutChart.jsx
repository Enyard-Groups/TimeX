import { PieChart } from "@mui/x-charts/PieChart";

const DonutChart = ({attendanceData}) => {

  const latest = attendanceData?.[attendanceData.length - 1] || {};

  const earlyin = Number(latest?.earlyin) || 0;
  const latein = Number(latest?.latein) || 0;

  const total = earlyin + latein;

  // If no data, show neutral placeholder
  const chartData =
    total === 0
      ? [
          {
            id: 0,
            value: 1,
            label: "No Data",
            color: "#E5E7EB", // gray
          },
        ]
      : [
          {
            id: 0,
            value: earlyin,
            label: "Early In",
            color: "#5B8DEF", // blue
          },
          {
            id: 1,
            value: latein,
            label: "Late In",
            color: "#FF6B6B", // red
          },
        ];

  return (
    <div
      className="
        relative
        bg-white/60 backdrop-blur-xl
        border border-white/60
        rounded-3xl
        p-6
        shadow-[0_10px_40px_rgba(0,0,0,0.06)]
        flex flex-col items-center
      "
    >
      <div className="relative">
        <PieChart
          series={[
            {
              data: chartData,
              innerRadius: 55,
              outerRadius: 95,
              paddingAngle: 3,
              cornerRadius: 6,
            },
          ]}
          width={240}
          height={240}
          slotProps={{
            legend: { hidden: true },
            tooltip: { trigger: "none" },
          }}
        />

        {/* Center Total */}
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-md text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-800">{total}</p>
          </div>
        )}
      </div>

      {/* Custom Legend */}
      {total > 0 && (
        <div className="flex justify-center gap-6 mt-6 text-md">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#5B8DEF" }}
            />
            Early In ({earlyin})
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#FF6B6B" }}
            />
            Late In ({latein})
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
