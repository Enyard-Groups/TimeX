import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { useState } from "react";
import { RxCross2, RxEyeClosed, RxEyeOpen } from "react-icons/rx";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state);
  const [openModal, setopenModal] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === "admin";

  const handleUpdate = () => {
    if (password !== confirmPassword) {
      setError("Password not match");
    } else {
      toast.success("Password Updated");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setopenModal(false);
    }
  };

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden relative">
      <Navbar
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        setOpenModal={setopenModal}
      />

      <div className="flex-1 flex overflow-hidden">
        <main
          className={`bg-white px-6 pt-4 mb-12 lg:ml-64 rounded-tl-3xl transition-all duration-300 flex-1 overflow-hidden ${
            rightSidebarOpen ? "lg:mr-72" : "mr-0 rounded-tr-3xl"
          }`}
        >
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

      {/* FULL SCREEN MODAL AT DASHBOARD CENTER */}
      {openModal && (
        <div
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">
                Change Password
              </h2>
              <button
                onClick={() => setopenModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <RxCross2
                  onClick={() => {
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  className="text-xl text-gray-500"
                />
              </button>
            </div>

            {error && (
              <div className="p-4 mx-6 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                {error}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3/5 -translate-y-1/2 p-2 text-slate-500"
                  >
                    {showPassword ? (
                      <RxEyeOpen size={20} />
                    ) : (
                      <RxEyeClosed size={20} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-4 top-3/5 -translate-y-1/2 p-2 text-slate-500 "
                  >
                    {showRepeatPassword ? (
                      <RxEyeOpen size={20} />
                    ) : (
                      <RxEyeClosed size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full mt-6 py-3 bg-[#00173d] text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
