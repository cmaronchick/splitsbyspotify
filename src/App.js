import React, { Component } from 'react';
import PropTypes from 'prop-types'
import dotenv from 'dotenv'
import jwtDecode from 'jwt-decode'
import firebase from './constants/firebase'

import {Provider} from 'react-redux'
import store from './redux/store'

import { login, logout, refreshTokens, getUserData } from './redux/actions/userActions'
import { getAllPlaylists, getAllMyPlaylistsFromSpotify, getMyPlaylists, likePlaylist, unlikePlaylist } from './redux/actions/spotifyActions'
import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED, SET_PLAYLISTS_MY, LOADING_USER } from './redux/types'

import './App.css';
import { withStyles} from '@material-ui/core/styles'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import {
  refreshAccessToken,
  getAllUserPlaylists,
  getMyUserPlaylists,
  getPlaylistFromSpotify,
  getPlaylistTracks,
  addToMyPlaylists,
  removeFromMyPlaylists } from './functions/spotify'
import { getUrlParameters, generateRandomString } from './functions/utils'
import { spotifyConfig } from './constants/spotifyConfig'
import themeFile from './constants/theme'

import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Playlist from './pages/Playlist'
import SpotifyLogin from './components/layout/SpotifyLogin'
import AuthRoute from './components/util/AuthRoute'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

