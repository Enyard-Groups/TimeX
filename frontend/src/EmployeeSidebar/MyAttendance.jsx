/* eslint-disable no-empty */
import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

// ── CONFIG ─────────────────────────────────────────────────────
const TOTAL_ANNUAL_LEAVES = 24;
const WORK_HOURS_PER_DAY = 5;
const PRESENT_THRESHOLD_SECONDS = 1 * 3600;

// ── HELPERS ────────────────────────────────────────────────────
const formatSeconds = (s) => {
  if (!s) return "0h 0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

const monthName = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const formatDateKey = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ── STATUS CONFIG ───────────────────────────────────────────────
const STATUS = {
  Present: {
    bg: "bg-green-50",
    text: "text-green-800",
    dot: "bg-green-500",
    border: "border-green-200",
    label: "Present",
  },
  Absent: {
    bg: "bg-red-50",
    text: "text-red-800",
    dot: "bg-red-500",
    border: "border-red-200",
    label: "Absent",
  },
  Leave: {
    bg: "bg-violet-50",
    text: "text-violet-800",
    dot: "bg-violet-500",
    border: "border-violet-200",
    label: "Leave",
  },
  Missed: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-800",
    dot: "bg-fuchsia-500",
    border: "border-fuchsia-200",
    label: "Missed",
  },
  Weekend: {
    bg: "bg-transparent",
    text: "text-gray-300",
    dot: "bg-gray-200",
    border: "border-transparent",
    label: "Weekend",
  },
  Today: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-300",
    label: "Today",
  },
};

