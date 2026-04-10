// assets
import { CalendarOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';

// icons
const icons = {
  CalendarOutlined,
  DashboardOutlined,
  TeamOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  i18nKey: 'menu.navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      i18nKey: 'menu.dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'events',
      title: 'Events',
      i18nKey: 'menu.events',
      type: 'item',
      url: '/events',
      icon: icons.CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'people',
      title: 'People',
      i18nKey: 'menu.people',
      type: 'item',
      url: '/people',
      icon: icons.TeamOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
