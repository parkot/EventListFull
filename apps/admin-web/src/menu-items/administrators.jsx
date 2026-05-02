// assets
import { MailOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  MailOutlined,
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
    },
    {
      id: 'admin-email-templates',
      title: 'Email Templates',
      i18nKey: 'menu.emailTemplates',
      type: 'item',
      url: '/admin/email-templates',
      icon: icons.MailOutlined,
      roles: ['Administrator'],
      breadcrumbs: false
    }
  ]
};

export default administrators;
