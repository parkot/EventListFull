// third-party
import { presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { extendPaletteWithChannels } from 'utils/colorUtils';

const greyAscent = ['#f4f2ea', '#9b9785', '#6e6b5f', '#252420'];

// ==============================|| GREY COLORS BUILDER ||============================== //

function buildGrey() {
  let greyPrimary = [
    '#f7f6f2',
    '#f1efe7',
    '#e6e4dd',
    '#dad5bc',
    '#c8c3ac',
    '#a9a48f',
    '#636157',
    '#4f4d45',
    '#3a3934',
    '#252420',
    '#000000'
  ];
  let greyConstant = ['#efeadf', '#e6e4dd'];

  return [...greyPrimary, ...greyAscent, ...greyConstant];
}

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(presetColor) {
  const lightColors = { ...presetPalettes, grey: buildGrey() };
  const lightPaletteColor = ThemeOption(lightColors, presetColor);

  const commonColor = { common: { black: '#000', white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(lightPaletteColor);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  return {
    light: {
      mode: 'light',
      ...extendedCommon,
      ...extendedLight,
      text: {
        primary: '#000000',
        secondary: '#636157',
        disabled: extendedLight.grey[400]
      },
      action: { disabled: extendedLight.grey[300] },
      divider: '#dad5bc',
      background: {
        paper: '#f7f6f2',
        default: '#e6e4dd'
      }
    }
  };
}
