// assets
import { CalendarOutlined, DashboardOutlined } from '@ant-design/icons';

// icons
const icons = {
  CalendarOutlined,
  DashboardOutlined
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
    }
  ]
};

export default dashboard;
