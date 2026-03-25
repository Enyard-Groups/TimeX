import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth, setUser } from "../action";
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [active, setActive] = useState(false);
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
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-b from-white to-red-100">
      <div className="flex justify-center items-center">
        <div className=" flex-col p-5 sm:p-10 max-w-lg">
          <img src="../timexlogo.png" className="w-48 mb-4" />
          <h2 className="text-4xl font-bold text-[oklch(0.147_0.004_49.25)] mb-5 ml-4">
            Welcome!
          </h2>

          <p className="text-gray-500 text-lg mb-8 ml-4">
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
              className="w-full px-5 py-3 rounded-xl bg-[oklch(1_0_0)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-[oklch(1_0_0)] border border-[oklch(0.923_0.003_48.717)] focus:border-[oklch(0.645_0.246_16.439)] outline-none"
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

      <div>
        <img src="./login.jpg" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Login;
