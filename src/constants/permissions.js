export const PERMISSIONS = {
  MANAGE_OPERATORS: 'manage_operators',
  MANAGE_AGENTS: 'manage_agents',
  ISSUE_FLOAT: 'issue_float',
  RETURN_FLOAT: 'return_float',
  VIEW_REPORTS: 'view_reports',
  MANAGE_LIQUIDITY: 'manage_liquidity',
  CLOSE_DAY: 'close_day',
  ADMIN_UNLOCK: 'admin_unlock',
};

export const ROLE_PERMISSIONS = {
  master: [
    PERMISSIONS.MANAGE_OPERATORS,
    PERMISSIONS.MANAGE_AGENTS,
    PERMISSIONS.ISSUE_FLOAT,
    PERMISSIONS.RETURN_FLOAT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_LIQUIDITY,
    PERMISSIONS.CLOSE_DAY,
    PERMISSIONS.ADMIN_UNLOCK,
  ],
  operator: [
    PERMISSIONS.MANAGE_AGENTS,
    PERMISSIONS.ISSUE_FLOAT,
    PERMISSIONS.RETURN_FLOAT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_LIQUIDITY,
  ],
};

export const hasPermission = (user, permission) => {
  const role = user?.role || 'master'; // Default to master for legacy users
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
