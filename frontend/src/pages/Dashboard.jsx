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
      className="min-h-screen"
      style={{
        scrollbarWidth: "none",
      }}
    >
      <Navbar user={user} />

      <main className="lg:ml-52 mb-12 p-6 md:p-10">
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
