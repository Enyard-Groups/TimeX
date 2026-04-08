import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { IoMdNotificationsOutline } from "react-icons/io";
import Footer from "./Footer";
import { IoIosLogOut } from "react-icons/io";
import { logout } from "../action";
import { useNavigate } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import { useLocation } from "react-router-dom";

export default function Navbar({ rightSidebarOpen, setRightSidebarOpen }) {
  const user = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <div className="pt-4 ">
        {/* LEFT MENU BUTTON */}
        <button
          className="absolute top-8 left-6 rounded-xl lg:hidden text-xl font-bold"
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            setRightSidebarOpen(false);
          }}
        >
          {sidebarOpen ? "" : "☰"}
        </button>

        {/* RIGHT ICONS */}
        {isDashboard && (
          <div
            className={`flex flex-row absolute top-7 right-4 z-50 gap-2 
           ${!sidebarOpen ? "flex" : "hidden"} lg:flex`}
          >
            <button
              onClick={handleLogout}
              className="text-[18px] bg-[#0f172a] rounded-full text-white p-1.5"
            >
              <IoIosLogOut />
            </button>

            <button
              onClick={() => setRightSidebarOpen(true)}
              className="text-[18px] bg-[#0f172a] rounded-full text-white p-1.5"
            >
              <IoMdNotificationsOutline />
            </button>

            <div
              onClick={() => setRightSidebarOpen(true)}
              className="py-1 px-2.5 bg-[#0f172a] rounded-full text-white cursor-pointer"
            >
              {user?.user_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* RIGHT SIDEBAR */}
        <aside
          className={`fixed top-3 right-0 h-full w-72 bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300 ${
            rightSidebarOpen
              ? "translate-x-0 rounded-tr-3xl"
              : "translate-x-full"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="cursor-pointer"
              >
                ✕
              </button>
            </div>

            <RightSidebar user={user} />
          </div>
        </aside>

        {/* LEFT SIDEBAR */}
        <aside
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
          } lg:translate-x-0 lg:w-64 z-40 bg-white`}
        >
          <div className="lg:hidden absolute right-5 top-5 text-white text-lg font-bold ">
            <button
              onClick={() => setSidebarOpen(false)}
              className="cursor-pointer"
            >
              ✕
            </button>
          </div>
          <Sidebar user={user} />
        </aside>

        <Footer rightSidebarOpen={rightSidebarOpen} />
      </div>
    </>
  );
}
