// ==============================|| OVERRIDES - LINK ||============================== //

export default function Link(theme) {
  return {
    MuiLink: {
      defaultProps: {
        underline: 'hover'
      },
      styleOverrides: {
        root: {
          color: theme.vars.palette.primary.main,
          textDecorationColor: theme.vars.palette.primary.main
        }
      }
    }
  };
}
