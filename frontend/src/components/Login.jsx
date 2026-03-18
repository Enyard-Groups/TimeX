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

    try {
      const res = await axios.post("http://localhost:3000/api/users/login", { user_name: userName, password });
      const userData = res.data.User || res.data.user || res.data;
      const authToken = res.data.token || res.data.accessToken || null;

      localStorage.setItem("user", JSON.stringify(userData));
      if (authToken) {
        localStorage.setItem("token", authToken);
      }

      dispatch(setUser(userData));
      dispatch(setAuth(true));
      navigate("/");


    } 
    catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(1_0_0)] ">
      {/* Main Card */}
      <div className=" shadow-2xl m-4 w-full max-w-5xl rounded-3xl backdrop-blur-xl px-4 py-10 grid md:grid-cols-2 transition-all duration-700">
        {/* LEFT SIDE */}
        <div className="flex items-center justify-center">
          {/* Welcome Content */}
          <div
            className={`absolute transition-all duration-700 ${
              active ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
            }`}
          >
            <h1 className="text-5xl font-black tracking-tight text-[oklch(0.147_0.004_49.25)] p-4">
              Time<span className="text-[oklch(0.645_0.246_16.439)]">X</span>
            </h1>

              <h2 className="text-xl font-bold mb-4">Welcome !</h2>
            <p className="mt-6 px-4 text-lg text-gray-600 max-w-sm leading-relaxed">
              To see the Dashboard, Please login with your Credentials.
            </p>
            <button
              onClick={() => setActive(true)}
              className="w-fit mx-4 mt-10 py-4 px-6 rounded-full text-white font-bold text-lg bg-[oklch(0.645_0.246_16.439)] shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Left Image after Slide */}
          <div
            className={`transition-all duration-700 ${
              active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none "
            }`}
          >
            <img src="./Login.png" className="rounded-full" />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center ">
          {/* Image Initially */}
          <div
            className={`absolute transition-all duration-700 ${
              active
                ? "opacity-0 -translate-x-10 pointer-events-none z-0"
                : "opacity-100 translate-x-0 pointer-events-auto z-10"
            }`}
          >
            <img src="./Login.png" className="rounded-full" />
          </div>

          {/* Login Form */}
          <div
            className={`w-full max-w-sm transition-all duration-700 ${
              active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-[oklch(0.147_0.004_49.25)] mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-500 mb-8">
              Enter your personal details and see the Dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl text-md font-medium bg-[oklch(0.577_0.245_27.325/0.08)] border border-[oklch(0.577_0.245_27.325/0.3)] text-[oklch(0.577_0.245_27.325)]">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-[oklch(0.97_0.001_106.424)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-[oklch(0.97_0.001_106.424)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full text-white font-bold text-lg bg-[oklch(0.645_0.246_16.439)] shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
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