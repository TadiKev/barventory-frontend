import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Wrap any route you want to protect.
 * 
 * props:
 *   - children: the element to render if allowed
 *   - roles   : optional array of allowed roles (e.g. ['admin'])
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useContext(AuthContext);

  // 1) not logged in → auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 2) has no role restriction → OK
  if (roles.length === 0) {
    return children;
  }

  // 3) role restricted → check membership
  if (roles.includes(user.role)) {
    return children;
  }

  // 4) otherwise → you could redirect to “not authorized” or dashboard
  return <Navigate to="/dashboard" replace />;
}