// ── STAT CARD ───────────────────────────────────────────────────
const StatCard = ({ label, value, sub, iconBg, iconText, icon }) => (
  <div className="bg-white border border-blue-50 rounded-2xl p-4 flex justify-between items-center gap-3 shadow-sm">
    <div className="min-w-0">
      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 truncate">
        {label}
      </div>
      <div className={`text-xl font-black leading-tight ${iconText}`}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</div>
      )}
    </div>
    <div
      className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-lg flex-shrink-0`}
    >
      <span className={iconText}>{icon}</span>
    </div>
  </div>
);

// ── LEAVE PROGRESS BAR ──────────────────────────────────────────
const LeaveBar = ({ label, used, total, barColor, textColor }) => {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">
          {used}/{total}{" "}
          <span className={`font-bold ${textColor}`}>
            ({total - used} left)
          </span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── LEGEND PILL ─────────────────────────────────────────────────
const LegendPill = ({ status }) => {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${s.text} ${s.bg} border ${s.border} rounded-full px-2.5 py-0.5`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ── MAIN COMPONENT ──────────────────────────────────────────────
const MyAttendance = ({ user }) => {
  const records = useSelector((state) => state.record);
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [hoveredDay, setHoveredDay] = useState(null);
  const [now, setNow] = useState(new Date());

  // ── Clock tick ──
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── isPunchedIn — stable, only re-reads when punch changes ──
  const [isPunchedIn, setIsPunchedIn] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("isPunchedIn_" + user.id)) || false
      );
    } catch {
      return false;
    }
  });

  // ── activeSession — stable on mount, only updates when punch state changes ──
  const readActiveSession = () => {
    try {
      const saved = localStorage.getItem("activeRecord_" + user.id);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const todayKey = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (parsed?.date !== todayKey) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const [activeSession, setActiveSession] = useState(() => readActiveSession());

  // Re-sync activeSession and isPunchedIn on storage changes (cross-tab or punch events)
  useEffect(() => {
    const onStorage = () => {
      setActiveSession(readActiveSession());
      try {
        setIsPunchedIn(
          JSON.parse(localStorage.getItem("isPunchedIn_" + user.id)) || false,
        );
      } catch {
        setIsPunchedIn(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user.id]);

  // Also poll once per second only for isPunchedIn to catch same-tab punch changes
  useEffect(() => {
    try {
      const val =
        JSON.parse(localStorage.getItem("isPunchedIn_" + user.id)) || false;
      if (val !== isPunchedIn) {
        setIsPunchedIn(val);
        setActiveSession(readActiveSession());
      }
    } catch {}
  }, [now]);

  const isReduxReady = records.length > 0;

  const userRecords = useMemo(
    () => records.filter((r) => r.userID === user.id),
    [records, user.id],
  );

  // ── BUILD DAY MAP ──
  const dayMap = useMemo(() => {
    // Step 1: Group all closed records by date
    const closedByDate = {};
    userRecords.forEach((r) => {
      if (r.status === "In Progress") return;
      if (!closedByDate[r.date]) closedByDate[r.date] = [];
      closedByDate[r.date].push(r);
    });

    // Step 2: Sum closed session seconds per date
    const closedSecsByDate = {};
    Object.entries(closedByDate).forEach(([date, recs]) => {
      closedSecsByDate[date] = recs.reduce(
        (acc, r) => acc + (r._sessionSeconds || 0),
        0,
      );
    });

    // Step 3: Pick latest closed record per date for metadata
    const latestClosedByDate = {};
    Object.entries(closedByDate).forEach(([date, recs]) => {
      latestClosedByDate[date] = recs.reduce(
        (best, r) => (r.id > (best?.id || 0) ? r : best),
        null,
      );
    });

    const map = {};

    // Step 4: Build map from closed records
    Object.entries(closedSecsByDate).forEach(([date, totalSecs]) => {
      const latest = latestClosedByDate[date];
      if (!latest) return;
      const derivedStatus =
        totalSecs >= PRESENT_THRESHOLD_SECONDS ? "Present" : "Absent";
      map[date] = {
        ...latest,
        status: derivedStatus,
        _totalDaySeconds: totalSecs,
      };
    });

    // Step 5: Handle live In Progress session from Redux
    const inProgressRecord = userRecords.find(
      (r) => r.status === "In Progress",
    );
    if (inProgressRecord) {
      const session =
        activeSession?.id === inProgressRecord.id
          ? activeSession
          : inProgressRecord;
      const key = session.date;
      const inTime = session._inTime ? new Date(session._inTime) : now;
      const liveSessionSecs = Math.max(0, Math.floor((now - inTime) / 1000));
      const prevClosed = closedSecsByDate[key] || 0;
      const liveTotalSecs = prevClosed + liveSessionSecs;

      if (liveTotalSecs >= PRESENT_THRESHOLD_SECONDS) {
        if (!map[key] || liveTotalSecs > (map[key]._totalDaySeconds || 0)) {
          map[key] = {
            ...session,
            status: "Present",
            _totalDaySeconds: liveTotalSecs,
          };
        }
      }
    }

    // Step 6: Safety net — ONLY use localStorage if Redux hasn't loaded yet
    // This prevents the flicker on refresh where Redux is empty momentarily
    if (!isReduxReady && isPunchedIn && activeSession && !inProgressRecord) {
      const key = activeSession.date;
      const inTime = activeSession._inTime
        ? new Date(activeSession._inTime)
        : now;
      const liveSessionSecs = Math.max(0, Math.floor((now - inTime) / 1000));
      const prevClosed = closedSecsByDate[key] || 0;
      const liveTotalSecs = prevClosed + liveSessionSecs;
      if (
        liveTotalSecs >= PRESENT_THRESHOLD_SECONDS &&
        (!map[key] || liveTotalSecs > (map[key]._totalDaySeconds || 0))
      ) {
        map[key] = {
          ...activeSession,
          status: "Present",
          _totalDaySeconds: liveTotalSecs,
        };
      }
    }

    return map;
  }, [userRecords, now, activeSession, isPunchedIn, isReduxReady]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startDow; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const key = formatDateKey(date);
      const record = dayMap[key] || null;
      const dow = date.getDay();
      const isWeekend = dow === 0;
      const isToday = isSameDay(date, today);
      const isFuture = date > today;

      let status = null;
      if (record)
        status = record.status; // record always wins
      else if (isWeekend) status = "Weekend";
      else if (isToday) status = "Today"; // only if no record yet

      days.push({ date, key, record, status, isWeekend, isToday, isFuture });
    }
    return days;
  }, [currentMonth, dayMap, today]);

  // ── MONTH STATS — only count days that have a record ──
  const monthStats = useMemo(() => {
    let present = 0,
      absent = 0,
      leave = 0,
      totalSecs = 0;
    calendarDays.forEach((cell) => {
      if (!cell || cell.isFuture || cell.isWeekend) return;
      if (!cell.record) return; // skip days with no record (including today if not punched)
      const r = cell.record;
      if (r.status === "Present") present++;
      else if (r.status === "Absent") absent++;
      else if (r.status === "Leave") leave++;
      totalSecs += r._totalDaySeconds || 0;
    });
    return { present, absent, leave, totalSecs };
  }, [calendarDays]);

  const annualLeaveUsed = useMemo(() => {
    const map = {};
    userRecords.forEach((r) => {
      if (r.status === "Leave" && !map[r.date]) map[r.date] = true;
    });
    return Object.keys(map).length;
  }, [userRecords]);

  const annualLeaveLeft = TOTAL_ANNUAL_LEAVES - annualLeaveUsed;

  const workDaysInMonth = calendarDays.filter(
    (c) => c && !c.isWeekend && !c.isFuture,
  ).length;

  const efficiencyPct =
    workDaysInMonth > 0
      ? Math.round((monthStats.present / workDaysInMonth) * 100)
      : 0;

  const efficiencyColor =
    efficiencyPct >= 80
      ? "text-green-600"
      : efficiencyPct >= 60
        ? "text-amber-600"
        : "text-red-600";

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  return (
    <div
      className="min-h-screen flex mb-6 bg-[#0f172a]"
      style={{ scrollbarWidth: "none" }}
    >
      <Navbar user={user} />

      <div
        className="lg:ml-64 flex-1 px-4 pt-4 mt-3 lg:px-12 pb-10 bg-white rounded-tl-3xl overflow-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ── PAGE HEADER ── */}
        <div className="mb-7 mt-0.5 pl-10 lg:pl-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm text-gray-400">
            {user?.user_name?.charAt(0)?.toUpperCase() +
              user?.user_name?.slice(1) ||
              user?.name?.charAt(0)?.toUpperCase() + user?.name?.slice(1) ||
              "Employee"}{" "}
            · Full attendance overview
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard
            label="Present"
            value={monthStats.present}
            sub="this month"
            iconBg="bg-green-50"
            iconText="text-green-700"
            icon="✓"
          />
          <StatCard
            label="Absent"
            value={monthStats.absent}
            sub="this month"
            iconBg="bg-red-50"
            iconText="text-red-700"
            icon="✕"
          />
          <StatCard
            label="On Leave"
            value={monthStats.leave}
            sub="this month"
            iconBg="bg-violet-50"
            iconText="text-violet-700"
            icon="🏖"
          />
          <StatCard
            label="Hours Worked"
            value={formatSeconds(monthStats.totalSecs)}
            sub={`of ${workDaysInMonth * WORK_HOURS_PER_DAY}h expected`}
            iconBg="bg-blue-50"
            iconText="text-blue-700"
            icon="⏱"
          />
          <StatCard
            label="Attendance"
            value={`${efficiencyPct}%`}
            sub="monthly rate"
            iconBg="bg-gray-50"
            iconText={efficiencyColor}
            icon="📊"
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
          {/* ── CALENDAR ── */}
          <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-base"
              >
                ‹
              </button>
              <div className="text-center">
                <div className="text-base font-black text-gray-900 pt-0.5">
                  {monthName(currentMonth)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {workDaysInMonth} working days
                </div>
              </div>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-base transition-colors
                  ${isCurrentMonth ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white text-gray-500 hover:bg-gray-50 cursor-pointer"}`}
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 px-4 pt-3 pb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className={`text-center text-[10px] font-bold uppercase tracking-wider pb-2 ${d === "Sun" ? "text-gray-300" : "text-gray-400"}`}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="min-h-[400px]">
              <div className="grid grid-cols-7 auto-rows-[60px] gap-1 px-4 pb-5">
                {calendarDays.map((cell, idx) => {
                  if (!cell) return <div key={`blank-${idx}`} />;

                  const s = cell.status ? STATUS[cell.status] : null;
                  const isHovered = hoveredDay === cell.key;
                  const record = cell.record;

                  return (
                    <div
                      key={cell.key}
                      onMouseEnter={() =>
                        !cell.isFuture && setHoveredDay(cell.key)
                      }
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`relative rounded-xl text-center h-[60px] py-2 px-1 transition-all duration-150
                        ${s ? `${s.bg} border ${s.border}` : cell.isFuture ? "border border-transparent" : "bg-gray-50 border border-gray-100"}
                        ${record ? "cursor-pointer" : "cursor-default"}
                        ${isHovered && record ? "scale-105 shadow-md z-10" : ""}`}
                    >
                      <div
                        className={`text-xs mb-1 ${cell.isToday ? "font-black" : "font-bold"} ${s ? s.text : cell.isFuture ? "text-gray-200" : "text-gray-400"}`}
                      >
                        {cell.date.getDate()}
                      </div>

                      {s && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full mx-auto mb-0.5 ${s.dot}`}
                        />
                      )}

                      {record && record._totalDaySeconds > 0 && (
                        <div
                          className={`text-[9px] font-bold leading-none opacity-80 ${s ? s.text : "text-gray-500"}`}
                        >
                          {Math.floor(record._totalDaySeconds / 3600)}h
                          {Math.floor((record._totalDaySeconds % 3600) / 60) > 0
                            ? ` ${Math.floor((record._totalDaySeconds % 3600) / 60)}m`
                            : ""}
                        </div>
                      )}

                      {/* Today ring — only when no record yet */}
                      {cell.isToday && !record && (
                        <div className="absolute inset-[-1px] rounded-xl border-2 border-blue-400 pointer-events-none" />
                      )}

                      {isHovered && record && (
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded-xl px-3 py-2 text-[11px] whitespace-nowrap z-50 shadow-xl pointer-events-none">
                          <div className="font-bold mb-1">{cell.key}</div>
                          <div className="text-slate-400">
                            In: {record.checkIn} · Out: {record.checkOut}
                          </div>
                          <div className="text-slate-400 mt-0.5">
                            {record._totalDaySeconds
                              ? `Total: ${formatSeconds(record._totalDaySeconds)}`
                              : "In Progress"}
                          </div>
                          <div
                            className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800"
                            style={{
                              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-gray-50">
              {["Present", "Absent", "Leave", "Missed"].map((s) => (
                <LegendPill key={s} status={s} />
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-blue-50 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 mb-4 tracking-tight">
                Leave Balance
              </h3>
              <LeaveBar
                label="Annual Leave"
                used={annualLeaveUsed}
                total={TOTAL_ANNUAL_LEAVES}
                barColor="bg-violet-500"
                textColor="text-violet-600"
              />
              <LeaveBar
                label="Sick Leave"
                used={0}
                total={10}
                barColor="bg-cyan-500"
                textColor="text-cyan-600"
              />
              <LeaveBar
                label="Casual Leave"
                used={0}
                total={6}
                barColor="bg-amber-500"
                textColor="text-amber-600"
              />
              <div
                className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${annualLeaveLeft <= 3 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <span className="text-lg">
                  {annualLeaveLeft <= 3 ? "⚠️" : "✅"}
                </span>
                <div>
                  <div
                    className={`text-sm font-bold ${annualLeaveLeft <= 3 ? "text-red-700" : "text-green-700"}`}
                  >
                    {annualLeaveLeft} leaves remaining
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {annualLeaveLeft <= 3
                      ? "Running low this year"
                      : `Out of ${TOTAL_ANNUAL_LEAVES} annual leaves`}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-blue-50 rounded-2xl px-4 py-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 mb-4 tracking-tight">
                Month Breakdown
              </h3>
              {[
                {
                  label: "Working Days",
                  value: workDaysInMonth,
                  cls: "text-gray-500",
                },
                {
                  label: "Present",
                  value: monthStats.present,
                  cls: "text-green-600",
                },
                {
                  label: "Absent",
                  value: monthStats.absent,
                  cls: "text-red-600",
                },
                {
                  label: "On Leave",
                  value: monthStats.leave,
                  cls: "text-violet-600",
                },
              ].map(({ label, value, cls }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm font-black ${cls}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-blue-50">
                <span className="text-sm text-gray-600">Total Hours</span>
                <span className="text-sm font-black text-blue-700">
                  {formatSeconds(monthStats.totalSecs)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;