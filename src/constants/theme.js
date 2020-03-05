export default {
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#50d890',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#effffb',
      main: '#50d890',
      dark: '#4f98ca',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#272727',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
}