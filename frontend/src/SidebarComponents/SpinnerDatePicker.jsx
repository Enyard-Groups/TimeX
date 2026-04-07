import React, { useState } from "react";

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
  { length: currentYear + 150 - 1950 + 1 },
  (_, i) => 1950 + i,
);

export default function SpinnerDatePicker({ value, onChange, onClose }) {
  /* ---------- Parse value (Date | dd/mm/yyyy | undefined) ---------- */

  let baseDate = new Date();

  if (value instanceof Date) {
    baseDate = value;
  } else if (typeof value === "string") {
    if (value.includes("/")) {
      const [d, m, y] = value.split("/");
      baseDate = new Date(Number(y), Number(m) - 1, Number(d));
    } else if (value.includes("-")) {
      const [y, m, d] = value.split("-");
      baseDate = new Date(Number(y), Number(m) - 1, Number(d));
    }
  }

  const [day, setDay] = useState(String(baseDate.getDate()).padStart(2, "0"));
  const [month, setMonth] = useState(months[baseDate.getMonth()]);
  const [year, setYear] = useState(baseDate.getFullYear());

  const [tempDay, setTempDay] = useState(day);
  const [tempMonth, setTempMonth] = useState(month);
  const [tempYear, setTempYear] = useState(year);

  /* ---------- Days in selected month ---------- */

  const daysInMonth = new Date(
    tempYear,
    months.indexOf(tempMonth) + 1,
    0,
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  /* ---------- Spinner helpers ---------- */

  const spin = (setter, list, value, dir) => {
    const index = list.indexOf(value);
    let next = dir === "up" ? index - 1 : index + 1;

    if (next < 0) next = list.length - 1;
    if (next >= list.length) next = 0;

    setter(list[next]);
  };

  const spinYear = (dir) => {
    const index = years.indexOf(Number(tempYear));
    let next = dir === "up" ? index - 1 : index + 1;

    if (next < 0) next = years.length - 1;
    if (next >= years.length) next = 0;

    setTempYear(years[next]);
  };

  /* ---------- Mouse wheel support ---------- */

  const handleWheelDay = (event) => {
    event.preventDefault();
    const dir = event.deltaY < 0 ? "up" : "down";
    spin(setTempDay, days, tempDay, dir);
  };

  const handleWheelMonth = (event) => {
    event.preventDefault();
    const dir = event.deltaY < 0 ? "up" : "down";
    spin(setTempMonth, months, tempMonth, dir);
  };

  const handleWheelYear = (event) => {
    const dir = event.deltaY < 0 ? "up" : "down";
    spinYear(dir);
  };

  /* ---------- OK / Cancel ---------- */

  const handleOk = () => {
    setDay(tempDay);
    setMonth(tempMonth);
    setYear(tempYear);

    const monthNumber = months.indexOf(tempMonth) + 1;

    const formatted =
      `${tempDay}/` +
      `${String(monthNumber).padStart(2, "0")}/` +
      `${tempYear}`;

    onChange && onChange(formatted);

    onClose && onClose();
  };

  const handleCancel = () => {
    setTempDay(day);
    setTempMonth(month);
    setTempYear(year);
    onClose && onClose();
  };

  /* ---------- Derived display ---------- */

  const monthIndex = months.indexOf(tempMonth);
  const headerDate = new Date(tempYear, monthIndex, Number(tempDay) || 1);
  const headerLabel = headerDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  /* ---------- UI ---------- */

  return (
    <div className="absolute z-50 mt-2 bg-white shadow-2xl rounded-2xl px-4 sm:px-6 py-5 w-fit">
      <div className="text-blue-500 text-lg font-medium text-center mb-3">
        {headerLabel}
      </div>

      <div className="h-px bg-[oklch(0.9_0.001_106.424)] mb-4" />

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {/* DAY */}
        <div className="flex flex-col items-center" onWheel={handleWheelDay}>
          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spin(setTempDay, days, tempDay, "up")}
          >
            ▲
          </button>

          <input
            value={tempDay}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length <= 2) setTempDay(v);
            }}
            className="w-10 text-center py-1.5 rounded-md text-xl tracking-wide border-b-2 border-blue-500 focus:outline-none"
          />

          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spin(setTempDay, days, tempDay, "down")}
          >
            ▼
          </button>
        </div>

        <div className="text-2xl text-gray-300">/</div>

        {/* MONTH */}
        <div className="flex flex-col items-center" onWheel={handleWheelMonth}>
          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spin(setTempMonth, months, tempMonth, "up")}
          >
            ▲
          </button>

          <input
            value={tempMonth}
            onChange={(e) => {
              const v = e.target.value.slice(0, 3);
              setTempMonth(v);
            }}
            onBlur={() => {
              const match = months.find(
                (m) => m.toLowerCase() === tempMonth.toLowerCase(),
              );
              if (!match) {
                setTempMonth(month);
              } else {
                setTempMonth(match);
              }
            }}
            className="w-12 text-center py-1.5 rounded-md text-xl tracking-wide border-b-2 border-blue-500 focus:outline-none"
          />

          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spin(setTempMonth, months, tempMonth, "down")}
          >
            ▼
          </button>
        </div>

        <div className="text-2xl text-gray-300">/</div>

        {/* YEAR */}
        <div className="flex flex-col items-center" onWheel={handleWheelYear}>
          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spinYear("up")}
          >
            ▲
          </button>

          <input
            value={tempYear}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length <= 4) setTempYear(v);
            }}
            className="w-12 text-center py-1.5 rounded-md text-xl tracking-wide border-b-2 border-blue-500 focus:outline-none"
          />

          <button
            className="text-gray-400 hover:text-black"
            onClick={() => spinYear("down")}
          >
            ▼
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div className="flex justify-end gap-3 mt-5 text-sm">
        <button
          onClick={handleCancel}
          className="px-4 py-1 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={handleOk}
          className="px-5 py-1 rounded-lg bg-blue-500 text-white hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
}
