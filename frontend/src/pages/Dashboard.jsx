import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state);
  const [openModal, setopenModal] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === "admin";

  const handleUpdate = ()=>{
    toast.success("Password Updated")
    setopenModal(false)

  }

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
          onClick={() => setopenModal(false)}
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
                <RxCross2 className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <button
              onClick={handleUpdate}
              className="w-full mt-6 py-3 bg-[#00173d] text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
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
