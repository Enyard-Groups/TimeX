import { PieChart } from "@mui/x-charts/PieChart";

const DonutChart = ({ attendanceData }) => {
  const latest = attendanceData?.[attendanceData.length - 1] || {};

  const earlyin = Number(latest?.earlyin) || 0;
  const latein = Number(latest?.latein) || 0;

  const total = earlyin + latein;

  const chartData =
    total === 0
      ? [
          {
            id: 0,
            value: 1,
            label: "No Data",
            color: "oklch(0.923 0.003 48.717)", // border gray
          },
        ]
      : [
          {
            id: 0,
            value: earlyin,
            label: "Early In",
            color: "oklch(0.645 0.246 16.439)",
          },
          {
            id: 1,
            value: latein,
            label: "Late In",
            color: "oklch(0.723 0.003 48.717)", // primary accent
          },
        ];

  return (
    <div
      className="
     
        relative
        flex flex-col items-center
        transition-all duration-300
        hover:shadow-lg 
      "
    >
      <div className="relative">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.645 0.246 16.439 / 0.4), transparent 70%)",
          }}
        />

        <PieChart
          series={[
            {
              data: chartData,
              innerRadius: 60,
              outerRadius: 90,
              paddingAngle: 4,
              cornerRadius: 8,
              startAngle: -90,
              endAngle: 90,
              cx: 125,
              cy: 120,
            },
          ]}
          width={250}
          height={120}
          slotProps={{
            legend: { hidden: true },
            tooltip: { trigger: "item" },
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-20">
          <p className="text-sm text-[oklch(0.147_0.004_49.25)]/60 tracking-wide">
            TOTAL
          </p>

          <p className="text-3xl font-bold text-[oklch(0.645_0.246_16.439)]">
            {total}
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6 text-sm ">
        <div className="flex gap-1 px-2 py-1 rounded-xl">
          <span
            className="w-3 h-3 rounded-full mt-1"
            style={{ background: "oklch(0.645 0.246 16.439)" }}
          />
          <span className="text-[oklch(0.147_0.004_49.25)] whitespace-nowrap">
            Early In ({earlyin})
          </span>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-xl">
          <span className="w-3 h-3 rounded-full bg-[oklch(0.723_0.003_48.717)]" />
          <span className="text-[oklch(0.147_0.004_49.25)] whitespace-nowrap">
            Late In ({latein})
          </span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
