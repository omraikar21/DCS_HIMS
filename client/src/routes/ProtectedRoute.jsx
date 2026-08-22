import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";


function ProtectedRoute() {

  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();


  /*
   * ---------------------------------------
   * WAIT FOR AUTHENTICATION STATE
   * ---------------------------------------
   */

  if (loading) {

    return (
      <div className="route-loading">

        <div className="route-loading-spinner" />

        <p>
          Checking authentication...
        </p>

      </div>
    );

  }


  /*
   * ---------------------------------------
   * USER NOT LOGGED IN
   * ---------------------------------------
   */

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );

  }


  /*
   * ---------------------------------------
   * USER IS AUTHENTICATED
   * ---------------------------------------
   */

  return <Outlet />;
}


export default ProtectedRoute;