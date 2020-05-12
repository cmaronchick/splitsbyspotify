import React, { Component } from 'react';
import jwtDecode from 'jwt-decode'
import firebase from './constants/firebase'

import {Provider} from 'react-redux'
import store from './redux/store'

import { login, logout, refreshTokens, updateTokens } from './redux/actions/userActions'
import { getAllPlaylists,
  getMyPlaylist, } from './redux/actions/spotifyActions'
import { SET_AUTHENTICATED,
  LOADING_USER,
  LOADING_PLAYLISTS_MY,
  LOADING_PLAYLISTS_MY_FROM_SPOTIFY } from './redux/types'

import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import { getUrlParameters } from './functions/utils'
import themeFile from './constants/theme'

import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Playlist from './pages/Playlist'
import Playlists from './pages/Playlists'
import Cookies from './pages/Cookies'
import SpotifyLogin from './components/layout/SpotifyLogin'
import AuthRoute from './components/util/AuthRoute'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import MyButton from './util/MyButton';
import EmailIcon from '@material-ui/icons/Email'
import { Typography } from '@material-ui/core';

const theme = createMuiTheme(themeFile)
const FBIDToken = localStorage.FBIDToken
const spotifyAccessToken = localStorage.spotifyAccessToken
const spotifyRefreshToken = localStorage.spotifyRefreshToken
const tourCompleted = localStorage.tourCompleted
if (FBIDToken && spotifyAccessToken && spotifyRefreshToken && spotifyRefreshToken !== 'undefined') {
  if (tourCompleted !== 'true') localStorage.tourCompleted = 'true'
  const decodedToken = jwtDecode(FBIDToken);
  if (decodedToken.exp * 1000 > Date.now()) {
    //window.location.href = '/login'
    store.dispatch({ type: SET_AUTHENTICATED })
    console.log('spotifyRefreshToken', spotifyRefreshToken)
    store.dispatch(refreshTokens(spotifyRefreshToken));
  } else {
    console.log('old token', decodedToken.exp * 1000 > Date.now())
    if (spotifyRefreshToken) {
      //const decodedRefreshToken = jwtDecode(spotifyRefreshToken);
      store.dispatch(updateTokens(spotifyRefreshToken))
      //if (decodedRefreshToken.exp * 1000 > Date.now()) {

    } else {
      store.dispatch(logout())
    }
  }
} else {
  if (tourCompleted !== 'true') {

  }
}
var stateKey = 'spotify_auth_state';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      spotifyUser: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      FBIDToken: FBIDToken,
      confirmDeletePlaylistId: null,
      confirmDeletePlaylistName: null,
      showConfirmDeleteDialog: false,
      currentPlaylistId: null,
      currentPlaylistLoading: false,
      currentPlaylist: null,
      selectedDistance: null,
      targetPace: null,
      splits: []
    }
  }

  handleSpotifyRefreshToken = (refresh_token) => {
    store.dispatch(refreshTokens(refresh_token))
  }
  handleSpotifyCallback = async (location, access_token) => {
    firebase.analytics().logEvent('login', { step: 2, name: 'spotifyCallback' })
    store.dispatch({
      type: LOADING_USER
    })
    store.dispatch({
      type: LOADING_PLAYLISTS_MY
    })
    store.dispatch({
      type: LOADING_PLAYLISTS_MY_FROM_SPOTIFY
    })
    let state = getUrlParameters(location.href, 'state')
    let storedState = localStorage[stateKey];
    if (state === null || storedState !== state) {
      return { error: 'state_mismatch'}
    }
    store.dispatch(login(location, this.props.history));
  }


  componentDidMount() {
    let refreshToken = localStorage.spotifyRefreshToken
    let FBIDToken = localStorage.FBIDToken

  // User auth state based on cookies is determined starting on line 43
  // When the app mounts, it checks for the auth state and the presence of a refresh
  // if the user is NOT authenticated AND there is a refresh token, the user tokens are refreshed and the user is authenticated
    if (!store.getState().user.authenticated && refreshToken && refreshToken !== "null" && refreshToken !== "undefined") {
      this.handleSpotifyRefreshToken(refreshToken)
    }

    // when the user clicks login, they are sent to Spotify with a callback URL
    // If the pathname contains a spotifyCallback, the app takes the callback query string and processes it (see userActions.js)
    if (window.location.pathname === '/spotifyCallback') {
      console.log('starting spotify login', window.location)
      this.handleSpotifyCallback(window.location)
    }

    // if a user navigates directly to a playlist, the app retrieves the playlist information right away
    if (window.location.pathname.indexOf('/Playlist') > -1 && window.location.pathname.split('/').length > 2) {
      let firebasePlaylistId = window.location.pathname.split('/')[2]
      store.dispatch(getMyPlaylist(firebasePlaylistId))
    }
    store.dispatch(getAllPlaylists())
  }


  

  render() {
    //console.log('theme', theme)
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <header className="App-header">
            Splits by Spotify
          </header>
            <Router>
              <div className="nav-container">
                <Navbar handleSpotifyLogin={this.handleSpotifyLogin} color="primary.main" />
              </div>
              <div className="container">
                <SpotifyLogin handleSpotifyLogin={this.handleSpotifyLogin} handleSpotifyLogout={this.handleSpotifyLogout} />
                <Switch>
                  <AuthRoute path='/signup' component={Signup}/>
                  <AuthRoute path='/login' component={Login}/>
                  <Route path={['/profile','/user/:spotifyUser']} render={({match}) => 
                    <Profile selectedUser={match.params.spotifyUser} handleSpotifyLogin={this.handleSpotifyLogin} />
                  } />
                  <Route path={['/playlist/:firebasePlaylistId', '/playlist']} render={({match}) => (
                    <Playlist firebasePlaylistId={match.params.firebasePlaylistId}/>
                    )} />
                  <Route path='/Playlists' component={Playlists} />
                  <Route path="/Cookies" component={Cookies} />
                  <Route path='/' render={({match}) => {
                    return (
                      <Home 
                        handleSpotifyLogin={this.handleSpotifyLogin}
                        />
                    )
                  }} />
                </Switch>
              </div>
            </Router>
          </Provider>
          <div className="footer">
            <Typography variant="body1">Built by Chris Aronchick</Typography>
            <MyButton btnClassName="footerButton" tip="Got feedback? Send me an e-mail!">
              <a href="mailto:chrisaronchick@gmail.com">
                <EmailIcon/>
              </a>
            </MyButton>
          </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
