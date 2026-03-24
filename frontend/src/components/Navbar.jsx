import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { IoMdNotificationsOutline } from "react-icons/io";

export default function Navbar() {
  const user = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] =
    useState(false);
  const [notifications] = useState([]);

  const sidebarRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }

      if (
        notificationsDropdownOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, notificationsDropdownOpen]);

  return (
    <>
      <button
        className="p-2 relative top-4 left-4 rounded-xl lg:hidden transition-all bg-[oklch(0.97_0.001_106.424)] text-[oklch(0.147_0.004_49.25)]"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      <div ref={notificationRef} className="absolute top-5 right-4">
        <button
          onClick={() =>
            setNotificationsDropdownOpen(!notificationsDropdownOpen)
          }
          className="relative md:mr-4 text-2xl text-[oklch(0.147_0.004_49.25)] cursor-pointer"
        >
          <IoMdNotificationsOutline />

          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-[oklch(0.577_0.245_27.325)] text-white">
              {notifications.length}
            </span>
          )}
        </button>

        {notificationsDropdownOpen && (
          <div
            className="absolute right-4 mt-3 w-60 sm:w-88 h-80 rounded-2xl shadow-xl border bg-[oklch(1_0_0)] border-[oklch(0.923_0.003_48.717)] overflow-hidden z-50"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="p-4 border-b border-[oklch(0.923_0.003_48.717)] font-semibold text-[oklch(0.147_0.004_49.25)]">
              Notifications
            </div>

            <div
              className="overflow-y-auto h-[calc(100%-56px)] p-3"
              style={{ scrollbarWidth: "none" }}
            >
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-full text-md opacity-60 text-[oklch(0.147_0.004_49.25)]">
                  No Notifications
                </div>
              ) : (
                notifications.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 mb-2 rounded-xl bg-[oklch(0.97_0.001_106.424)] hover:bg-[oklch(0.923_0.003_48.717)] transition text-md text-[oklch(0.147_0.004_49.25)]"
                  >
                    {item.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0 w-56 backdrop-blur-xl"
            : "-translate-x-full "
        } lg:translate-x-0 lg:w-56 z-40 bg-[oklch(1_0_0)] border-r border-[oklch(0.923_0.003_48.717)]`}
      >
        <Sidebar user={user} />
      </aside>
    </>
  );
}