const theme = createMuiTheme(themeFile)
const FBIDToken = localStorage.FBIDToken
const spotifyAccessToken = localStorage.spotifyAccessToken
const spotifyRefreshToken = localStorage.spotifyRefreshToken
if (FBIDToken && spotifyAccessToken) {
  const decodedToken = jwtDecode(FBIDToken);
  if (decodedToken.exp * 1000 > Date.now()) {
    //window.location.href = '/login'
    store.dispatch({ type: SET_AUTHENTICATED })
    store.dispatch(refreshTokens(spotifyRefreshToken));
  } else {
    console.log('old token', decodedToken.exp * 1000 > Date.now())
    store.dispatch(logout())
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

  handleSpotifyLogin = () => {
    let state = generateRandomString(16)
    localStorage[stateKey] = state
    let currentOrigin = window.location.origin
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyConfig.client_id}&scope=${spotifyConfig.scope}&redirect_uri=${currentOrigin}/spotifyCallback&state=${state}`
  }
  handleSpotifyLogout = () => {
    let logoutResponse = store.dispatch(logout());
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
    //try {
      //let spotifyData = store.dispatch(refreshTokens(refresh_token))
      // console.log('spotifyRefreshData', spotifyData)
      // this.setState({
      //   ...spotifyData
      // })
    // }catch(refreshTokenError) {
    //   console.log('refreshTokenError', refreshTokenError)
    // }

  }
  handleSpotifyCallback = async (location, access_token) => {
    store.dispatch({
      type: LOADING_USER
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
    // try {
    //   let allPlaylistsResponse = await getAllUserPlaylists(access_token)
    //   let allPlaylists = {}
    //   allPlaylistsResponse.playlists.forEach(playlist => {
    //     allPlaylists[playlist.id] = {...playlist}
    //   })
    //   this.setState({ allPlaylists })
    //   if (window.location.pathname.indexOf('/playlist') > -1 && window.location.pathname.split('/').length > 2) {
    //     let playlistId = window.location.pathname.split('/')[2]
    //     this.handleGetPlaylistTracks(this.state.allPlaylists[playlistId])
    //   }
    // } catch (getAllPlaylistsError) {
    //   console.log('getAllPlaylistsError', getAllPlaylistsError)
    // }

  }
  handleGetMyPlaylists = async () => {
    let FBIDToken
    try {
      FBIDToken = await firebase.auth().currentUser.getIdToken()
      console.log('FBIDToken', FBIDToken)
    } catch(getTokenError) {
      console.log('getTokenError120', getTokenError)
    }
    try {
      
      store.dispatch(getMyPlaylists(FBIDToken))
      // Object.keys(myPlaylists).forEach(id => {
      //   this.handleGetPlaylistFromSpotify(this.state.spotifyAccessToken, id, myPlaylists[id].playlistId)
      // })
    } catch (getMyUserPlaylistsError) {
      console.log('getMyUserPlaylistsError', getMyUserPlaylistsError)
    }

  }
  handleGetPlaylistFromSpotify = async(spotifyAccessToken, id, playlistId) => {
    try {
      let playlistResponse = await getPlaylistFromSpotify(spotifyAccessToken, playlistId)
      let myPlaylists = {...this.state.myPlaylists}
      myPlaylists[id] = playlistResponse
      myPlaylists[id].inMyPlaylists = true
      this.setState({
        myPlaylists
      })
      this.checkSpotifyPlaylistInMyPlaylists()
    } catch (getPlaylistFromSpotifyError) {
      console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    }
  }

  checkSpotifyPlaylistInMyPlaylists = () => {
    
    const { myPlaylists } = this.state
    let allPlaylists = {...this.state.allPlaylists}
    if (myPlaylists && Object.keys(myPlaylists).length > 0 && allPlaylists && Object.keys(allPlaylists).length > 0) {
      Object.keys(myPlaylists).forEach(playlistId => {
        if (allPlaylists[myPlaylists[playlistId].id]) {
          allPlaylists[myPlaylists[playlistId].id].inMyPlaylists = true
        }
      })
      this.setState({
        allPlaylists
      })
    }
  }


  handleAddPlaylist = async (playlistId, publicPlaylist, collaborative) => {
    try {
      let addPlaylistResponse = await addToMyPlaylists(this.state.FBIDToken, playlistId, publicPlaylist, collaborative)
      console.log('addPlaylistResponse', addPlaylistResponse)
      this.handleGetMyPlaylists(this.state.FBIDToken)
    } catch (addPlaylistError) {
      console.log('addPlaylistError', addPlaylistError)
    }
  }
  handleRemovePlaylist = async (playlistId) => {
    try {
      let removePlaylistResponse = await removeFromMyPlaylists(this.state.FBIDToken, playlistId)
      this.handleGetMyPlaylists(this.state.FBIDToken)
    } catch (removePlaylistError) {
      console.log('removePlaylistError', removePlaylistError)
    }
  }
  handleGetPlaylistTracks = async ({id, href}) => {
    this.setState({
      currentPlaylistId: id,
      currentPlaylistLoading: true
    })
    try {
      let currentPlaylistResponse = await getPlaylistTracks(this.state.spotifyAccessToken, href)
      console.log('currentPlaylistResponse', currentPlaylistResponse)
      this.setState({
        currentPlaylist: currentPlaylistResponse.currentPlaylist,
        currentPlaylistLoading: false

      })
    } catch (getPlaylistTracksError) {
      console.log('getPlaylistTracksError', getPlaylistTracksError)

    }
  }
  handleShowConfirmDeleteDialog = (playlistId, playlistName) => {
      this.setState({
          confirmDeletePlaylistId: playlistId,
          confirmDeletePlaylistName: playlistName,
          showConfirmDeleteDialog: true
      })
  }
  handleConfirmDeletePlaylist = (playlistId) => {
      this.handleRemovePlaylist(playlistId)
      this.setState({
          confirmDeletePlaylistId: null,
          confirmDeletePlaylistName: null,
          showConfirmDeleteDialog: false
      })
  }
  handleHideConfirmDeleteDialog = () => {
      this.setState({
          confirmDeletePlaylistId: null,
          confirmDeletePlaylistName: null,
          showConfirmDeleteDialog: false
      })
  }

  handleSelectDistance = (distance) => {
    this.setState({
      selectedDistance: distance
    })
  }
  handleTextInput = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  handleCalculateButtonClick = () => {
    const { selectedDistance, targetPace } = this.state
    const minPerMile = targetPace.split(':')[0]
    const secPerMile = targetPace.split(':')[1]
    let splits = []
    let remainingDistance = selectedDistance
    let elapsedMinutes = 0;
    let elapsedSeconds = 0;
    let split = ""
    let i = 1
    while (remainingDistance > 0) {
      elapsedMinutes = (i * minPerMile)
      elapsedSeconds = (i * secPerMile)
      if (remainingDistance > 0 && remainingDistance < 1) {
        elapsedMinutes = ((i-1) * minPerMile)
        elapsedSeconds = (((remainingDistance * minPerMile) + (remainingDistance * secPerMile)) * 60).toFixed(0)

      }
      if (elapsedSeconds >= 60) {
        elapsedMinutes += elapsedSeconds%60
        elapsedSeconds = elapsedSeconds - (elapsedMinutes*60)
        elapsedSeconds = elapsedSeconds < 10 ? "0" + elapsedSeconds : elapsedSeconds
      }
      split = `${elapsedMinutes}:${elapsedSeconds}`
      splits.push(split)
      remainingDistance = selectedDistance - i
      i++
    }
    this.setState({
      splits
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
    if (window.location.pathname.indexOf('/playlist') > -1 && window.location.pathname.split('/').length > 2) {
      let playlistId = window.location.pathname.split('/')[2]
      console.log('looking up playlist', playlistId)
      //let currentPlaylist = this.state.allPlaylists
      this.handleGetPlaylistFromSpotify(this.state.spotifyAccessToken, playlistId, playlistId)
    }
    store.dispatch(getAllPlaylists())
  }
  componentDidUpdate(prevProps, prevState) {
    // if (prevState.spotifyAccessToken !== this.state.spotifyAccessToken && this.state.spotifyAccessToken) {
    //   this.handleGetAllPlaylists(this.state.spotifyAccessToken)
    // }
    // if (this.state.FBUser && this.state.FBUser !== prevState.FBUser) {
    //   this.handleGetMyPlaylists()
    // }
    // if (prevState.myPlaylists !== this.state.myPlaylists && this.state.myPlaylists.length > 0) {
    //   this.checkSpotifyPlaylistInMyPlaylists()
    // }
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
                <Navbar color="primary.main" />
              </div>
              <div className="container">
                <SpotifyLogin handleSpotifyLogin={this.handleSpotifyLogin} handleSpotifyLogout={this.handleSpotifyLogout} />
                <Switch>
                  <AuthRoute path='/signup' component={Signup}/>
                  <AuthRoute path='/login' component={Login}/>
                  <Route path={['/profile','/profile/:spotifyUser']} component={Profile} />
                  <Route path={['/playlist/:playlistId', '/playlist']} render={({match}) => {
                    return <Playlist
                    spotifyUser={this.state.spotifyUser}
                    selectedDistance={this.state.selectedDistance}
                    targetPace={this.state.targetPace}
                    splits={this.state.splits}
                    handleGetPlaylistTracks={this.handleGetPlaylistTracks}
                    handleSelectDistance={this.handleSelectDistance}
                    handleTextInput={this.handleTextInput}
                    handleCalculateButtonClick={this.handleCalculateButtonClick}
                    checkForPlaylist={this.checkForPlaylist}
                    playlist={this.state.currentPlaylist}
                    playlistId={match.params.playlistId}
                    playlistLoading={this.state.currentPlaylistLoading}
                    />
                    }
                  } />
                  <Route path='/' render={({match}) => {
                    return (
                      <Home 
                        // spotifyUser={this.state.spotifyUser} 
                        // allPlaylists={this.state.allPlaylists} 
                        // myPlaylists={this.state.myPlaylists}
                        handleAddPlaylistClick={this.handleAddPlaylist}
                        handleRemovePlaylistClick={this.handleRemovePlaylist}
                        handleGetPlaylistTracks={this.handleGetPlaylistTracks}
                        handleShowConfirmDeleteDialog={this.handleShowConfirmDeleteDialog}
                        handleHideConfirmDeleteDialog={this.handleHideConfirmDeleteDialog}
                        handleConfirmDeletePlaylist={this.handleConfirmDeletePlaylist}
                        showConfirmDeleteDialog={this.state.showConfirmDeleteDialog}
                        confirmDeletePlaylistId={this.state.confirmDeletePlaylistId}
                        confirmDeletePlaylistName={this.state.confirmDeletePlaylistName} />
                    )
                  }} />
                </Switch>
              </div>
            </Router>
          </Provider>
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
