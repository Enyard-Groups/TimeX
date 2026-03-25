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
      className="min-h-screen bg-red-50/50 pt-2"
      style={{
        scrollbarWidth: "none",
      }}
    >
      <Navbar user={user} />

      <main className="bg-white rounded-t-3xl mb-4 lg:ml-60 pt-4 mt-2 p-6 md:p-10">
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
