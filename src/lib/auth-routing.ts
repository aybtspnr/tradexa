export const getDefaultRouteByRole = (role?: string | null): string => {
  switch (role) {
    case 'admin':
      return '/admin/ncm';
    default:
      return '/ai-search';
  }
};