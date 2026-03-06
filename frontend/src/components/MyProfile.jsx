import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const MyProfile = () => {
  const { user, isAuthenticated } = useSelector((state) => state);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        backgroundColor: "oklch(0.97 0.001 106.424)",
      }}
    >
      <Navbar user={user} />

      <main className="flex-1 md:ml-64 mt-16 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600">
              {user.name?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase()}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">
                {user.name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t" />

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-md text-gray-600 mb-1">
                Full Name
              </label>
              <p className="text-gray-800 font-medium">
                {user?.name || user?.email?.split("@")[0] || "Not provided"}
              </p>
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Email Address
              </label>
              <p className="text-gray-800 font-medium">
                {user?.email || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
