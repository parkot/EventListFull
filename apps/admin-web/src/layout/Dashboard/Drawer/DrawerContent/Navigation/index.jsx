// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useMemo } from 'react';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { getAuthSession } from 'utils/auth';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const currentRole = getAuthSession()?.user?.role;

  const navItems = useMemo(() => {
    return menuItem.items
      .map((group) => {
        if (group.roles && (!currentRole || !group.roles.includes(currentRole))) {
          return null;
        }

        const children = (group.children || []).filter((child) => {
          if (!child.roles) {
            return true;
          }

          return Boolean(currentRole && child.roles.includes(currentRole));
        });

        if (children.length === 0) {
          return null;
        }

        return {
          ...group,
          children
        };
      })
      .filter(Boolean);
  }, [currentRole]);

  const navGroups = navItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
