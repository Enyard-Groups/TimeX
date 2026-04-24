import React, { useState, useRef, useEffect } from "react";

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const seconds = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

export default function SpinnerTimePicker({ value, onChange, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // ✅ Default to 00:00:00 instead of current time
  const parseValue = () => {
    if (value instanceof Date) {
      return {
        h: String(value.getHours()).padStart(2, "0"),
        m: String(value.getMinutes()).padStart(2, "0"),
        s: String(value.getSeconds()).padStart(2, "0"),
      };
    }
    if (typeof value === "string" && value.includes(":")) {
      const [h, m, s] = value.split(":");
      return {
        h: String(Number(h)).padStart(2, "0"),
        m: String(Number(m)).padStart(2, "0"),
        s: String(Number(s || 0)).padStart(2, "0"),
      };
    }
    return { h: "00", m: "00", s: "00" }; // ✅ default
  };

  const init = parseValue();

  const [hour, setHour] = useState(init.h);
  const [minute, setMinute] = useState(init.m);
  const [second, setSecond] = useState(init.s);

  const [tempHour, setTempHour] = useState(init.h);
  const [tempMinute, setTempMinute] = useState(init.m);
  const [tempSecond, setTempSecond] = useState(init.s);

  // ✅ Same spin helper as date picker
  const spin = (setter, list, currentVal, dir) => {
    const index = list.indexOf(currentVal);
    let next = dir === "up" ? index - 1 : index + 1;
    if (next < 0) next = list.length - 1;
    if (next >= list.length) next = 0;
    setter(list[next]);
  };

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
    "w-10 sm:w-12 text-center py-2 rounded-lg border border-[oklch(0.86_0.001_106.424)] text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 bg-white shadow-2xl rounded-2xl px-4 sm:px-6 py-5 w-fit"
    >
      <div className="mb-4 text-xs font-semibold tracking-[.25em] text-gray-500">
        ENTER TIME
      </div>

      <div className="flex items-center gap-3">
        {/* Hour */}
        <SpinnerColumn
          val={tempHour}
          list={hours}
          setter={setTempHour}
          spin={spin}
          inputClasses={commonInputClasses}
          label="Hour"
          onInputChange={(v) => {
            if (v.length <= 2) setTempHour(v);
          }}
        />

        <div className="text-3xl text-gray-400 mb-5">:</div>

        {/* Minute */}
        <SpinnerColumn
          val={tempMinute}
          list={minutes}
          setter={setTempMinute}
          spin={spin}
          inputClasses={commonInputClasses}
          label="Minute"
          onInputChange={(v) => {
            if (v.length <= 2) setTempMinute(v);
          }}
        />

        <div className="text-3xl text-gray-400 mb-5">:</div>

        {/* Second */}
        <SpinnerColumn
          val={tempSecond}
          list={seconds}
          setter={setTempSecond}
          spin={spin}
          inputClasses={commonInputClasses}
          label="Second"
          onInputChange={(v) => {
            if (v.length <= 2) setTempSecond(v);
          }}
        />
      </div>

      <div className="flex justify-end gap-4 mt-2 text-sm">
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

// ✅ Same arrow style as date picker
function SpinnerColumn({
  val,
  list,
  setter,
  spin,
  inputClasses,
  label,
  onInputChange,
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        className="text-gray-400 hover:text-black"
        onClick={() => spin(setter, list, val, "up")}
      >
        ▲
      </button>

      <input
        value={val}
        onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ""))}
        className={inputClasses}
      />

      <button
        className="text-gray-400 hover:text-black"
        onClick={() => spin(setter, list, val, "down")}
      >
        ▼
      </button>

      <span className="mt-2 text-xs text-gray-500 uppercase">{label}</span>
    </div>
  );
}
