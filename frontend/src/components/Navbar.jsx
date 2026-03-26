import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { IoMdNotificationsOutline } from "react-icons/io";
import Footer from "./Footer";
import { IoIosLogOut } from "react-icons/io";
import { logout } from "../action";
import { useNavigate } from "react-router-dom";

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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <div>
        <button
          className="absolute top-7 left-6 rounded-xl lg:hidden transition-all text-xl font-bold text-[oklch(0.147_0.004_49.25)]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="flex flex-row absolute top-7 right-4">
        <div>
          <button
            onClick={handleLogout}
            className="text-[18px] bg-[#00173d] rounded-full text-white p-1.5 cursor-pointer"
          >
            <IoIosLogOut />
          </button>
        </div>

        <div ref={notificationRef}>
          <button
            onClick={() =>
              setNotificationsDropdownOpen(!notificationsDropdownOpen)
            }
            className="relative mx-2 text-[18px] bg-blue-950 rounded-full text-white p-1.5 cursor-pointer"
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

        <div>
          <div className="py-1 px-2.5 bg-blue-950 rounded-full text-white">
            {user?.user_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0 w-60 backdrop-blur-xl"
            : "-translate-x-full "
        } lg:translate-x-0 lg:w-60 z-40 bg-[oklch(1_0_0)]`}
      >
        <Sidebar user={user} />
      </aside>

      <Footer />
    </>
  );
}
