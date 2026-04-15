import React, { useState, useEffect } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear + 150 - 1930 + 1 },
  (_, i) => 1930 + i,
);

export default function SpinnerDatePicker({ value, onChange, onClose }) {
  /* ---------- Improved Parsing ---------- */
  const parseInitialDate = () => {
    if (value instanceof Date) return value;
    if (typeof value === "string" && value.includes("/")) {
      const [d, m, y] = value.split("/");
      // Ensure we don't create an "Invalid Date"
      const parsed = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  const [baseDate] = useState(parseInitialDate);

  const [tempDay, setTempDay] = useState(
    String(baseDate.getDate()).padStart(2, "0"),
  );
  const [tempMonth, setTempMonth] = useState(months[baseDate.getMonth()]);
  const [tempYear, setTempYear] = useState(baseDate.getFullYear());

  /* ---------- Logic Fix: Max Days in Month ---------- */
  const daysInMonth = new Date(
    tempYear,
    months.indexOf(tempMonth) + 1,
    0,
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  // Effect to ensure day doesn't exceed max days when month changes (e.g., Feb 31 -> Feb 28)
  useEffect(() => {
    if (Number(tempDay) > daysInMonth) {
      setTempDay(String(daysInMonth).padStart(2, "0"));
    }
  }, [tempMonth, tempYear, daysInMonth, tempDay]);

  const spin = (setter, list, currentVal, dir) => {
    const index = list.indexOf(currentVal);
    let next = dir === "up" ? index - 1 : index + 1;
    if (next < 0) next = list.length - 1;
    if (next >= list.length) next = 0;
    setter(list[next]);
  };

  const handleOk = () => {
    const monthNumber = months.indexOf(tempMonth) + 1;
    // Standardizing return to dd/mm/yyyy as requested
    const formatted = `${String(tempDay).padStart(2, "0")}/${String(monthNumber).padStart(2, "0")}/${tempYear}`;
    onChange?.(formatted);
    onClose?.();
  };

  const headerDate = new Date(
    tempYear,
    months.indexOf(tempMonth),
    Number(tempDay) || 1,
  );
  const headerLabel = headerDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="absolute z-50 mt-2 bg-white shadow-2xl rounded-2xl p-6 w-72 border border-gray-100">
      <div className="text-blue-600 text-lg font-semibold text-center mb-4 tracking-tight">
        {headerLabel}
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 bg-gray-50 py-4 rounded-xl">
        {/* DAY SPINNER */}
        <SpinnerColumn
          label="Day"
          val={tempDay}
          onUp={() => spin(setTempDay, days, tempDay, "up")}
          onDown={() => spin(setTempDay, days, tempDay, "down")}
        />

        <span className="text-gray-300 font-light text-2xl mb-1">/</span>

        {/* MONTH SPINNER */}
        <SpinnerColumn
          label="Month"
          val={tempMonth}
          onUp={() => spin(setTempMonth, months, tempMonth, "up")}
          onDown={() => spin(setTempMonth, months, tempMonth, "down")}
        />

        <span className="text-gray-300 font-light text-2xl mb-1">/</span>

        {/* YEAR SPINNER */}
        <SpinnerColumn
          label="Year"
          val={tempYear}
          onUp={() =>
            spin(
              (v) => setTempYear(v),
              years.map(String),
              String(tempYear),
              "up",
            )
          }
          onDown={() =>
            spin(
              (v) => setTempYear(v),
              years.map(String),
              String(tempYear),
              "down",
            )
          }
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleOk}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          Set Date
        </button>
      </div>
    </div>
  );
}

// Sub-component for cleaner code
function SpinnerColumn({ val, onUp, onDown }) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onUp}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      <span className="text-xl font-bold text-gray-800 w-12 text-center tabular-nums">
        {val}
      </span>
      <button
        onClick={onDown}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}
