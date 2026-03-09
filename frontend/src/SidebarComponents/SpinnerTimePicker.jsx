import React, { useState } from "react";

export default function SpinnerTimePicker({ value, onChange, onClose }) {
  let baseTime = value instanceof Date ? value : new Date();

  const [hour, setHour] = useState(
    String(baseTime.getHours()).padStart(2, "0"),
  );
  const [minute, setMinute] = useState(
    String(baseTime.getMinutes()).padStart(2, "0"),
  );
  const [second, setSecond] = useState(
    String(baseTime.getSeconds()).padStart(2, "0"),
  );

  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  const [tempSecond, setTempSecond] = useState(second);

  const clamp = (val, max) => {
    const num = Number(val);
    if (Number.isNaN(num)) return "00";
    if (num < 0) return "00";
    if (num > max) return String(max).padStart(2, "0");
    return String(num).padStart(2, "0");
  };

  const handleOk = () => {
    const h = clamp(tempHour, 23);
    const m = clamp(tempMinute, 59);
    const s = clamp(tempSecond, 59);

    setHour(h);
    setMinute(m);
    setSecond(s);

    const next = new Date();
    next.setHours(Number(h), Number(m), Number(s), 0);

    onChange && onChange(next);
    onClose && onClose();
  };

  const handleCancel = () => {
    setTempHour(hour);
    setTempMinute(minute);
    setTempSecond(second);
    onClose && onClose();
  };

  const commonInputClasses =
    "w-16 text-center py-2 rounded-lg border border-[oklch(0.86_0.001_106.424)] text-2xl tracking-widest";

  return (
    <div className="absolute z-50 mt-2 bg-white shadow-2xl rounded-2xl px-6 py-5 w-fit">
      <div className="mb-4 text-xs font-semibold tracking-[.25em] text-gray-500">
        ENTER TIME
      </div>

      <div className="flex items-center gap-3">
        {/* Hour */}
        <div className="flex flex-col items-center">
          <input
            value={tempHour}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length > 2) v = v.slice(0, 2);
              setTempHour(v);
            }}
            className={commonInputClasses}
          />
          <span className="mt-2 text-xs text-gray-500 uppercase">Hour</span>
        </div>

        <div className="text-3xl text-gray-400">:</div>

        {/* Minute */}
        <div className="flex flex-col items-center">
          <input
            value={tempMinute}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length > 2) v = v.slice(0, 2);
              setTempMinute(v);
            }}
            className={commonInputClasses}
          />
          <span className="mt-2 text-xs text-gray-500 uppercase">Minute</span>
        </div>

        <div className="text-3xl text-gray-400">:</div>

        {/* Second */}
        <div className="flex flex-col items-center">
          <input
            value={tempSecond}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, "");
              if (v.length > 2) v = v.slice(0, 2);
              setTempSecond(v);
            }}
            className={commonInputClasses}
          />
          <span className="mt-2 text-xs text-gray-500 uppercase">Second</span>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6 text-sm">
        <button
          onClick={handleCancel}
          className="px-4 py-1 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleOk}
          className="px-5 py-1 rounded-lg bg-[oklch(0.645_0.246_16.439)] text-white hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
}

