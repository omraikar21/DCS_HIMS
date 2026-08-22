// ==========================================
// AUTH CONTEXT
// PostgreSQL + JWT Authentication
// A10
// ==========================================

import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  getStoredUser,
  getToken,
  loginUser,
  logoutUser,
} from "../services/authService";


export const AuthContext =
  createContext(null);


// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);


  const [token, setToken] =
    useState(null);


  const [loading, setLoading] =
    useState(true);


  // ========================================
  // RESTORE SESSION
  // ========================================

  useEffect(() => {

    const restoreSession = () => {

      try {

        const storedToken =
          getToken();

        const storedUser =
          getStoredUser();


        if (
          storedToken &&
          storedUser
        ) {

          setToken(
            storedToken
          );

          setUser(
            storedUser
          );

        } else {

          /*
           * If only an old/invalid value exists,
           * clean it.
           */

          logoutUser();

          setToken(null);

          setUser(null);

        }

      } catch (error) {

        console.error(
          "Failed to restore authentication:",
          error
        );

        logoutUser();

        setToken(null);

        setUser(null);

      } finally {

        setLoading(false);

      }

    };


    restoreSession();

  }, []);


  // ========================================
  // LOGIN
  // ========================================

  const login = async (
    email,
    password
  ) => {

    setLoading(true);


    try {

      const response =
        await loginUser(
          email,
          password
        );


      /*
       * authService already stores
       * token and user in localStorage.
       */

      setToken(
        response.token
      );


      setUser(
        response.user || null
      );


      return response;

    } catch (error) {

      /*
       * Make sure failed login does not
       * leave an old session active.
       */

      setToken(null);

      setUser(null);

      throw error;

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {

    logoutUser();

    setUser(null);

    setToken(null);

  };


  // ========================================
  // AUTHENTICATION STATUS
  // ========================================

  const isAuthenticated =
    Boolean(
      user &&
      token
    );


  // ========================================
  // USER ROLE
  // ========================================

  const role =
    user?.role ||
    user?.user_role ||
    null;


  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = {

    user,

    token,

    role,

    loading,

    isAuthenticated,

    login,

    logout,

  };


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}