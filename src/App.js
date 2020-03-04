import React, { Component } from 'react';
import './App.css';
import { ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import ky from 'ky'

import { login, logout, refreshAccessToken, getUserPlaylists } from './functions/spotify'
import { getUrlParameters } from './functions/utils'
import { spotifyConfig } from './constants/spotifyConfig'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SpotifyLogin from './components/SpotifyLogin'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'


const theme = createMuiTheme({
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
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      spotifyUser: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
    }
  }

  handleSpotifyLogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyConfig.client_id}&scope=${spotifyConfig.scope}&redirect_uri=http://localhost:3000/spotifyCallback&state=${spotifyConfig.state}`
  }
  handleSpotifyLogout = () => {
    let logoutResponse = logout();
    if (logoutResponse) {
      this.setState({
        spotifyUser: null,
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        playlists: null
      })
      window.history.pushState({ 'page_id': 1, 'user': 'null'}, '', '/')
    }

  }

  handleSpotifyRefreshToken = async (refresh_token) => {
    let spotifyData = await refreshAccessToken(refresh_token)
    console.log('spotifyRefreshData', spotifyData)
    this.setState({
      ...spotifyData
    })

  }
  handleSpotifyCallback = async (location, access_token) => {
    let spotifyData = await login(location);
    console.log('spotifyData', spotifyData)
    this.setState({...spotifyData})
    document.cookie = `spotifyAccessToken=${spotifyData.spotifyAccessToken};max-age=3600`
    document.cookie = `spotifyRefreshToken=${spotifyData.spotifyRefreshToken};max-age=3600`
    window.history.pushState({ 'page_id': 1, 'user': 'spotifyUser'}, '', '/')
  }
  handleGetUserPlaylists = async (access_token) => {
    let playlists = await getUserPlaylists(access_token)
    console.log('playlists', playlists)
    this.setState({ playlists: playlists.playlists })
  }

  componentDidMount() {
    let refreshToken = document.cookie.split(';').filter((item) => item.trim().startsWith('spotifyRefreshToken='))
    console.log('refreshToken', refreshToken)
    if (refreshToken && refreshToken.length > 0) {
        console.log('The cookie "reader" exists (ES6)')
        let refresh_token = refreshToken[0].split('=')[1]
        if (refresh_token !== 'null') {
          this.handleSpotifyRefreshToken(refresh_token)
        }
    }
    if (window.location.pathname === '/spotifyCallback') {
      console.log('starting spotify login')
      this.handleSpotifyCallback(window.location)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.spotifyAccessToken !== this.state.spotifyAccessToken && this.state.spotifyAccessToken) {
      this.handleGetUserPlaylists(this.state.spotifyAccessToken)
    }
  }

  

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
                <SpotifyLogin user={this.state.user} spotifyUser={this.state.spotifyUser} handleSpotifyLogin={this.handleSpotifyLogin} handleSpotifyLogout={this.handleSpotifyLogout} />
                <Switch>
                  <Route path='/signup' component={Signup} />
                  <Route path='/login' component={Login} />
                  <Route path={['/profile','/profile/:spotifyUser']} component={Profile} />
                  <Route path='/' render={({match}) => {
                    return (
                      <Home spotifyUser={this.state.spotifyUser} playlists={this.state.playlists} />
                    )
                  }} />
                </Switch>
              </div>
            </Router>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
