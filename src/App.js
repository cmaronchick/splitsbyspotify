import React, { Component } from 'react';
import './App.css';
import { ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import ky from 'ky'

import { login, logout, refreshAccessToken, getAllUserPlaylists, getMyUserPlaylists } from './functions/spotify'
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
    let spotifyData = await refreshAccessToken(refresh_token)
    console.log('spotifyRefreshData', spotifyData)
    this.setState({
      ...spotifyData
    })

  }
  handleSpotifyCallback = async (location, access_token) => {
    let spotifyData = await login(location);
    //let FBLoginData = await FBLoginData()
    console.log('spotifyData', spotifyData)
    this.setState({...spotifyData})
    localStorage.spotifyAccessToken = spotifyData.spotifyAccessToken;
    localStorage.spotifyRefreshToken = spotifyData.spotifyRefreshToken;
    window.history.pushState({ 'page_id': 1, 'user': 'spotifyUser'}, '', '/')
  }
  handleGetAllPlaylists = async (access_token) => {
    let allPlaylistsResponse = await getAllUserPlaylists(access_token)
    this.setState({ allPlaylists: allPlaylistsResponse.playlists })
  }
  handleGetMyPlaylists = async (FBIDToken) => {
    let myPlaylistsResponse = await getMyUserPlaylists(FBIDToken)
    this.setState({ myPlaylists: myPlaylistsResponse.playlists })
  }

  componentDidMount() {
    let refreshToken = localStorage.spotifyRefreshToken
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
    }
    if (prevState.FBIDToken !== this.state.FBIDToken && this.state.FBIDToken) {
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
                      <Home spotifyUser={this.state.spotifyUser} allPlaylists={this.state.allPlaylists} myPlaylists={this.state.myPlaylists} />
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
