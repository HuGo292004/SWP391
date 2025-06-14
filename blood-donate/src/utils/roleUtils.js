// Utility functions for role-based routing

export const getUserRoleFromPath = (pathname) => {
  const pathSegments = pathname.split('/');
  const role = pathSegments[1];
  
  if (['admin', 'staff', 'member'].includes(role)) {
    return role;
  }
  
  return null;
};

export const getBasePath = (role) => {
  if (!role || !['admin', 'staff', 'member'].includes(role)) {
    return '';
  }
  return `/${role}`;
};

export const createRoleBasedPath = (path, role) => {
  if (!role || !['admin', 'staff', 'member'].includes(role)) {
    return path;
  }
  
  // If path is already role-based, return as is
  if (path.startsWith(`/${role}`)) {
    return path;
  }
  
  // If path is root, return role base path
  if (path === '/') {
    return `/${role}`;
  }
  
  // Add role prefix to path
  return `/${role}${path}`;
};
