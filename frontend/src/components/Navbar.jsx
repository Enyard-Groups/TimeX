import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { IoMdNotificationsOutline } from "react-icons/io";
import Footer from "./Footer";
import { IoIosLogOut } from "react-icons/io";
import { logout } from "../action";
import { useNavigate, useLocation } from "react-router-dom";
import RightSidebar from "./RightSidebar";

export default function Navbar({
  rightSidebarOpen,
  setRightSidebarOpen,
  setOpenModal,
}) {
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
      <div className="pt-3">
        {/* Mobile Menu Button */}
        <button
          className="absolute top-11 left-6 rounded-xl lg:hidden text-xl font-bold z-30"
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            setRightSidebarOpen(false);
          }}
        >
          {sidebarOpen ? "" : "☰"}
        </button>

        {/* Top Right Icons */}
        {isDashboard && (
          <div
            className={`flex flex-row absolute top-7 right-4 z-40 gap-2 ${!sidebarOpen ? "flex" : "hidden"} lg:flex`}
          >
            <button
              onClick={handleLogout}
              className="bg-[#0f172a] rounded-full text-white p-1 cursor-pointer"
            >
              <IoIosLogOut className=" text-base xl:text-lg" />
            </button>

            <button
              onClick={() => setRightSidebarOpen(true)}
              className="bg-[#0f172a] rounded-full text-white p-1 cursor-pointer"
            >
              <IoMdNotificationsOutline className=" text-base xl:text-lg" />
            </button>

            <div
              onClick={() => setRightSidebarOpen(true)}
              className=" px-2 bg-[#0f172a] rounded-full text-white cursor-pointer text-base xl:text-lg"
            >
              {user?.user_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* RIGHT SIDEBAR */}
        <aside
          className={`fixed top-3 right-0 h-full w-72 bg-white shadow-xl border-l border-gray-200 z-[60] transform transition-transform duration-300 ${
            rightSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="cursor-pointer text-xl p-2"
              >
                ✕
              </button>
            </div>
            {/* Pass setOpenModal here */}
            <RightSidebar user={user} setOpenModal={setOpenModal} />
          </div>
        </aside>

        {/* LEFT SIDEBAR */}
        <aside
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
          } lg:translate-x-0 lg:w-64 z-40 bg-white`}
        >
          <Sidebar user={user} setSidebarOpen={setSidebarOpen} />
        </aside>

        <Footer rightSidebarOpen={rightSidebarOpen} />
      </div>
    </>
  );
}
