// assets
import { UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  UserOutlined
};

// ==============================|| MENU ITEMS - ADMINISTRATORS ||============================== //

const administrators = {
  id: 'administrators',
  title: 'Administrators',
  i18nKey: 'menu.administrators',
  type: 'group',
  roles: ['Administrator'],
  children: [
    {
      id: 'admin-users',
      title: 'Users',
      i18nKey: 'menu.users',
      type: 'item',
      url: '/admin/users',
      icon: icons.UserOutlined,
      roles: ['Administrator'],
      breadcrumbs: false
    }
  ]
};

export default administrators;
