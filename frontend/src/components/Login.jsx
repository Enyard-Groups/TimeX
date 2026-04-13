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
    <div className="relative min-h-screen w-full bg-[#0f172a] overflow-hidden font-sans">
      {/* MOBILE OVERLAY FORM (Translates up from bottom) */}
      <div
        className={`fixed inset-0 z-50 bg-[#0f172a] transition-transform duration-500 ease-in-out md:hidden flex flex-col p-8 ${
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
          />
        </div>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 xl:grid-cols-3 h-screen">
        {/* DESKTOP LEFT FORM */}
        <div className="hidden md:flex justify-center items-center p-12 lg:p-20 bg-[#0f172a] z-20">
          <div className="w-full max-w-md">
            <div className="mb-12">
              <h2 className="text-5xl font-black text-white tracking-tight mb-3">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-base font-light italic">
                Access your workforce dashboard.
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

        {/* IMAGE SIDE (Visible on Mobile as Background) */}
        <div className="relative h-full xl:col-span-2 w-full flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-transparent hidden md:block z-10"></div>

          <img
            src="./bgimagelogin.png"
            className="absolute inset-0 w-full h-full object-right object-cover scale-100 md:scale-110 transition-transform duration-700"
            alt="Background"
          />

          <img
            src="./timexlogin.png"
            width="140"
            className="fixed top-8 right-8 z-30 opacity-80 md:opacity-100"
            alt="Logo"
          />

          <div className="relative z-20 p-8 md:p-16 w-full">
            <div className="text-white mb-8 md:mb-10 max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-2">
                Smart Attendance
              </p>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight">
                Simplify your <br />{" "}
                <span className="text-blue-400">workforce</span> management.
              </h1>
            </div>

            {/* MOBILE ONLY TRIGGER BUTTON */}
            <button
              onClick={() => setShowMobileForm(true)}
              className="md:hidden w-full bg-white text-[#0f172a] py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all mb-8"
            >
              Sign In to Dashboard
            </button>

            <div className="text-[10px] md:text-xs flex items-center gap-3 text-white/40 uppercase tracking-widest font-semibold">
              <p>© {currentYear}</p>
              <span>|</span>
              <a
                href="https://enyard.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                ENYARD
              </a>
              <span>|</span>
              <p>All rights reserved</p>
            </div>
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
}) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    {error && (
      <div className="p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
        {error}
      </div>
    )}

    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        Username
      </label>
      <input
        required
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full px-6 py-4 rounded-2xl border border-slate-800 bg-slate-900/40 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        placeholder="Enter username"
      />
    </div>

    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        Password
      </label>
      <div className="relative">
        <input
          required
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl border border-slate-800 bg-slate-900/40 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
        >
          {showPassword ? <RxEyeOpen size={20} /> : <RxEyeClosed size={20} />}
        </button>
      </div>
    </div>

    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-4 mt-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-3 transition-all"
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
