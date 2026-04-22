import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

// ── CONFIG ─────────────────────────────────────────────────────
const TOTAL_ANNUAL_LEAVES = 24;
const WORK_HOURS_PER_DAY = 5;

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

// FIXED: Key now includes the year to prevent ghost data from previous years
const formatDateKey = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const deriveStatus = (totalSeconds) =>
  totalSeconds > 0 ? "Present" : "Absent";

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
  "Missed Punch": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-400",
    border: "border-orange-200",
    label: "Missed Punch",
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
  "In Progress": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    border: "border-blue-200",
    label: "In Progress",
  },
};

// ── UI COMPONENTS ───────────────────────────────────────────────
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

const LegendPill = ({ status }) => {
  const s = STATUS[status];
  if (!s) return null;
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

  // DATE OF JOINING
  const dateofJoin = useMemo(() => new Date("Feb 25, 2025"), []);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [hoveredDay, setHoveredDay] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isPunchedIn, setIsPunchedIn] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("isPunchedIn_" + user.id)) || false
      );
    } catch {
      return false;
    }
  });

  const readActiveSession = () => {
    try {
      const saved = localStorage.getItem("activeRecord_" + user.id);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const todayKey = formatDateKey(new Date());
      if (parsed?.date !== todayKey) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const [activeSession, setActiveSession] = useState(() => readActiveSession());
  const userRecords = useMemo(
    () => records.filter((r) => r.userID === user.id),
    [records, user.id],
  );

  const dayMap = useMemo(() => {
    const closedByDate = {};
    userRecords.forEach((r) => {
      if (r.status === "In Progress") return;
      const dateObj = r._inTime ? new Date(r._inTime) : new Date(r.date);
      const key = formatDateKey(dateObj); // key now contains year
      if (!closedByDate[key]) closedByDate[key] = [];
      closedByDate[key].push(r);
    });

    const map = {};
    Object.entries(closedByDate).forEach(([date, recs]) => {
      const totalSecs = recs.reduce(
        (acc, r) => acc + (r._sessionSeconds || 0),
        0,
      );
      const latest = recs.reduce(
        (best, r) => (r.id > (best?.id || 0) ? r : best),
        null,
      );
      const hasMissedPunch = recs.some(
        (r) =>
          typeof r.checkOut === "string" &&
          r.checkOut.startsWith("Missed Punch"),
      );
      map[date] = {
        ...latest,
        status: hasMissedPunch ? "Missed Punch" : deriveStatus(totalSecs),
        _totalDaySeconds: totalSecs,
        _countStatus: totalSecs > 0 ? "Present" : "Absent",
      };
    });

    // Handle Live Session
    const inProgressRecord = userRecords.find(
      (r) => r.status === "In Progress",
    );
    if (inProgressRecord || (isPunchedIn && activeSession)) {
      const session = inProgressRecord || activeSession;
      const key = formatDateKey(
        session._inTime ? new Date(session._inTime) : new Date(),
      );
      const inTime = session._inTime ? new Date(session._inTime) : now;
      const liveSecs = Math.max(0, Math.floor((now - inTime) / 1000));
      const prevClosed = map[key]?._totalDaySeconds || 0;
      map[key] = {
        ...session,
        status: "In Progress",
        _totalDaySeconds: prevClosed + liveSecs,
        _countStatus: "Present",
      };
    }
    return map;
  }, [userRecords, now, activeSession, isPunchedIn]);

  // ── CALENDAR LOGIC ──────────────────────────────────────────────
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
      const isWeekend = date.getDay() === 0;
      const isToday = isSameDay(date, today);
      const isFuture = date > today;

      // Join Date Filter
      const joinComparison = new Date(dateofJoin);
      joinComparison.setHours(0, 0, 0, 0);
      const isBeforeJoin = date < joinComparison;

      let status = null;
      if (isBeforeJoin) status = null;
      else if (record) status = record.status;
      else if (isWeekend) status = "Weekend";
      else if (isToday) status = "Today";

      days.push({
        date,
        key,
        record,
        status,
        isWeekend,
        isToday,
        isFuture,
        isBeforeJoin,
      });
    }
    return days;
  }, [currentMonth, dayMap, today, dateofJoin]);

  // Stats calculation
  const monthStats = useMemo(() => {
    let present = 0,
      absent = 0,
      leave = 0,
      totalSecs = 0;
    calendarDays.forEach((cell) => {
      if (!cell || cell.isFuture || cell.isWeekend || cell.isBeforeJoin) return;
      if (!cell.record) return;
      const countStatus = cell.record._countStatus || cell.record.status;
      if (countStatus === "Present") present++;
      else if (countStatus === "Absent") absent++;
      else if (cell.record.status === "Leave") leave++;
      totalSecs += cell.record._totalDaySeconds || 0;
    });
    return { present, absent, leave, totalSecs };
  }, [calendarDays]);

  const workDaysInMonth = calendarDays.filter(
    (c) => c && !c.isWeekend && !c.isFuture && !c.isBeforeJoin,
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

  // Navigation Restrictions
  const isJoinMonth = useMemo(() => {
    return (
      currentMonth.getMonth() === dateofJoin.getMonth() &&
      currentMonth.getFullYear() === dateofJoin.getFullYear()
    );
  }, [currentMonth, dateofJoin]);

  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  const prevMonth = () =>
    !isJoinMonth &&
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    !isCurrentMonth &&
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  const annualLeaveUsed = useMemo(() => {
    const map = {};
    userRecords.forEach((r) => {
      if (r.status === "Leave" && !map[r.date]) map[r.date] = true;
    });
    return Object.keys(map).length;
  }, [userRecords]);

  const annualLeaveLeft = TOTAL_ANNUAL_LEAVES - annualLeaveUsed;

  return (
    <div
      className="min-h-screen flex mb-6 bg-[#0f172a]"
      style={{ scrollbarWidth: "none" }}
    >
      <Navbar user={user} />
      <div className="lg:ml-64 flex-1 px-4 pt-4 mt-3 lg:px-12 pb-10 bg-white rounded-tl-3xl overflow-hidden">
        <div className="mb-7 mt-0.5 pl-10 lg:pl-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm text-gray-400">
            {user?.user_name.charAt(0).toUpperCase()+ user?.user_name.slice(1) || "Employee"} · Full overview
          </p>
        </div>

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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
          <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <button
                onClick={prevMonth}
                disabled={isJoinMonth}
                className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center transition-opacity ${isJoinMonth ? "opacity-20 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer text-gray-500"}`}
              >
                ‹
              </button>
              <div className="text-center">
                <div className="text-base font-black text-gray-900 mt-2">
                  {monthName(currentMonth)}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  {workDaysInMonth} working days
                </div>
              </div>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center transition-opacity ${isCurrentMonth ? "opacity-20 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer text-gray-500"}`}
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 px-4 pt-3 pb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="min-h-[400px]">
              <div className="grid grid-cols-7 auto-rows-[60px] gap-1 px-4 pb-5">
                {calendarDays.map((cell, idx) => {
                  if (!cell) return <div key={`blank-${idx}`} />;
                  if (cell.isBeforeJoin) {
                    return (
                      <div
                        key={cell.key}
                        className="relative rounded-xl text-center h-[60px] py-2 px-1 opacity-20"
                      >
                        <div className="text-xs font-bold text-gray-300">
                          {cell.date.getDate()}
                        </div>
                      </div>
                    );
                  }

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
                      ${isHovered && record ? "scale-105 shadow-md z-10" : ""}`}
                    >
                      <div
                        className={`text-xs mb-1 ${cell.isToday ? "font-black" : "font-bold"} ${s ? s.text : "text-gray-400"}`}
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
                          {Math.floor(record._totalDaySeconds / 3600)}h{" "}
                          {Math.floor((record._totalDaySeconds % 3600) / 60)}m
                        </div>
                      )}
                      {cell.isToday && !record && (
                        <div className="absolute inset-[-1px] rounded-xl border-2 border-blue-400 pointer-events-none" />
                      )}

                      {isHovered && record && (
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded-xl px-3 py-2 text-[11px] z-50 shadow-xl whitespace-nowrap">
                          <div className="font-bold mb-1">{cell.key}</div>
                          <div>In: {record.checkIn}</div>
                          <div>
                            Out:{" "}
                            {record.status === "In Progress"
                              ? "In Progress"
                              : record.checkOut}
                          </div>
                          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-gray-50">
              {[
                "Present",
                "In Progress",
                "Missed Punch",
                "Absent",
                "Leave",
              ].map((s) => (
                <LegendPill key={s} status={s} />
              ))}
            </div>
          </div>

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
                  {annualLeaveLeft <= 3 ? "⚠️" : ""}
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
