import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth, setUser } from "../action";
import axios from "axios";
import { RxCross2, RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Admin Bypass Logic (for development)
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
      navigate("/");
      return;
    }

    // Admin Bypass Logic (for development)
    if (userName === "employee" && password === "employee123") {
      const adminUserData = {
        id: "EMP01",
        user_name: "employee",
        name: "Employee",
        role: "employee",
      };
      localStorage.setItem("user", JSON.stringify(adminUserData));
      localStorage.setItem("token", "admin-bypass");
      dispatch(setUser(adminUserData));
      dispatch(setAuth(true));
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
      if (authToken) localStorage.setItem("token", authToken);
      dispatch(setUser(userData));
      dispatch(setAuth(true));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0f172a] overflow-hidden font-sans flex items-center justify-center p-4 md:p-0">
      {/* 1. BACKGROUND IMAGE & OVERLAYS */}
      <div className="absolute inset-0 z-0">
        <img
          src="./bgimagelogin.png"
          className="w-full h-full object-cover object-right"
          alt="Background"
        />
        <div className="absolute inset-0 bg-[#0f172a]/70 z-10"></div>
      </div>

      {/* FIXED LOGO */}
      <img
        src="./timexlogin.png"
        width="150"
        className="fixed top-8 right-20 z-50 opacity-100"
        alt="Logo"
      />

      {/* 2. MOBILE OVERLAY FORM */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0f172a]/80 backdrop-blur-xl transition-transform duration-500 ease-in-out md:hidden flex flex-col p-8 ${
          showMobileForm ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button
          onClick={() => setShowMobileForm(false)}
          className="self-end p-3 bg-white/5 rounded-full text-white mb-10"
        >
          <RxCross2 size={24} />
        </button>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 mb-8 italic">Sign in to your account</p>

          <LoginForm
            handleSubmit={handleSubmit}
            userName={userName}
            setUserName={setUserName}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            isLoading={isLoading}
            isMobileForm={true}
          />
        </div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT (Above Background) */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-8 w-full h-full md:h-[90vh] md:items-center px-6 md:px-12">
        {/* DESKTOP/RIGHT SIDE: TRANSPARENT FORM CONTAINER */}
        <div className="hidden md:flex md:col-span-6 xl:col-span-5 h-full">
          <div className="w-full bg-[#0f172a]/90 border border-white/10 p-10 lg:p-12 rounded-3xl shadow-2xl flex flex-col justify-center ">
            <div className="mb-10 flex flex-col text-center">
              <h2 className="text-[40px] font-black text-white tracking-tight mb-4">
                Sign In
              </h2>
              <p className="text-slate-400 text-base font-light italic">
                Enter your credentials to continue.
              </p>
            </div>
            <LoginForm
              handleSubmit={handleSubmit}
              userName={userName}
              setUserName={setUserName}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* DESKTOP/LEFT SIDE: TEXT CONTENT */}
        <div className="md:col-span-6 xl:col-span-7 flex flex-col justify-end md:justify-end h-full pt-20 md:pt-0 pb-12 md:pb-0 ">
          <div className="text-white max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-4">
              Smart Attendance
            </p>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-6">
              Simplify your <br />{" "}
              <span className="text-blue-400">workforce</span> management.
            </h1>
            <p className="text-slate-300 mt-4 max-w-lg hidden md:block text-base font-light">
              Access your personalized dashboard to manage attendance,
              schedules, and reports efficiently.
            </p>
          </div>

          {/* MOBILE ONLY TRIGGER BUTTON */}
          <button
            onClick={() => setShowMobileForm(true)}
            className="md:hidden w-full max-w-sm bg-white text-[#0f172a] py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all mb-8"
          >
            Sign In to Dashboard
          </button>

          {/* FOOTER */}
          <div className="text-[10px] md:text-xs flex items-center gap-3 text-white/40 uppercase tracking-widest font-semibold mt-auto md:mt-10">
            <p>© {currentYear}</p>
            <span>|</span>
            <a
              href="https://enyard.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              ENYARD
            </a>
            <span>|</span>
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({
  handleSubmit,
  userName,
  setUserName,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  isMobileForm = false,
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    {error && (
      <div className="p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
        {error}
      </div>
    )}

    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        Username
      </label>
      <input
        required
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        // Adjust background opacity of input for mobile vs desktop transparent form
        className={`w-full px-6 py-4 rounded-2xl border ${
          isMobileForm
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-white/10 bg-white/[0.05] text-white focus:bg-white/[0.08]"
        } focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
        placeholder="Enter username"
      />
    </div>

    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        Password
      </label>
      <div className="relative">
        <input
          required
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-6 py-4 rounded-2xl border ${
            isMobileForm
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-white/10 bg-white/[0.05] text-white focus:bg-white/[0.08]"
          } focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <RxEyeOpen size={20} /> : <RxEyeClosed size={20} />}
        </button>
      </div>
    </div>

    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-4 mt-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
    >
      {isLoading ? (
        <AiOutlineLoading3Quarters className="animate-spin" size={20} />
      ) : (
        "Sign In"
      )}
    </button>
  </form>
);

export default Login;
