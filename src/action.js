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
