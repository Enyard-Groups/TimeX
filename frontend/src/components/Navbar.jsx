import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { IoMdNotificationsOutline } from "react-icons/io";
import Footer from "./Footer";
import { IoIosLogOut } from "react-icons/io";
import { logout } from "../action";
import { useNavigate } from "react-router-dom";
import RightSidebar from "./RightSidebar";

export default function Navbar() {
  const user = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

        <div>
          <button
            onClick={() => {
              setRightSidebarOpen(true);
            }}
            className="relative mx-2 text-[18px] bg-blue-950 rounded-full text-white p-1.5 cursor-pointer"
          >
            <IoMdNotificationsOutline />
          </button>
        </div>

        <div
          onClick={() => {
            setRightSidebarOpen(true);
          }}
          className="py-1 px-2.5 bg-blue-950 rounded-full text-white cursor-pointer"
        >
          {user?.user_name.charAt(0).toUpperCase()}
        </div>
      </div>

      {rightSidebarOpen && (
        <div className="fixed top-3 right-0 rounded-tr-4xl h-full w-72 bg-white shadow-xl z-10 p-4 transform transition-transform duration-300 max-h-[90vh]">
          <div className="flex justify-between">
            <h1 className="text-gray-600 font-medium"></h1>
            <button
              className="text-[#003386] font-bold"
              onClick={() => setRightSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <RightSidebar user={user} />
        </div>
      )}

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
