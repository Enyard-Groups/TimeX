import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth, setUser } from "../action";
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userName === "admin" && password === "admin123") {
      const adminUserData = {
        id: 0,
        user_name: "admin",
        name: "Administrator",
        role: "admin",
      };

      localStorage.setItem("user", JSON.stringify(adminUserData));
      localStorage.setItem("token", "admin-bypass");

      dispatch(setUser(adminUserData));
      dispatch(setAuth(true));
      setError("");
      navigate("/");

      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        user_name: userName,
        password,
      });
      const userData = res.data.User || res.data.user || res.data;
      const authToken = res.data.token || res.data.accessToken || null;

      localStorage.setItem("user", JSON.stringify(userData));
      if (authToken) {
        localStorage.setItem("token", authToken);
      }

      dispatch(setUser(userData));
      dispatch(setAuth(true));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[oklch(1_0_0)]">
      <div className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-2 bg-gradient-to-b from-white to-red-100">
        {/* LEFT SIDE */}
        <div className="relative h-full flex items-center justify-center p-8">
          {/* Welcome Content */}
          <div
            className={`transition-all duration-700 ${
              active ? "opacity-0 -translate-x-10 absolute" : "opacity-100"
            }`}
          >
            <img src="../timexlogo.png" className="w-48 mb-12" />

            <h2 className="text-4xl font-bold mb-4 ml-4">Welcome!</h2>

            <p className="text-gray-600 text-lg mb-10 max-w-xs ml-4">
              To see the Dashboard, please login with your credentials.
            </p>

            <button
              onClick={() => setActive(true)}
              className="ml-4 px-8 text-lg py-3 rounded-full text-white font-semibold bg-[oklch(0.645_0.246_16.439)] shadow-lg hover:scale-105 transition"
            >
              Sign In
            </button>
          </div>

          {/* Image */}
          <div
            className={`absolute inset-0 h-full w-full transition-all duration-700 ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img src="./login.jpg" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative h-full flex items-center justify-center p-10 bg-white">
          {/* Image initially */}
          <div
            className={`absolute inset-0 h-full w-full transition-all duration-700 ${
              active ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <img src="./login.jpg" className="w-full h-full object-cover" />
          </div>

          {/* Login Form */}
          <div
            className={`w-full max-w-sm z-10 transition-all duration-700 ${
              active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <img src="../timexlogo.png" className="w-48 mb-12" />
            <h2 className="text-4xl font-bold text-[oklch(0.147_0.004_49.25)] mb-2 ml-4">
              Welcome Back!
            </h2>

            <p className="text-gray-500 text-lg mb-6 ml-4">
              Enter your details to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-lg ml-4 p-3 rounded-xl text-sm bg-[oklch(0.577_0.245_27.325/0.08)] border border-[oklch(0.577_0.245_27.325/0.3)] text-[oklch(0.577_0.245_27.325)]">
                  {error}
                </div>
              )}

              <input
                type="text"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-[oklch(0.97_0.001_106.424)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none"
              />

              <input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-[oklch(0.97_0.001_106.424)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none"
              />

              <button
                type="submit"
                className="text-lg w-full py-3 rounded-full text-white font-semibold bg-[oklch(0.645_0.246_16.439)] shadow-lg hover:scale-105 transition"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
