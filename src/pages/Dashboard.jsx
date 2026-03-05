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
      className="min-h-screen flex"
      style={{
        backgroundColor: "oklch(0.97 0.001 106.424)",
        scrollbarWidth: "none",
      }}
    >
      <Navbar user={user} />

      <main className="flex-1 md:ml-64 mt-16 p-6 md:p-10">
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