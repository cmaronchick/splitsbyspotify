import React, { Component } from 'react';
import './App.css';
import { ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import ky from 'ky'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SpotifyLogin from './components/SpotifyLogin'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'

const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const getUrlParameters = (redirectUrl, sParam) => {
  const sURLQueryString = redirectUrl.split('?');
  const sURLVariables = sURLQueryString[1].split('&')
  console.log('sURLVariables: ', sURLVariables)
  for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
          if (sParameterName[1].indexOf("#") > -1) {
              var code = sParameterName[1].split('#');
              console.log('code', code)
              return code[0];
          }
          return sParameterName[1];
      }
  }
}

const spotifyConfig = {
  client_id: '534a806796ed42899cd7a378ecedf8f9',
  client_secret: 'a3f458bed20a4fc5b34e06243d9283c7',
  scope: 'user-read-private user-read-email',
  state: generateRandomString(16),
  stateKey: 'spotify_auth_state'
}

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
      spotifyUser: null
    }
  }

  getHashParams = (hashParamsString) => {
      if (!hashParamsString) {
          return false;
      }
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = hashParamsString.substring(1);
      while ( e === r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
  }

  handleSpotifyLogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyConfig.client_id}&scope=${spotifyConfig.scope}&redirect_uri=http://localhost:3000/spotifyCallback&state=${spotifyConfig.state}`
  }

  handleSpotifyCallback = async (location) => {

      // your application requests refresh and access tokens
  // after checking the state parameter
    console.log('location', location)
    let code = getUrlParameters(location.search, 'code')

    let state = location.search.state || null;
    let storedState = location.cookies ? location.cookies[spotifyConfig.stateKey] : null;
    console.log('code', code)
    const searchParams = new URLSearchParams();
    searchParams.set('code', code)
    searchParams.set('redirect_uri', 'http://localhost:3000/spotifyCallback')
    searchParams.set('grant_type', 'authorization_code')
    let authOptions = { 
      body: searchParams,
      headers: {
        'Authorization': 'Basic ' + (new Buffer(spotifyConfig.client_id + ':' + spotifyConfig.client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    try {
      let spotifyTokenResponse = await ky.post('https://accounts.spotify.com/api/token', authOptions).json()
      console.log('spotifyTokenResponse', spotifyTokenResponse)
      //let params = this.getHashParams(spotifyTokenResponse);
      var access_token = spotifyTokenResponse.access_token,
          refresh_token = spotifyTokenResponse.refresh_token,
          error = spotifyTokenResponse.error;

      if (error) {
        alert('There was an error during the authentication process');
      } else {
            if (access_token) {
                // render oauth info
                // oauthPlaceholder.innerHTML = oauthTemplate({
                //     access_token: access_token,
                //     refresh_token: refresh_token
                // });
    
                try {
                    let spotifyResponse = await ky.get('https://api.spotify.com/v1/me',{
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        }
                    }).json()
                    document.cookie = `spotifyAccessToken=${access_token};max-age=3600`
                    console.log('spotifyResponse :', spotifyResponse);
                    this.setState({
                      spotifyUser: spotifyResponse
                    })
                    window.history.pushState({ 'page_id': 1, 'user': 'spotifyUser'}, '', '/')
    
                } catch (spotifyLoginError) {
                    console.log('spotifyLoginError :', spotifyLoginError);
                }
            } else {
                // render initial screen
                // $('#login').show();
                // $('#loggedin').hide();
            }
        }
      }catch (spotifyTokenError) {
        let spotifyTokenErrorJSON = await spotifyTokenError.response.json()
        console.log('spotifyTokenError', spotifyTokenErrorJSON)
      }
  }

  componentDidMount() {
    if (window.location.pathname === '/spotifyCallback') {
      console.log('starting spotify login')
      this.handleSpotifyCallback(window.location)
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
                <SpotifyLogin user={this.state.user} spotifyUser={this.state.spotifyUser} handleSpotifyLogin={this.handleSpotifyLogin} />
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
