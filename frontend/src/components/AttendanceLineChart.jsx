import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = {
  Present: "#2563EB",
  Absent: "#EF4444",
  Leave: "#06B6D4",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#334155" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              display: "inline-block",
            }}
          />
          <span style={{ color: "#64748b" }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: 16,
      paddingRight: 16,
      paddingBottom: 4,
    }}
  >
    {payload?.map((p) => (
      <div
        key={p.value}
        style={{ display: "flex", alignItems: "center", gap: 5 }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: p.color,
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
          {p.value}
        </span>
      </div>
    ))}
  </div>
);

const AttendanceLineChart = ({ attendanceData = [] }) => {
  const [range, setRange] = useState("7d");

  const processedData = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return [];

    const filteredData = attendanceData.filter((item) => {
      const day = new Date(item.date).getDay();
      return day !== 0;
    });

    if (range === "7d" || range === "15d" || range === "1m") {
      const sliceSize = range === "7d" ? -6 : range === "15d" ? -15 : -30;
      return filteredData.slice(sliceSize).map((item) => {
        const dateObj = new Date(item.date);
        return {
          label:
            range === "7d"
              ? dateObj.toLocaleDateString("en-IN", { weekday: "short" })
              : dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                }),
          Present: item.presentToday,
          Absent: item.totalEmployees - item.presentToday,
          Leave: item.leave,
        };
      });
    }

    if (range === "1y") {
      const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec",
      ];
      const months = {};
      filteredData.slice(-312).forEach((item) => {
        const dateObj = new Date(item.date);
        const monthLabel = monthNames[dateObj.getMonth()];
        if (!months[monthLabel]) {
          months[monthLabel] = { Present: 0, Absent: 0, Leave: 0, count: 0 };
        }
        months[monthLabel].Present += item.presentToday;
        months[monthLabel].Absent += item.totalEmployees - item.presentToday;
        months[monthLabel].Leave += item.leave;
        months[monthLabel].count += 1;
      });
      return monthNames
        .filter((name) => months[name])
        .map((name) => ({
          label: name,
          Present: Math.round(months[name].Present / months[name].count),
          Absent: Math.round(months[name].Absent / months[name].count),
          Leave: Math.round(months[name].Leave / months[name].count),
        }));
    }

    if (range === "3y") {
      const years = {};
      filteredData.slice(-939).forEach((item) => {
        const yearLabel = new Date(item.date).getFullYear().toString();
        if (!years[yearLabel]) {
          years[yearLabel] = { Present: 0, Absent: 0, Leave: 0, count: 0 };
        }
        years[yearLabel].Present += item.presentToday;
        years[yearLabel].Absent += item.totalEmployees - item.presentToday;
        years[yearLabel].Leave += item.leave;
        years[yearLabel].count += 1;
      });
      return Object.keys(years)
        .sort()
        .map((y) => ({
          label: y,
          Present: Math.round(years[y].Present / years[y].count),
          Absent: Math.round(years[y].Absent / years[y].count),
          Leave: Math.round(years[y].Leave / years[y].count),
        }));
    }

    return [];
  }, [attendanceData, range]);

  if (processedData.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed border-slate-200">
        No data available
      </div>
    );
  }

  const isRotated = range === "15d" || range === "1m";

  return (
    <div className="w-full h-full bg-white rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h3 className="text-md font-bold text-slate-800 p-6">
          Attendance Overview
        </h3>
        <div className="flex bg-slate-100 p-1 m-4 rounded-xl">
          {["7d", "15d", "1m", "1y", "3y"].map((val) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                range === val
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {val.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — ResponsiveContainer is the key, same as EmployeeAttendance */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={processedData}
          margin={{ top: 10, right: 20, left: 40, bottom: isRotated ? 30 : 10 }}
        >
          <defs>
            <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="20%" stopColor={COLORS.Present} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.Present} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="20%" stopColor={COLORS.Absent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.Absent} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gradLeave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="20%" stopColor={COLORS.Leave} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.Leave} stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} horizontal={false} />

          <XAxis
            dataKey="label"
            tick={{
              fontSize: 11,
              fill: "#94a3b8",
              fontWeight: 600,
            }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            angle={isRotated ? -45 : 0}
            textAnchor={isRotated ? "end" : "middle"}
            height={isRotated ? 55 : 30}
          />

          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            content={<CustomLegend />}
            verticalAlign="top"
            align="right"
          />

          {Object.entries(COLORS).map(([key, color]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={3}
              fill={`url(#grad${key})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: color,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceLineChart;