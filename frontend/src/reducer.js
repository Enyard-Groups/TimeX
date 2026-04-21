import * as types from "./actionTypes";

export const initState = {
  // Auth
  isAuthenticated: false,
  user: null,
  isReady: false,
  loading: false,
  attendanceData: [],
  record: [],
  error: null,
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

    case types.APP_READY:
      return { ...state, isReady: true };

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

    case types.GET_RECORD_REQUEST:
      return { ...state, loading: true };
    case types.GET_RECORD_SUCCESS:
      return {
        ...state,
        loading: false,
        record: action.payload,
        error: null,
      };
    case types.GET_RECORD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.ADD_RECORD:
      return {
        ...state,
        record: [action.payload, ...state.record],
      };
    case types.UPDATE_RECORD:
      return {
        ...state,
        record: Array.isArray(action.payload)
          ? action.payload
          : state.record.map((r) =>
              r.id === action.payload.id ? { ...r, ...action.payload } : r,
            ),
      };

    default:
      return state;
  }
};

export default reducer;
