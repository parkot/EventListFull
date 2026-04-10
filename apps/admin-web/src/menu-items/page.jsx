// assets
import { LoginOutlined, ProfileOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'authentication',
  title: 'Authentication',
  i18nKey: 'menu.authentication',
  type: 'group',
  children: [
    {
      id: 'login1',
      title: 'Login',
      i18nKey: 'menu.login',
      type: 'item',
      url: '/login',
      icon: icons.LoginOutlined,
      target: true
    },
    {
      id: 'register1',
      title: 'Register',
      i18nKey: 'menu.register',
      type: 'item',
      url: '/register',
      icon: icons.ProfileOutlined,
      target: true
    }
  ]
};

export default pages;
