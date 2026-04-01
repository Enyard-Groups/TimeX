import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { useState } from "react";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state);

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <main
          className={` bg-white px-6 pt-4 mt-3 mb-12 lg:ml-64 rounded-tl-3xl transition-all duration-300 flex-1 overflow-hidden ${
            rightSidebarOpen ? "lg:mr-72" : "mr-0 rounded-tr-3xl"
          }`}
        >
          {/* SCROLL ONLY HERE */}
          <div
            className="h-full overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {isAdmin ? (
              <AdminDashboard user={user} />
            ) : (
              <EmployeeDashboard user={user} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
