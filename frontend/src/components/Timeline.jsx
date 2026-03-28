import React, { useEffect, useState, useRef, useMemo } from "react";

const Timeline = ({ userData = [] }) => {
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef(null);

  // 1. Time Calculations
  const currentSecondsNow =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const endHour = now.getHours() + 1;
  const totalSecondsToDisplay = endHour * 3600;
  const hourWidth = 120;
  const timelineWidth = endHour * hourWidth;

  const getSecondsFromTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  };

  // 2. Memoized Sorted Events
  const sortedEvents = useMemo(() => {
    const events = [];
    userData.forEach((user) => {
      const inSecs = getSecondsFromTime(user.checkin);
      if (inSecs <= currentSecondsNow) {
        events.push({
          ...user,
          type: "IN",
          timeSecs: inSecs,
          displayTime: user.checkin,
        });
      }
      if (user.checkout) {
        const outSecs = getSecondsFromTime(user.checkout);
        if (outSecs <= currentSecondsNow) {
          events.push({
            ...user,
            type: "OUT",
            timeSecs: outSecs,
            displayTime: user.checkout,
          });
        }
      }
    });
    return events.sort((a, b) => b.timeSecs - a.timeSecs);
  }, [userData, currentSecondsNow]);

  // 3. Clock Timer (Updates State every second)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Scroll Logic (Triggers on entry changes or hour transitions)
  useEffect(() => {
    if (scrollRef.current) {
      const scrollPosition =
        (currentSecondsNow / totalSecondsToDisplay) * timelineWidth - 250;

      // Using scrollTo with behavior smooth for a better UX when new entries appear
      scrollRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, [sortedEvents, endHour]);

  const getPosition = (seconds) => (seconds / totalSecondsToDisplay) * 100;
  const nowPosition = (currentSecondsNow / totalSecondsToDisplay) * 100;

  const timeLabels = Array.from(
    { length: endHour + 1 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`,
  );

  return (
    <div className="bg-white rounded-3xl p-6 w-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-md font-bold text-gray-800 tracking-tight">
          Live Attendance Feed
        </h2>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-[#3572ff]">
            <div className="w-2 h-2 rounded-full bg-[#3572ff] animate-pulse" />{" "}
            Check-in
          </div>
          <div className="flex items-center gap-1.5 text-[#11a5ac]">
            <div className="w-2 h-2 rounded-full bg-[#11a5ac]" /> Check-out
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative border border-gray-100 rounded-2xl overflow-x-auto overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          height: "450px",
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
          <div className="flex border-b border-gray-100 bg-gray-50/95 backdrop-blur-md sticky top-0 z-50">
            {timeLabels.map((time) => (
              <div
                key={time}
                className="flex-none text-[10px] font-extrabold text-gray-400 py-3 border-r border-gray-100 last:border-0"
                style={{ width: `${hourWidth}px`, paddingLeft: "10px" }}
              >
                {time}
              </div>
            ))}
          </div>

          <div
            className="relative bg-white"
            style={{
              height: `${Math.max(sortedEvents.length * 60 + 80, 400)}px`,
            }}
          >
            {timeLabels.map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-r border-gray-100 pointer-events-none"
                style={{ left: `${(i / endHour) * 100}%` }}
              />
            ))}

            {/* NOW INDICATOR */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-start z-30 pointer-events-none transition-all duration-1000 linear"
              style={{ left: `${nowPosition}%` }}
            >
              <div className="bg-indigo-950 text-white text-[9px] font-black px-2 py-0.5 rounded-r-full mt-1 shadow-lg uppercase">
                Now
              </div>
              <div className="w-0 h-full border-l-2 border-dashed border-indigo-400 opacity-60"></div>
            </div>

            {sortedEvents.map((event, index) => {
              const leftPos = getPosition(event.timeSecs);
              const rowTop = 25 + index * 60;
              const isCheckIn = event.type === "IN";

              return (
                <div
                  key={`${event.enrollmentId}-${event.type}`}
                  className="contents"
                >
                  <div
                    className="absolute w-full border-t border-gray-50 pointer-events-none"
                    style={{ top: `${rowTop + 18}px` }}
                  />
                  <div
                    className={`absolute flex items-center gap-2 p-1 pr-4 rounded border-l-2 shadow-sm z-20 transition-all duration-500 ${
                      isCheckIn
                        ? " bg-[#e3e9f7] text-gray-700 border-[#3572ff]"
                        : "bg-[#e3f6f7] text-gray-700 border-[#11a5ac]"
                    }`}
                    style={{ left: `${leftPos}%`, top: `${rowTop}px` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex justify-center items-center font-bold text-[10px]">
                      {event.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col leading-tight whitespace-nowrap">
                      <span className="text-[10px] font-bold text-gray-800">
                        {event.name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold ${isCheckIn ? "text-[#3572ff]" : "text-[#11a5ac]"}`}
                      >
                        {event.type} • {event.displayTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 font-medium">
        <p>* Feed tracks time in real-time seconds.</p>
        <p className="italic">Time: {now.toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default Timeline;
