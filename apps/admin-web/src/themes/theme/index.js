// ==============================|| PRESET THEME - DEFAULT ||============================== //

export default function Default(colors) {
  const { red, gold, cyan, green, grey } = colors;
  const greyColors = {
    0: grey[0],
    50: grey[1],
    100: grey[2],
    200: grey[3],
    300: grey[4],
    400: grey[5],
    500: grey[6],
    600: grey[7],
    700: grey[8],
    800: grey[9],
    900: grey[10],
    A50: grey[15],
    A100: grey[11],
    A200: grey[12],
    A400: grey[13],
    A700: grey[14],
    A800: grey[16]
  };
  const contrastText = '#fff';

  return {
    primary: {
      lighter: '#f2e8c6',
      100: '#eadcb0',
      200: '#e2d19a',
      light: '#d9c684',
      400: '#d1ba6e',
      main: '#c9a84c',
      dark: '#b59443',
      700: '#a3863c',
      darker: '#8d7334',
      900: '#76602b',
      contrastText: '#000000'
    },
    secondary: {
      lighter: '#efeadf',
      100: '#efeadf',
      200: '#e6e4dd',
      light: '#dad5bc',
      400: '#c8c3ac',
      main: '#dad5bc',
      600: '#a9a48f',
      dark: '#636157',
      800: '#4f4d45',
      darker: '#000000',
      A100: '#f7f6f2',
      A200: '#9b9785',
      A300: '#6e6b5f',
      contrastText: '#000000'
    },
    error: {
      lighter: red[0],
      light: red[2],
      main: red[4],
      dark: red[7],
      darker: red[9],
      contrastText
    },
    warning: {
      lighter: gold[0],
      light: gold[3],
      main: gold[5],
      dark: gold[7],
      darker: gold[9],
      contrastText: greyColors[100]
    },
    info: {
      lighter: cyan[0],
      light: cyan[3],
      main: cyan[5],
      dark: cyan[7],
      darker: cyan[9],
      contrastText
    },
    success: {
      lighter: green[0],
      light: green[3],
      main: green[5],
      dark: green[7],
      darker: green[9],
      contrastText
    },
    grey: greyColors
  };
}
