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

  const normalizedRole = (role || "").toUpperCase().replace(/[\s-]+/g, "_");
  const normalizedAllowed = allowedRoles.map((item) =>
    item.toUpperCase().replace(/[\s-]+/g, "_")
  );

  const hasPermission =
    normalizedRole === "SUPER_ADMIN" ||
    normalizedRole === "ADMIN" ||
    normalizedAllowed.includes(normalizedRole);

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