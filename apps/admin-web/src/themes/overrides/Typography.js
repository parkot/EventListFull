// ==============================|| OVERRIDES - TYPOGRAPHY ||============================== //

export default function Typography(theme) {
  return {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: theme.vars.palette.text.secondary
        },
        h1: {
          color: theme.vars.palette.text.primary
        },
        h2: {
          color: theme.vars.palette.text.primary
        },
        h3: {
          color: theme.vars.palette.text.primary
        },
        h4: {
          color: theme.vars.palette.text.primary
        },
        h5: {
          color: theme.vars.palette.text.primary
        },
        h6: {
          color: theme.vars.palette.text.primary
        },
        body1: {
          color: theme.vars.palette.text.secondary
        },
        body2: {
          color: theme.vars.palette.text.secondary
        },
        subtitle1: {
          color: theme.vars.palette.text.secondary
        },
        subtitle2: {
          color: theme.vars.palette.text.secondary
        },
        caption: {
          color: theme.vars.palette.text.secondary
        },
        gutterBottom: {
          marginBottom: 12
        }
      }
    }
  };
}
