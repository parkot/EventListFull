// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  i18nKey: 'menu.utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      i18nKey: 'menu.typography',
      type: 'item',
      url: '/typography',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'util-color',
      title: 'Color',
      i18nKey: 'menu.color',
      type: 'item',
      url: '/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      i18nKey: 'menu.shadow',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    }
  ]
};

export default utilities;
