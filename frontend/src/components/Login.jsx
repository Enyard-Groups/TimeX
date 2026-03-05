import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth, setUser } from "../action";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const adminName = import.meta.env.VITE_ADMIN_NAME;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === adminEmail && password === adminPassword) {
      const userData = { name: adminName, email, role: "admin" };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch(setUser(userData));
      dispatch(setAuth(true));
      navigate("/");
      return;
    }

    if (email === adminEmail && password !== adminPassword) {
      setError("Incorrect password for admin.");
      return;
    }

    const userData = { email, role: "employee" };
    localStorage.setItem("user", JSON.stringify(userData));
    dispatch(setUser(userData));
    dispatch(setAuth(true));
    navigate("/");
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

            <p className="mt-6 px-4 text-lg text-gray-600 max-w-sm leading-relaxed">
              <h2 className="text-xl font-bold mb-4">Welcome !</h2>
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
                <div className="p-4 rounded-xl text-sm font-medium bg-[oklch(0.577_0.245_27.325/0.08)] border border-[oklch(0.577_0.245_27.325/0.3)] text-[oklch(0.577_0.245_27.325)]">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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



// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setAuth, setUser } from "../action";

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const adminName = import.meta.env.VITE_ADMIN_NAME;
//   const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
//   const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (email === adminEmail && password === adminPassword) {
//       const userData = { name: adminName, email, role: "admin" };

//       localStorage.setItem("user", JSON.stringify(userData));
//       dispatch(setUser(userData));
//       dispatch(setAuth(true));
//       navigate("/");
//       return;
//     }

//     if (email === adminEmail && password !== adminPassword) {
//       setError("Incorrect password for admin.");
//       return;
//     }

//     const userData = { email, role: "employee" };

//     localStorage.setItem("user", JSON.stringify(userData));
//     dispatch(setUser(userData));
//     dispatch(setAuth(true));
//     navigate("/");
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4"
//       style={{ backgroundColor: "oklch(1 0 0)" }}
//     >
//       <div
//         className="max-w-md w-full p-10 rounded-3xl border shadow-xl"
//         style={{
//           backgroundColor: "oklch(1 0 0)",
//           borderColor: "oklch(0.923 0.003 48.717)",
//         }}
//       >
//         {/* Header */}
//         <div className="mb-10 text-center">
//           <h1
//             className="text-4xl font-black tracking-tight"
//             style={{ color: "oklch(0.147 0.004 49.25)" }}
//           >
//             Time
//             <span style={{ color: "oklch(0.645 0.246 16.439)" }}>X</span>
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/* Error */}
//           {error && (
//             <div
//               className="p-4 rounded-xl text-xs font-bold border"
//               style={{
//                 color: "oklch(0.577 0.245 27.325)",
//                 backgroundColor: "oklch(0.577 0.245 27.325 / 0.06)",
//                 borderColor: "oklch(0.577 0.245 27.325 / 0.2)",
//               }}
//             >
//               {error}
//             </div>
//           )}

//           {/* Email */}
//           <div className="space-y-2">
//             <label
//               className="block text-[10px] font-bold uppercase tracking-[0.2em]"
//               style={{ color: "oklch(0.147 0.004 49.25 / 0.6)" }}
//             >
//               Email
//             </label>

//             <input
//               type="email"
//               required
//               placeholder="example@gmail.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-5 py-4 rounded-2xl outline-none font-medium transition-all"
//               style={{
//                 backgroundColor: "oklch(0.97 0.001 106.424)",
//                 border: "1px solid oklch(0.923 0.003 48.717)",
//               }}
//               onFocus={(e) =>
//                 (e.target.style.border =
//                   "1px solid oklch(0.645 0.246 16.439)")
//               }
//               onBlur={(e) =>
//                 (e.target.style.border =
//                   "1px solid oklch(0.923 0.003 48.717)")
//               }
//             />
//           </div>

//           {/* Password */}
//           <div className="space-y-2">
//             <label
//               className="block text-[10px] font-bold uppercase tracking-[0.2em]"
//               style={{ color: "oklch(0.147 0.004 49.25 / 0.6)" }}
//             >
//               Password
//             </label>

//             <input
//               type="password"
//               required
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-5 py-4 rounded-2xl outline-none font-medium transition-all"
//               style={{
//                 backgroundColor: "oklch(0.97 0.001 106.424)",
//                 border: "1px solid oklch(0.923 0.003 48.717)",
//               }}
//               onFocus={(e) =>
//                 (e.target.style.border =
//                   "1px solid oklch(0.645 0.246 16.439)")
//               }
//               onBlur={(e) =>
//                 (e.target.style.border =
//                   "1px solid oklch(0.923 0.003 48.717)")
//               }
//             />
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             className="w-full py-4 mt-4 rounded-2xl text-white font-black text-lg tracking-tight transition-all active:scale-[0.98]"
//             style={{
//               backgroundColor: "oklch(0.645 0.246 16.439)",
//               boxShadow:
//                 "0 20px 25px -5px oklch(0.645 0.246 16.439 / 0.3)",
//             }}
//           >
//             Sign In
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;