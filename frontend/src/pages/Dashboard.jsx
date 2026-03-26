import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === "admin";

  return (
    <div
      className="min-h-screen bg-[#00173d] pt-1"
      style={{
        scrollbarWidth: "none",
      }}
    >
      <Navbar user={user} />

      <main className="bg-white px-6 rounded-t-3xl mb-12 lg:ml-60 pt-4 mt-2 ">
        {isAdmin ? (
          <AdminDashboard user={user} />
        ) : (
          <EmployeeDashboard user={user} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
