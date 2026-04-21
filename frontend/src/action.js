import * as types from "./actionTypes";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

// Auth Actions
export const setAuth = (value) => {
  return {
    type: types.SET_AUTH,
    payload: value,
  };
};

export const setUser = (user) => {
  return {
    type: types.SET_USER,
    payload: user,
  };
};

export const logout = () => {
  return {
    type: types.LOGOUT,
  };
};

export const load = () => {
  return { type: types.APP_READY };
};

// Helper function to generate the 10-year mock data
const generateHistoricalData = () => {
  const dates = [];
  const today = new Date();
  const totalDays = 365 * 10;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Company growth logic
    const totalEmployees = 50 + Math.floor(((totalDays - i) / totalDays) * 100);

    const presentToday = isWeekend
      ? Math.floor(Math.random() * (totalEmployees * 0.1)) + 5
      : Math.floor(Math.random() * (totalEmployees * 0.2)) +
      Math.floor(totalEmployees * 0.7);

    dates.push({
      date: dateStr,
      totalEmployees,
      presentToday,
      leave: isWeekend
        ? 0
        : Math.floor(Math.random() * (totalEmployees * 0.05)),
      earlyin: isWeekend
        ? 0
        : Math.floor(Math.random() * (totalEmployees * 0.1)),
      latein: isWeekend
        ? 0
        : Math.floor(Math.random() * (totalEmployees * 0.08)),
    });
  }
  return dates;
};

export const fetchAttendanceStats = () => async (dispatch) => {
  dispatch({ type: types.GET_ATTENDANCE_REQUEST });

  try {
    /** * Logic: If you want to use the API, uncomment below.
     * Otherwise, use the generator for mock data.
     */
    // const res = await axios.get("/api/attendance/stats");
    // const data = res.data;

    const data = generateHistoricalData(); // Using your 10-year logic

    dispatch({
      type: types.GET_ATTENDANCE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_ATTENDANCE_FAILURE,
      payload: error.message,
    });
  }
};

// action.js
const toDbDate = (record) => {
  if (record?._dbDate) return record._dbDate; // preferred
  // Try to derive ISO date from _inTime
  if (record?._inTime) {
    try {
      return new Date(record._inTime).toISOString().split("T")[0];
    } catch {
      // fallthrough
    }
  }
  return null;
};

export const addRecord = (record) => async (dispatch) => {
  try {
    const payload = {
      id: record.id,
      user_id: record.userID,
      username: record.username,
      date: toDbDate(record),
      check_in: record.checkIn,
      check_out: record.checkOut && record.checkOut !== "-" ? record.checkOut : null,
      status: record.status,
      hours: record.hours,
      location: record.location,
      photo: record.photo,
      checkin_device: record.checkinDevice,
      checkout_device: record.checkoutDevice,
      _in_time: record._inTime,
      _session_seconds: record._sessionSeconds ?? 0,
      _prev_day_seconds: record._prevDaySeconds ?? 0,
    };

    const res = await axios.post(`${API_BASE}/attendence/records`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const existing = JSON.parse(localStorage.getItem("records") || "[]");
    const updated = [res.data, ...existing];
    localStorage.setItem("records", JSON.stringify(updated));
    dispatch({ type: types.ADD_RECORD, payload: res.data });
    return res.data;
  } catch (error) {
    // Fallback to local-only if API fails
    const existing = JSON.parse(localStorage.getItem("records") || "[]");
    const updated = [record, ...existing];
    localStorage.setItem("records", JSON.stringify(updated));
    dispatch({ type: types.ADD_RECORD, payload: record });
    return record;
  }
};

export const updateRecord = (data) => async (dispatch) => {
  // If caller passes an array, keep existing local behavior (midnight finalize etc.)
  if (Array.isArray(data)) {
    localStorage.setItem("records", JSON.stringify(data));
    dispatch({ type: types.UPDATE_RECORD, payload: data });
    return;
  }

  // Single-record update persists to backend
  const record = data;
  try {
    const payload = {
      check_out: record.checkOut && record.checkOut !== "-" ? record.checkOut : null,
      status: record.status,
      hours: record.hours,
      location: record.location,
      photo: record.photo,
      checkout_device: record.checkoutDevice,
      _session_seconds: record._sessionSeconds,
      _prev_day_seconds: record._prevDaySeconds,
    };

    const res = await axios.put(
      `${API_BASE}/attendence/records/${record.id}`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );

    // Update local cache list too
    const existing = JSON.parse(localStorage.getItem("records") || "[]");
    const merged = existing.map((r) => (r.id === record.id ? res.data : r));
    localStorage.setItem("records", JSON.stringify(merged));

    dispatch({ type: types.UPDATE_RECORD, payload: res.data });
    return res.data;
  } catch (error) {
    // Fallback: update store only
    dispatch({ type: types.UPDATE_RECORD, payload: record });
    return record;
  }
};

export const fetchRecord = (userId) => async (dispatch) => {
  dispatch({ type: types.GET_RECORD_REQUEST });
  try {
    if (!userId) {
      const data = JSON.parse(localStorage.getItem("records") || "[]");
      dispatch({ type: types.GET_RECORD_SUCCESS, payload: data });
      return;
    }

    const res = await axios.get(`${API_BASE}/attendence/records/${userId}`, {
      headers: { "Content-Type": "application/json" },
    });
    localStorage.setItem("records", JSON.stringify(res.data));
    dispatch({ type: types.GET_RECORD_SUCCESS, payload: res.data });
  } catch (error) {
    try {
      const data = JSON.parse(localStorage.getItem("records") || "[]");
      dispatch({ type: types.GET_RECORD_SUCCESS, payload: data });
    } catch {
      dispatch({ type: types.GET_RECORD_FAILURE, payload: error.message });
    }
  }
};
