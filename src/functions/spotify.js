import ky from 'ky'
import { getUrlParameters } from './utils'
import { spotifyConfig } from '../constants/spotifyConfig'

//const requestAccessToken = async ()

export const login = async (location) => {

    // your application requests refresh and access tokens
    // after checking the state parameter
    if (!location) {
        return { error: 'No Location Submitted'}
    }
    let code = getUrlParameters(location.search, 'code')

    let state = location.search.state || null;
    let storedState = location.cookies ? location.cookies[spotifyConfig.stateKey] : null;
    console.log('storedState', storedState)
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
        var access_token = spotifyTokenResponse.access_token,
            refresh_token = spotifyTokenResponse.refresh_token,
            error = spotifyTokenResponse.error;

        if (access_token) {
            try {
              let spotifyResponse = await ky.get('https://api.spotify.com/v1/me',{
                  headers: {
                      'Authorization': 'Bearer ' + access_token
                  }
              }).json()
              console.log('spotifyResponse :', spotifyResponse);
              return {
                spotifyUser: spotifyResponse,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token
              }
            } catch (spotifyLoginError) {
                console.log('spotifyLoginError :', spotifyLoginError);
                return { error: spotifyLoginError }
            }
        }
  }catch (spotifyTokenErrorResponse) {
    let spotifyTokenError = spotifyTokenErrorResponse.response ? await spotifyTokenErrorResponse.response.json() : spotifyTokenErrorResponse
    console.log('spotifyTokenError', spotifyTokenError)
    return { error: spotifyTokenErrorResponse }
  }
}

export const refreshAccessToken = async (refresh_token) => {
    const searchParams = new URLSearchParams();
    searchParams.set('grant_type', 'refresh_token')
    searchParams.set('refresh_token', refresh_token)
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
        var access_token = spotifyTokenResponse.access_token,
            error = spotifyTokenResponse.error;

        if (access_token) {
            try {
              let spotifyResponse = await ky.get('https://api.spotify.com/v1/me',{
                  headers: {
                      'Authorization': 'Bearer ' + access_token
                  }
              }).json()
              console.log('spotifyResponse :', spotifyResponse);
              return {
                spotifyUser: spotifyResponse,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token
              }
            } catch (spotifyLoginError) {
                console.log('spotifyLoginError :', spotifyLoginError);
                return { error: spotifyLoginError }
            }
        }
  }catch (spotifyTokenErrorResponse) {
    let spotifyTokenError = spotifyTokenErrorResponse.response ? await spotifyTokenErrorResponse.response.json() : spotifyTokenErrorResponse
    console.log('spotifyTokenError', spotifyTokenError)
    return { error: spotifyTokenErrorResponse }
  }
    
}

export const getUserPlaylists = async (access_token) => {
    try {
      let spotifyPlaylists = await ky.get('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }).json()
      return { playlists: spotifyPlaylists.items }
    } catch (getUserPlaylistsErrorResponse) {
      let getUserPlaylistsError = await getUserPlaylistsErrorResponse.json()
      console.log({ getUserPlaylistsError })
      return { error: getUserPlaylistsError }
    }
}
