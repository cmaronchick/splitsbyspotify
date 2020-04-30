import { red } from '@material-ui/core/colors'

export default {
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      // main: 'green'
      main: '#50d890',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main

    },
    secondary: {
      light: '#effffb',
      main: '#4f98ca',
      dark: '#4f98ca',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#272727',
    },
    alert: {
      main: red,
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
    background: {
      default: '#fff'
    }
  },
  spreadThis: {
    typography: {
      useNextVariants: true
    },
    form: {
      textAlign: 'center'
    },
    image: {
      margin: '20px auto 20px auto'
    },
    pageTitle: {
      margin: '10px auto 10px auto',
      textAlign: 'center'
    },
    textField: {
      margin: '10px auto 10px auto'
    },
    introText: {
      textAlign: 'center',
    },
    button: {
      marginTop: 20,
      position: 'relative'
    },
    customError: {
      color: 'red',
      fontSize: '0.8rem',
      marginTop: 10
    },
    progress: {
      position: 'absolute',
      color: '#fff'
    },
    spotifyLoginButton: {
      height: 40,
      marginBottom: 10
    },
    invisibleSeparator: {
      border: 'none',
      margin: 4
    },
    visibleSeparator: {
      width: '100%',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      marginBottom: 20
    },
    paper: {
      padding: 20
    },
    profile: {
      '& .image-wrapper': {
        textAlign: 'center',
        position: 'relative',
        '& button': {
          position: 'absolute',
          top: '80%',
          left: '70%'
        }
      },
      '& .profile-image': {
        width: 200,
        height: 200,
        objectFit: 'cover',
        maxWidth: '100%',
        borderRadius: '50%'
      },
      '& .profile-details': {
        textAlign: 'center',
        '& span, svg': {
          verticalAlign: 'middle'
        },
        '& a': {
          color: '#00bcd4'
        }
      },
      '& hr': {
        border: 'none',
        margin: '0 0 10px 0'
      },
      '& svg.button': {
        '&:hover': {
          cursor: 'pointer'
        }
      }
    },
    buttons: {
      textAlign: 'center',
      '& a': {
        margin: '20px 10px'
      }
    },
    followButton: {
      color: '#fff'
    },
    selectDistanceForm: {
      display: 'flex',
      flexDirection: 'column'
    },
    split: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '0 5px',
      borderRightWidth: 0
    },
    card: {
      display: 'flex',
      paddingHorizontal: 5,
      marginBottom: 20,
      flexDirection: 'column'
    },
    playlistLoading: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: 20
    },
    playlistHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    playlistImage: {
        minWidth: 100,
        minHeight: 100,
        objectFit: 'cover',
        position: 'relative',
        left: 0,
        flex: 1
    },
    spotifyIcon: {
      width: 30,
      height: 30,
      marginRight: 5
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        position: 'relative'
    },
    details: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      width: '100%'
    },
    actions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 25
    },
    skeletonCard: {
      display: 'flex',
      marginBottom: 20
    },
    skeletonCardContent: {
        width: '100%',
        flexDirection: 'column',
        padding: 25
    },
    skeletonCover: {
        minWidth: 200,
        objectFit: 'cover'
    },
    skeletonSpotifyUser: {
        width: 60,
        height: 20,
        backgroundColor: '#50d890',
        marginBottom: 10
    },
    skeletonDate: {
        height: 14,
        width: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        marginBottom: 10
    },
    skeletonFullLine: {
        height: 15,
        width: '90%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        marginBottom: 10
    },
    skeletonHalfLine: {
        height: 15,
        width: '45%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    }
  }
}