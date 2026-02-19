export const PERMISSIONS = {
  MANAGE_OPERATORS: 'manage_operators',
  MANAGE_AGENTS: 'manage_agents',
  ISSUE_FLOAT: 'issue_float',
  RETURN_FLOAT: 'return_float',
  VIEW_REPORTS: 'view_reports',
  VIEW_LIQUIDITY: 'view_liquidity',
  MANAGE_LIQUIDITY: 'manage_liquidity',
  CLOSE_DAY: 'close_day',
  ADMIN_UNLOCK: 'admin_unlock',
  DELETE_TRANSACTION: 'delete_transaction',
  RESET_SYSTEM: 'reset_system',
  MANAGE_MANUAL: 'manage_manual',
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ISSUED_TODAY: 'view_issued_today',
  VIEW_REPAID_TODAY: 'view_repaid_today',
  VIEW_TEAM_DEBT: 'view_team_debt',
  VIEW_TOTAL_LIQUIDITY: 'view_total_liquidity',
};

export const ROLE_PERMISSIONS = {
  master: Object.values(PERMISSIONS),
  operator: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LIQUIDITY,
  ],
};

export const hasPermission = (user, permission) => {
  // If user has specific permissions assigned (Master override), use those
  if (user?.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  
  // Otherwise, fall back to role-based permissions
  const role = user?.role || 'master';
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
