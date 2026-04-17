import * as types from "./actionTypes";

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
  return { type: types.STOP_LOADING };
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
export const addRecord = (data) => (dispatch) => {
  const existing = JSON.parse(localStorage.getItem("records") || "[]");
  const updated = [data, ...existing];
  localStorage.setItem("records", JSON.stringify(updated));
  dispatch({ type: types.ADD_RECORD, payload: data });
};

export const updateRecord = (data) => (dispatch) => {
  localStorage.setItem("records", JSON.stringify(data));
  dispatch({ type: types.UPDATE_RECORD, payload: data });
};

export const fetchRecord = () => async (dispatch) => {
  dispatch({ type: types.GET_RECORD_REQUEST });
  try {
    const data = JSON.parse(localStorage.getItem("records") || "[]");
    dispatch({ type: types.GET_RECORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.GET_RECORD_FAILURE, payload: error.message });
  }
};
