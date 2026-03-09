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
  { length: currentYear + 15 - 1950 + 1 },
  (_, i) => 1950 + i,
);

export default function SpinnerDatePicker({ value, onChange, onClose }) {
  /* ---------- Parse dd/mm/yyyy ---------- */

  let baseDate = new Date();

  if (value && value.includes("/")) {
    const [d, m, y] = value.split("/");
    baseDate = new Date(Number(y), Number(m) - 1, Number(d));
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

  /* ---------- UI ---------- */

  return (
    <div className="absolute z-50 mt-2 bg-white shadow-xl rounded-2xl p-3 w-fit">
      <div className="flex items-center gap-1">
        {/* DAY */}
        <div className="flex flex-col items-center">
          <button
            className="text-gray-500 hover:text-black"
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
            className="w-10 text-center py-2 rounded-lg"
          />

          <button
            className="text-gray-500 hover:text-black"
            onClick={() => spin(setTempDay, days, tempDay, "down")}
          >
            ▼
          </button>
        </div>

        <div className="text-xl text-gray-400">/</div>

        {/* MONTH */}
        <div className="flex flex-col items-center">
          <button
            className="text-gray-500 hover:text-black"
            onClick={() => spin(setTempMonth, months, tempMonth, "up")}
          >
            ▲
          </button>

          <input
            value={tempMonth}
            onChange={(e) => {
              let v = e.target.value.slice(0, 3);

              const match = months.find((m) =>
                m.toLowerCase().startsWith(v.toLowerCase()),
              );

              if (match) setTempMonth(match);
            }}
            className="w-10 text-center py-2 rounded-lg"
          />

          <button
            className="text-gray-500 hover:text-black"
            onClick={() => spin(setTempMonth, months, tempMonth, "down")}
          >
            ▼
          </button>
        </div>

        <div className="text-xl text-gray-400">/</div>

        {/* YEAR */}
        <div className="flex flex-col items-center">
          <button
            className="text-gray-500 hover:text-black"
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
            className="w-10 text-center py-2 rounded-lg"
          />

          <button
            className="text-gray-500 hover:text-black"
            onClick={() => spinYear("down")}
          >
            ▼
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleCancel}
          className="px-4 py-1 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={handleOk}
          className="px-4 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}
