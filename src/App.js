import React, { Component } from 'react';
import './App.css';
import { ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#effffb',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#50d890',
      main: '#effffb',
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
})

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <header className="App-header">
            Splits by Spotify
          </header>
            <Router>
              <div className="nav-container">
                <Navbar color="primary.main" />
              </div>
              <div className="container">
                <Switch>
                  <Route path='/signup' component={Signup} />
                  <Route path='/login' component={Login} />
                  <Route path={['/profile','/profile/:spotifyUser']} component={Profile} />
                  <Route path='/' component={Home} />
                </Switch>
              </div>
            </Router>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
