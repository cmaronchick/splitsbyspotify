import React, { Component } from 'react';
import PropTypes from 'prop-types'
import jwtDecode from 'jwt-decode'
import firebase from './constants/firebase'
import ky from 'ky/umd'

import {Provider} from 'react-redux'
import store from './redux/store'

import { login, logout, refreshTokens, updateTokens } from './redux/actions/userActions'
import { getAllPlaylists,
  getMyPlaylists,
  getMyPlaylist, } from './redux/actions/spotifyActions'
import { SET_AUTHENTICATED,
  LOADING_USER,
  LOADING_PLAYLIST,
  LOADING_PLAYLISTS_MY,
  LOADING_PLAYLISTS_MY_FROM_SPOTIFY } from './redux/types'

import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import { getUrlParameters, generateRandomString } from './functions/utils'
import { spotifyConfig } from './constants/spotifyConfig'
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
ky.create({ 
    prefixUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : 'https://us-central1-splitsbyspotify.cloudfunctions.net/api'
})

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

  handleSpotifyLogin = () => {

    firebase.analytics().logEvent('login', {step: 1, name: 'Login'})
    let state = generateRandomString(16)
    localStorage[stateKey] = state
    let currentOrigin = window.location.origin
    localStorage.loggedInPage = window.location.pathname
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyConfig.client_id}&scope=${spotifyConfig.scope}&redirect_uri=${currentOrigin}/spotifyCallback&state=${state}`
  }
  handleSpotifyLogout = () => {
    let logoutResponse = store.dispatch(logout());
    firebase.analytics().logEvent('logout')
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
  handleGetAllPlaylists = async (access_token) => {
    store.dispatch(getAllPlaylists())
  }
  handleGetMyPlaylists = async () => {
    let FBIDToken
    try {
      FBIDToken = await firebase.auth().currentUser.getIdToken()
      store.dispatch(getMyPlaylists(FBIDToken))
      console.log('FBIDToken', FBIDToken)
    } catch(getTokenError) {
      console.log('getTokenError120', getTokenError)
    }
  }

  handleGetMyPlaylist = async (firebasePlaylistId) => {
    console.log('handleGetMyPlaylist firebasePlaylistId', firebasePlaylistId)
    try {
      let FBIDToken = await firebase.auth().currentUser.getIdToken()
      store.dispatch(getMyPlaylist(firebasePlaylistId))
    } catch (getMyPlaylistError) {
      console.log('getMyPlaylistError', getMyPlaylistError)
    }
  }

  checkSpotifyPlaylistInMyPlaylists = () => {
    
    const { myPlaylists } = this.state
    let allPlaylists = {...this.state.allPlaylists}
    if (myPlaylists && Object.keys(myPlaylists).length > 0 && allPlaylists && Object.keys(allPlaylists).length > 0) {
      Object.keys(myPlaylists).forEach(firebasePlaylistId => {
        if (allPlaylists[myPlaylists[firebasePlaylistId].id]) {
          allPlaylists[myPlaylists[firebasePlaylistId].id].inMyPlaylists = true
        }
      })
      this.setState({
        allPlaylists
      })
    }
  }

  handleTextInput = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  componentDidMount() {
    let refreshToken = localStorage.spotifyRefreshToken
    let FBIDToken = localStorage.FBIDToken
    if (!store.getState().user.authenticated && refreshToken && refreshToken !== "null" && refreshToken !== "undefined") {
      this.handleSpotifyRefreshToken(refreshToken)
    }
    if (window.location.pathname === '/spotifyCallback') {
      console.log('starting spotify login', window.location)
      this.handleSpotifyCallback(window.location)
    }
    if (window.location.pathname.indexOf('/Playlist') > -1 && window.location.pathname.split('/').length > 2) {
      let firebasePlaylistId = window.location.pathname.split('/')[2]
      this.handleGetMyPlaylist(firebasePlaylistId)
    }
    store.dispatch(getAllPlaylists())
    window.addEventListener('storage', (e) => {
      console.log('e', e)
    })
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
                    <Profile handleSpotifyLogin={this.handleSpotifyLogin} />
                  } />
                  <Route path={['/playlist/:firebasePlaylistId', '/playlist']} render={({match}) => {
                    console.log('match.params.firebasePlaylistId', match.params.firebasePlaylistId)
                    return <Playlist firebasePlaylistId={match.params.firebasePlaylistId}
                    // selectedDistance={this.state.selectedDistance}
                    // targetPace={this.state.targetPace}
                    // splits={this.state.splits}
                    // handleGetPlaylistTracks={this.handleGetPlaylistTracks}
                    // handleSelectDistance={this.handleSelectDistance}
                    // handleTextInput={this.handleTextInput}
                    // handleCalculateButtonClick={this.handleCalculateButtonClick}
                    // checkForPlaylist={this.checkForPlaylist}
                    // playlistObj={this.state.currentPlaylist}
                    // playlistLoading={this.state.currentPlaylistLoading}
                    />
                    }
                  } />
                  <Route path='/Playlists' component={Playlists} />
                  <Route path="/Cookies" component={Cookies} />
                  <Route path='/' render={({match}) => {
                    return (
                      <Home 
                        // spotifyUser={this.state.spotifyUser} 
                        // allPlaylists={this.state.allPlaylists} 
                        // myPlaylists={this.state.myPlaylists}
                        handleSpotifyLogin={this.handleSpotifyLogin}
                        // handleGetPlaylistTracks={this.handleGetPlaylistTracks}
                        // handleShowConfirmDeleteDialog={this.handleShowConfirmDeleteDialog}
                        // handleHideConfirmDeleteDialog={this.handleHideConfirmDeleteDialog}
                        // handleConfirmDeletePlaylist={this.handleConfirmDeletePlaylist}
                        // showConfirmDeleteDialog={this.state.showConfirmDeleteDialog}
                        // confirmDeletePlaylistId={this.state.confirmDeletePlaylistId}
                        // confirmDeletePlaylistName={this.state.confirmDeletePlaylistName}
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

// App.propTypes = {
//   classes: PropTypes.object.isRequired,
//   loginUser: PropTypes.func.isRequired,
//   user: PropTypes.object.isRequired,
//   UI: PropTypes.object.isRequired
// }

// const mapStateToProps = (state) => ({
//   user: state.user,
//   UI: state.UI
// });

// const mapActionsToProps = {
//   loginUser
// }

export default App;
