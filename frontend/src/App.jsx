/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MasterRoute from "./SidebarComponents/Masters/MasterRoute";
import DeviceRoute from "./SidebarComponents/DeviceManagment/DeviceRoute";
import TransactionRoute from "./SidebarComponents/Transaction/TransactionRoute";
import GeofencingRoute from "./SidebarComponents/Geofencing/GeofencingRoute";
import RequestsRoute from "./SidebarComponents/Requests/RequestsRoute";
import ApprovalsRoute from "./SidebarComponents/Approvals/ApprovalRoute";
import ReportsRoute from "./SidebarComponents/Reports/ReportsRoute";
import VisitorRoute from "./SidebarComponents/VisitorManagement/VisitorRoute";
import FormsRoute from "./SidebarComponents/Forms/FormsRoute";
import MyProfile from "./components/MyProfile";
import { load, setAuth, setUser } from "./action";

const App = () => {
  const dispatch = useDispatch();
const isAuthenticated = useSelector((state) => state.isAuthenticated);
const user = useSelector((state) => state.user);
const loading = useSelector((state) => state.loading);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
      dispatch(setAuth(true));
    }

    dispatch(load());
  }, [dispatch]);

  if (loading) {
    return null;
  }

  const privateRoute = (Component) => {
    return isAuthenticated ? (
      <Component user={user} />
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <>
      <Toaster position="top-center" />

      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Private Routes */}
          <Route path="/dashboard" element={privateRoute(Dashboard)} />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/masters/*" element={privateRoute(MasterRoute)} />
          <Route
            path="/devicemanagements/*"
            element={privateRoute(DeviceRoute)}
          />
          <Route
            path="/transaction/*"
            element={privateRoute(TransactionRoute)}
          />
          <Route path="/geofencing/*" element={privateRoute(GeofencingRoute)} />
          <Route path="/requests/*" element={privateRoute(RequestsRoute)} />
          <Route path="/approvals/*" element={privateRoute(ApprovalsRoute)} />
          <Route path="/reports/*" element={privateRoute(ReportsRoute)} />
          <Route path="/visitor/*" element={privateRoute(VisitorRoute)} />
          <Route path="/forms/*" element={privateRoute(FormsRoute)} />
          <Route path="/my-profile" element={privateRoute(MyProfile)} />

          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-10 text-center">404 - Not Found</div>}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
