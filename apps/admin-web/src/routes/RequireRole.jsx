import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { getAuthSession } from 'utils/auth';

export default function RequireRole({ roles, children, fallbackPath = '/dashboard/default' }) {
  const role = getAuthSession()?.user?.role;

  if (!role || !roles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

RequireRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
  fallbackPath: PropTypes.string
};
