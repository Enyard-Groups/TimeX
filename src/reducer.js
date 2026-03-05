import * as types from "./actionTypes";

export const initState = {
  // Auth
  isAuthenticated: false,
  user: null,
  loading:true,
  
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

    default:
      return state;
  }
};

export default reducer;
