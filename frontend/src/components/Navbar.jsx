import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../action";
import Sidebar from "./Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] =
    useState(false);
  const [notifications] = useState([]);

  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
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
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
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
  }, [sidebarOpen, dropdownOpen, notificationsDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  const formattedName =
    user?.email?.split("@")[0]?.charAt(0)?.toUpperCase() +
    user?.email?.split("@")[0]?.slice(1)?.toLowerCase();

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b backdrop-blur-xl bg-[oklch(1_0_0)] border-[oklch(0.923_0.003_48.717)]">
        <div className="h-20 px-6 md:px-14 flex items-center justify-between mx-auto">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              className="p-2 rounded-xl md:hidden transition-all bg-[oklch(0.97_0.001_106.424)] text-[oklch(0.147_0.004_49.25)]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>

            {/* Logo */}
            <div className="text-2xl font-black tracking-tight text-[oklch(0.147_0.004_49.25)]">
              <Link to="/dashboard">
                Time
                <span className="text-[oklch(0.645_0.246_16.439)]">X</span>
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 relative">
            {/* Notifications */}
            <div ref={notificationRef}>
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
                <div className="absolute right-0 mt-3 w-60 sm:w-88 h-80 rounded-2xl shadow-xl border bg-[oklch(1_0_0)] border-[oklch(0.923_0.003_48.717)] overflow-hidden z-50">
                  <div className="p-4 border-b border-[oklch(0.923_0.003_48.717)] font-semibold text-[oklch(0.147_0.004_49.25)]">
                    Notifications
                  </div>

                  <div className="overflow-y-auto h-[calc(100%-56px)] p-3">
                    {notifications.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm opacity-60 text-[oklch(0.147_0.004_49.25)]">
                        No Notifications
                      </div>
                    ) : (
                      notifications.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 mb-2 rounded-xl bg-[oklch(0.97_0.001_106.424)] hover:bg-[oklch(0.923_0.003_48.717)] transition text-sm text-[oklch(0.147_0.004_49.25)]"
                        >
                          {item.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="hidden sm:block text-[oklch(0.147_0.004_49.25)]">
              <p className="text-md font-bold">
                {user?.name || formattedName || "User"}
              </p>
              <p className="text-sm mt-1 opacity-60">
                {user?.role?.charAt(0).toUpperCase() +
                  user?.role?.slice(1).toLowerCase()}
              </p>
            </div>

            {/* Avatar */}
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-12 h-12 rounded-full flex items-center justify-center font-black shadow-md cursor-pointer transition-all hover:scale-105 bg-[oklch(0.645_0.246_16.439)] text-white"
              >
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-14 w-56 rounded-xl border shadow-xl bg-[oklch(1_0_0)] border-[oklch(0.923_0.003_48.717)]">
                  <Link to="/my-profile">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-6 my-2 pt-2 text-sm font-semibold text-[oklch(0.147_0.004_49.25)]"
                    >
                      My Profile
                    </button>
                  </Link>

                  <div className="m-3 px-3 text-[oklch(0.147_0.004_49.25)]">
                    <p className="text-sm font-bold">
                      {user?.name || formattedName || "User"}
                    </p>
                    <p className="text-xs mt-1 opacity-60">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-6 py-3 text-sm font-semibold border-t border-[oklch(0.923_0.003_48.717)] text-[oklch(0.577_0.245_27.325)]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0 w-56" : "-translate-x-full"
        } md:translate-x-0 md:w-56 z-40 bg-[oklch(1_0_0)] border-r border-[oklch(0.923_0.003_48.717)]`}
      >
        <Sidebar user={user} />
      </aside>
    </>
  );
}
