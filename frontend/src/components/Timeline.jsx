import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecord } from "../action";
import SpinnerDatePicker from "../SidebarComponents/SpinnerDatePicker";
import SpinnerTimePicker from "../SidebarComponents/SpinnerTimePicker";

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Normalise any date value from the spinner into YYYY-MM-DD.
 * Handles: "YYYY-MM-DD", "DD/MM/YYYY", "DD-MM-YYYY", Date objects.
 */
const toYMD = (raw) => {
  if (!raw) return null;

  if (raw instanceof Date) {
    if (isNaN(raw)) return null;
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, "0");
    const d = String(raw.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const s = String(raw).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return `${y}-${m}-${d}`;
  }

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [d, m, y] = s.split("-");
    return `${y}-${m}-${d}`;
  }

  return null;
};

/** YYYY-MM-DD → DD/MM/YYYY for display in the input box */
const ymdToDMY = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
};

/** YYYY-MM-DD → Date object at local midnight (no timezone shift) */
const ymdToDate = (ymd) => {
  if (!ymd) return new Date("invalid");
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** YYYY-MM-DD → "Apr 21" — must match the format stored in records */
const ymdToRecordDate = (ymd) => {
  const date = ymdToDate(ymd);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Time helpers 

const normalizeTime = (raw) => {
  if (!raw) return "00:00:00";

  // SpinnerTimePicker calls onChange(next) where next is a Date object
  if (raw instanceof Date && !isNaN(raw)) {
    const h = String(raw.getHours()).padStart(2, "0");
    const m = String(raw.getMinutes()).padStart(2, "0");
    const s = String(raw.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Handle string or synthetic event
  const str =
    typeof raw === "object" && raw?.target
      ? String(raw.target.value).trim()
      : String(raw).trim();

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    const [h, m, sec] = str.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  return "00:00:00";
};

/** Extract a plain value from either a raw string or a synthetic event */
const extractVal = (val) =>
  typeof val === "object" && val?.target ? val.target.value : val;

// ─── Component ────────────────────────────────────────────────────────────────

const Timeline = () => {
  const dispatch = useDispatch();
  const records = useSelector((state) => state.record);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showStartTimeSpinner, setShowStartTimeSpinner] = useState(false);

  useEffect(() => {
    dispatch(fetchRecord());
  }, [dispatch]);

  const [now, setNow] = useState(new Date());

  const getTodayYMD = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };

  const todayYMD = getTodayYMD();

  // Internal date always stored as YYYY-MM-DD
  const [selectedYMD, setSelectedYMD] = useState(todayYMD);
  // Internal time always stored as HH:MM:SS
  const [startTime, setStartTime] = useState("00:00:00");

  const selectedRecordDate = ymdToRecordDate(selectedYMD);
  const isToday = selectedYMD === todayYMD;

  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentSecondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const startTimeSecs = useMemo(() => {
    const [h, m, s] = startTime.split(":").map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }, [startTime]);

  const endTimeSecs = 24 * 3600 - 1;
  const visibleSecs = endTimeSecs - startTimeSecs;

  const hourWidth = 120;
  const timelineWidth = Math.ceil((visibleSecs / 3600) * hourWidth);

  const getSecondsFromTime = (timeStr) => {
    if (!timeStr || timeStr === "-") return null;
    const parts = timeStr.split(":").map(Number);
    if (isNaN(parts[0])) return null;
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  };

  const dayRecords = useMemo(
    () => records.filter((r) => r.date === selectedRecordDate),
    [records, selectedRecordDate],
  );

  const sortedEvents = useMemo(() => {
    const events = [];
    dayRecords.forEach((user) => {
      const inSecs = getSecondsFromTime(user.checkIn);
      if (inSecs !== null && inSecs >= startTimeSecs) {
        if (!isToday || inSecs <= currentSecondsNow) {
          events.push({
            ...user,
            type: "IN",
            timeSecs: inSecs,
            displayTime: user.checkIn,
          });
        }
      }
      if (user.checkOut && user.checkOut !== "-") {
        const outSecs = getSecondsFromTime(user.checkOut);
        if (outSecs !== null && outSecs >= startTimeSecs) {
          if (!isToday || outSecs <= currentSecondsNow) {
            events.push({
              ...user,
              type: "OUT",
              timeSecs: outSecs,
              displayTime: user.checkOut,
            });
          }
        }
      }
    });
    return events.sort((a, b) => b.timeSecs - a.timeSecs);
  }, [dayRecords, currentSecondsNow, isToday, startTimeSecs]);

  const getPosition = (seconds) =>
    ((seconds - startTimeSecs) / visibleSecs) * 100;

  const nowPosition =
    isToday && currentSecondsNow >= startTimeSecs
      ? ((currentSecondsNow - startTimeSecs) / visibleSecs) * 100
      : null;

  const centerNow = (behavior = "smooth") => {
    if (!scrollRef.current || nowPosition === null) return;
    const containerWidth = scrollRef.current.clientWidth;
    const nowPixel = (nowPosition / 100) * timelineWidth;
    scrollRef.current.scrollTo({
      left: Math.max(0, nowPixel - containerWidth / 2),
      behavior,
    });
  };

  const hasCenteredOnLoad = useRef(false);
  useEffect(() => {
    if (hasCenteredOnLoad.current || !scrollRef.current) return;
    hasCenteredOnLoad.current = true;
    centerNow("instant");
  }, []);

  useEffect(() => {
    if (isToday) {
      centerNow("smooth");
    } else {
      scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [selectedYMD, startTime]);

  // First full hour at or after startTimeSecs
  const firstFullHour = Math.ceil(startTimeSecs / 3600);
  // Build hour markers: label + their exact second offset from startTimeSecs
  const timeMarkers = Array.from({ length: 24 - firstFullHour }, (_, i) => {
    const hourNum = firstFullHour + i;
    const secs = hourNum * 3600; // absolute seconds in day
    const pct = ((secs - startTimeSecs) / visibleSecs) * 100;
    return { label: `${String(hourNum).padStart(2, "0")}:00`, pct };
  });

  const selectedLabel = isToday
    ? "Today"
    : ymdToDate(selectedYMD).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  const handleDateChange = (val) => {
    const raw = extractVal(val);
    const normalized = toYMD(raw);
    if (normalized) {
      setSelectedYMD(normalized);
      setShowDateSpinner(false);
    }
  };

  const handleTimeChange = (val) => {
    // SpinnerTimePicker passes a Date object directly to onChange
    const normalized = normalizeTime(val);
    setStartTime(normalized);
    // Note: spinner calls onClose itself after OK
  };

  return (
    <div className="bg-white rounded-3xl p-6 w-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-md font-bold text-gray-600 tracking-tight">
            Live Attendance Feed
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Showing{" "}
            <span className="font-bold text-gray-600">{startTime} – 23:59:59</span>
            {" for "}
            <span className="font-bold text-gray-600">{selectedLabel}</span>
            {" · "}
            {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex gap-4 text-[10px] xl:text-[12px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-[#3572ff]">
              <div className="w-2 h-2 rounded-full bg-[#3572ff] animate-pulse" />
              Check-in
            </div>
            <div className="flex items-center gap-1.5 text-[#11a5ac]">
              <div className="w-2 h-2 rounded-full bg-[#11a5ac]" />
              Check-out
            </div>
          </div>

          {/* Jump to Now */}
          {isToday && (
            <button
              onClick={() => centerNow("smooth")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Jump to Now
            </button>
          )}

          <div className="flex items-center gap-2 relative">
            {/* Date Selector */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl pl-4 py-1.5 shadow-sm">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pr-4">
                Date
              </span>
              <input
                name="date_of_incident"
                value={ymdToDMY(selectedYMD)}
                onClick={() => setShowDateSpinner(true)}
                readOnly
                className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                placeholder="dd/mm/yyyy"
              />
            </div>
            {showDateSpinner && (
              <div className="absolute top-10 left-6 z-50">
                <SpinnerDatePicker
                  value={selectedYMD}
                  onChange={handleDateChange}
                  onClose={() => setShowDateSpinner(false)}
                />
              </div>
            )}

            {/* Start Time Selector */}
            <div className="flex flex-row bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm gap-4">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                From
              </span>
              <div
                className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                onClick={() => setShowStartTimeSpinner(true)}
              >
                {startTime || "HH:MM:SS"}
              </div>
            </div>
            {showStartTimeSpinner && (
              <div className="absolute top-10 left-8 z-50">
                <SpinnerTimePicker
                  value={startTime}
                  onChange={handleTimeChange}
                  onClose={() => setShowStartTimeSpinner(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline scroll container */}
      <div
        ref={scrollRef}
        className="relative border border-gray-100 rounded-2xl overflow-x-auto overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          height: "500px",
          isolation: "isolate",
        }}
      >
        <div
          style={{
            width: `${timelineWidth}px`,
            position: "relative",
            minHeight: "100%",
          }}
        >
          {/* Hour labels */}
          <div className="relative border-b border-gray-100 bg-gray-50/95 backdrop-blur-md sticky top-0 z-50 h-10">
            {timeMarkers.map(({ label, pct }) => (
              <div
                key={label}
                className="absolute text-[10px] xl:text-[11px] font-extrabold text-gray-400 py-3"
                style={{ left: `${pct}%`, paddingLeft: "10px" }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            className="relative bg-white"
            style={{
              height: `${Math.max(sortedEvents.length * 60 + 80, 450)}px`,
            }}
          >
            {/* Grid lines */}
            {timeMarkers.map(({ label, pct }) => (
              <div
                key={label}
                className="absolute top-0 bottom-0 border-r border-gray-100 pointer-events-none"
                style={{ left: `${pct}%` }}
              />
            ))}

            {/* Future shade */}
            {isToday && nowPosition !== null && (
              <div
                className="absolute top-0 bottom-0 bg-gray-50/70 pointer-events-none z-10"
                style={{ left: `${nowPosition}%`, right: 0 }}
              />
            )}

            {/* Now indicator */}
            {isToday && nowPosition !== null && (
              <div
                className="absolute top-0 bottom-0 flex flex-col items-start z-30 pointer-events-none transition-all duration-1000"
                style={{ left: `${nowPosition}%` }}
              >
                <div className="bg-indigo-950 text-white text-[9px] xl:text-[10px] font-black px-2 py-0.5 rounded-r-full mt-1 shadow-lg uppercase whitespace-nowrap">
                  Now
                </div>
                <div className="w-0 h-full border-l-2 border-dashed border-indigo-500 opacity-70" />
              </div>
            )}

            {/* Empty state */}
            {sortedEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium">
                No attendance records for {selectedLabel} from {startTime}
              </div>
            )}

            {/* Event cards */}
            {sortedEvents.map((event, index) => {
              const leftPos = getPosition(event.timeSecs);
              const rowTop = 25 + index * 60;
              const isCheckIn = event.type === "IN";
              return (
                <div key={`${event.id}-${event.type}`} className="contents">
                  <div
                    className="absolute w-full border-t border-gray-50 pointer-events-none"
                    style={{ top: `${rowTop + 18}px` }}
                  />
                  <div
                    className={`absolute flex items-center gap-2 p-1 pr-4 rounded border-l-2 shadow-sm z-20 transition-all duration-500 ${
                      isCheckIn
                        ? "bg-[#e3e9f7] text-gray-700 border-[#3572ff]"
                        : "bg-[#e3f6f7] text-gray-700 border-[#11a5ac]"
                    }`}
                    style={{ left: `${leftPos}%`, top: `${rowTop}px` }}
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex justify-center items-center shrink-0">
                      {event?.photo ? (
                        <img
                          src={event.photo}
                          alt={event?.username || "User"}
                          className="w-9 h-9 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#002259] text-white font-semibold shadow-sm">
                          {event?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col leading-tight whitespace-nowrap gap-0.5">
                      <span className="text-[12px] font-bold text-gray-800">
                        {event.username
                          ? event.username.charAt(0).toUpperCase() +
                            event.username.slice(1)
                          : "Unknown"}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold ${isCheckIn ? "text-[#3572ff]" : "text-[#11a5ac]"}`}
                      >
                        {event.type} · {event.displayTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 font-medium">
        <p>* Scroll horizontally to explore the timeline.</p>
        {isToday ? (
          <p className="italic">Live · {now.toLocaleTimeString()}</p>
        ) : (
          <p className="italic">Historical · {selectedLabel}</p>
        )}
      </div>
    </div>
  );
};

export default Timeline;
