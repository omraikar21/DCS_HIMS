import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";


function RoleRoute({
  allowedRoles = [],
}) {

  const {
    role,
    loading,
    isAuthenticated,
  } = useAuth();


  /*
   * ---------------------------------------
   * WAIT FOR AUTH STATE
   * ---------------------------------------
   */

  if (loading) {

    return (
      <div className="route-loading">

        <div className="route-loading-spinner" />

        <p>
          Loading...
        </p>

      </div>
    );

  }


  /*
   * ---------------------------------------
   * NOT AUTHENTICATED
   * ---------------------------------------
   */

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /*
   * ---------------------------------------
   * ROLE CHECK
   * ---------------------------------------
   */

  const normalizedRole =
    role?.toUpperCase();


  const hasPermission =
    allowedRoles
      .map(
        (item) =>
          item.toUpperCase()
      )
      .includes(
        normalizedRole
      );


  /*
   * ---------------------------------------
   * USER DOES NOT HAVE ACCESS
   * ---------------------------------------
   */

  if (!hasPermission) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );

  }


  /*
   * ---------------------------------------
   * USER HAS ACCESS
   * ---------------------------------------
   */

  return <Outlet />;
}


export default RoleRoute;