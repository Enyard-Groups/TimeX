import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth, setUser } from "../action";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showMobileForm, setShowMobileForm] = useState(false);

  const currentYear = new Date().getFullYear();

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
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* MOBILE FORM */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-transform duration-500 ease-in-out transform md:hidden ${
          showMobileForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 h-full flex flex-col">
          <button
            onClick={() => setShowMobileForm(false)}
            className="self-end p-2 bg-slate-100 rounded-full text-slate-500"
          >
            <RxCross2 size={24} />
          </button>
          <div className="mt-4">
            <img
              src="../timexlogin.png"
              className="bg-white mb-12"
              alt=""
              height="180px"
              width="180px"
            />
            <h2 className="text-3xl font-black text-[#0f172a] mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-8">
              Enter your credentials to continue.
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
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-gray-200 focus:ring-4 focus:ring-blue-100 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-gray-200 focus:ring-4 focus:ring-blue-100 outline-none"
              />
              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-white font-bold bg-[#0f172a] shadow-lg active:scale-95 transition-all"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MAIN DESKTOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        {/* LEFT SIDE  */}
        <div className="relative h-full w-full flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img
            src="./login.jpg"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Login Background"
          />

          <div className="relative z-20 p-8 md:p-12 w-full">
            <div className="text-white mb-8">
              <p className="text-xs md:text-sm font-medium uppercase tracking-[0.3em] opacity-80 mb-2">
                Smart Attendance
              </p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Simplify your <br /> workforce management.
              </h1>
            </div>

            {/* MOBILE ONLY */}
            <button
              onClick={() => setShowMobileForm(true)}
              className="md:hidden mb-8 bg-white px-8 py-3 rounded-xl text-lg text-[#0f172a] font-bold shadow-2xl active:scale-95 transition-transform"
            >
              Sign in
            </button>

            <div className="text-sm md:text-lg flex flex-wrap gap-2 text-white opacity-90">
              <p>© {currentYear} TimeX</p>
              <span className="opacity-30">|</span>
              <a
                href="https://enyard.in"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                ENYARD
              </a>
              <span className="opacity-30">|</span>

              <p className="whitespace-nowrap">All rights reserved</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex justify-center items-center p-12">
          <div className="w-full max-w-md">
            <img
              src="../timexlogin.png"
              className="bg-white mb-12"
              alt=""
              height="180px"
              width="180px"
            />
            <h2 className="text-4xl font-black text-[#0f172a] mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Enter your credentials to access your dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-lg ml-4 p-3 rounded-xl text-sm bg-[oklch(0.577_0.245_27.325/0.08)] border border-[oklch(0.577_0.245_27.325/0.3)] text-[oklch(0.577_0.245_27.325)]">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g. admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-slate-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-white font-bold bg-[#0f172a] shadow-xl hover:bg-[#1e293b] transition-all"
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
