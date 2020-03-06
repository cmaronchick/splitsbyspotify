import React, { Component } from 'react';
import './App.css';
import { ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import {
  login,
  logout,
  refreshAccessToken,
  getAllUserPlaylists,
  getMyUserPlaylists,
  getPlaylistFromSpotify,
  addToMyPlaylists,
  removeFromMyPlaylists } from './functions/spotify'
import { getUrlParameters } from './functions/utils'
import { spotifyConfig } from './constants/spotifyConfig'
import themeFile from './constants/theme'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SpotifyLogin from './components/SpotifyLogin'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

const theme = createMuiTheme(themeFile)
let authenticated;
const token = localStorage.FBIDToken

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      spotifyUser: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      FBIDToken: token
    }
  }

  handleSpotifyLogin = () => {
    localStorage.state = spotifyConfig.state
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
    try {
      let spotifyData = await refreshAccessToken(refresh_token)
      console.log('spotifyRefreshData', spotifyData)
      this.setState({
        ...spotifyData
      })
    }catch(refreshTokenError) {
      console.log('refreshTokenError', refreshTokenError)
    }

  }
  handleSpotifyCallback = async (location, access_token) => {
    try {
      let spotifyData = await login(location);
      //let FBLoginData = await FBLoginData()
      console.log('spotifyData', spotifyData)
      this.setState({...spotifyData})
      localStorage.spotifyAccessToken = spotifyData.spotifyAccessToken;
      localStorage.spotifyRefreshToken = spotifyData.spotifyRefreshToken;
      window.history.pushState({ 'page_id': 1, 'user': 'spotifyUser'}, '', '/')
    } catch(loginError) {
      console.log('loginError', loginError)
    }
  }
  handleGetAllPlaylists = async (access_token) => {
    try {
      let allPlaylistsResponse = await getAllUserPlaylists(access_token)
      let allPlaylists = {}
      allPlaylistsResponse.playlists.map(playlist => {
        allPlaylists[playlist.id] = {...playlist}
      })
      this.setState({ allPlaylists })
    } catch (getAllPlaylistsError) {
      console.log('getAllPlaylistsError', getAllPlaylistsError)
    }
  }
  handleGetMyPlaylists = async (FBIDToken) => {
    try {
      let myPlaylistsResponse = await getMyUserPlaylists(FBIDToken)
      let myPlaylists = {}
      myPlaylistsResponse.myPlaylists.forEach(playlist => {
        myPlaylists[playlist.id] = {...playlist}
      })
      this.setState({ myPlaylists })
      Object.keys(myPlaylists).forEach(id => {
        this.handleGetPlaylistFromSpotify(this.state.spotifyAccessToken, id, myPlaylists[id].playlistId)
      })
    } catch (getMyUserPlaylistsError) {
      console.log('getMyUserPlaylistsError', getMyUserPlaylistsError)
    }
  }
  handleGetPlaylistFromSpotify = async(spotifyAccessToken, id, playlistId) => {
    try {
      let playlistResponse = await getPlaylistFromSpotify(spotifyAccessToken, playlistId)
      console.log('playlistResponse', playlistResponse)
      let myPlaylists = {...this.state.myPlaylists}
      myPlaylists[id] = playlistResponse
      this.setState({
        myPlaylists
      })

    } catch (getPlaylistFromSpotifyError) {
      console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    }
  }

  checkSpotifyPlaylistInMyPlaylists = () => {
    const { allPlaylists, myPlaylists } = this.state
    if (allPlaylists && allPlaylists.length > 0) {
      allPlaylists.map(playlist => {

      })
    }
  }


  handleAddPlaylist = async (playlistId) => {
    try {
      let addPlaylistResponse = await addToMyPlaylists(this.state.FBIDToken, playlistId)
      console.log('addPlaylistResponse', addPlaylistResponse)
      this.handleGetMyPlaylists(this.state.FBIDToken)
    } catch (addPlaylistError) {
      console.log('addPlaylistError', addPlaylistError)
    }
  }
  handleRemovePlaylist = async (playlistId) => {
    let removePlaylistResponse = await removeFromMyPlaylists(this.state.FBIDToken, playlistId)
  }

  componentDidMount() {
    let refreshToken = localStorage.spotifyRefreshToken
    let FBIDToken = localStorage.FBIDToken
    console.log('refreshToken', refreshToken)
    if (refreshToken) {
      console.log('The cookie "reader" exists (ES6)')
      this.handleSpotifyRefreshToken(refreshToken)
    }
    if (window.location.pathname === '/spotifyCallback') {
      console.log('starting spotify login')
      this.handleSpotifyCallback(window.location)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.spotifyAccessToken !== this.state.spotifyAccessToken && this.state.spotifyAccessToken) {
      this.handleGetAllPlaylists(this.state.spotifyAccessToken)
      this.handleGetMyPlaylists(this.state.FBIDToken)
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
                      <Home 
                        spotifyUser={this.state.spotifyUser} 
                        allPlaylists={this.state.allPlaylists} 
                        myPlaylists={this.state.myPlaylists}
                        handleAddPlaylistClick={this.handleAddPlaylist} />
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
