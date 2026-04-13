import * as types from "./actionTypes";

export const initState = {
  // Auth
  isAuthenticated: false,
  user: null,
  loading: true,
  attendanceData: [],
};

const reducer = (state = initState, action) => {
  switch (action.type) {
    // Auth Cases
    case types.SET_AUTH:
      return {
        ...state,
        isAuthenticated: action.payload,
      };

    case types.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case types.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    case types.STOP_LOADING:
      return { ...state, loading: false };

    case types.GET_ATTENDANCE_REQUEST:
      return { ...state, loading: true };
    case types.GET_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        attendanceData: action.payload,
        error: null,
      };
    case types.GET_ATTENDANCE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default reducer;
