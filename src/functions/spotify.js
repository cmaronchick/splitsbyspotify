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
    let FBIDToken;
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
              const spotifyID = spotifyResponse.id,
                display_name = spotifyResponse.display_name,
                photoURL = spotifyResponse.images && spotifyResponse.images.length > 0 ? spotifyResponse.images[0].url : '',
                email = spotifyResponse.email,
                accessToken = spotifyResponse.accessToken;
              try {
                let body = new URLSearchParams()
                body.set('spotifyID', spotifyID)
                body.set('display_name', display_name)
                body.set('photoURL', photoURL)
                body.set('email', email)
                body.set('accessToken', accessToken)
                let firebaseResponse = await ky.post('/spotifyLogin', {
                  body: body
                }).json()
                FBIDToken = firebaseResponse.token
                console.log('firebase', FBIDToken)

              } catch (firebaseResponse) {
                console.log('firebaseResponseError', firebaseResponse)
                try {
                  let firebaseResponseError = await firebaseResponse.response.json()
                  console.log('firebaseResponseError', firebaseResponseError)
                } catch(err) {
                  console.log('err', err)
                }
              }
              return {
                spotifyUser: spotifyResponse,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                FBIDToken
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

export const logout = async () => {
    localStorage.spotifyAccessToken = null;
    localStorage.spotifyRefreshToken = null;
    return true;
}

export const refreshAccessToken = async (refresh_token) => {
  let FBIDToken
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
              const spotifyID = spotifyResponse.id,
                display_name = spotifyResponse.display_name,
                photoURL = spotifyResponse.images && spotifyResponse.images.length > 0 ? spotifyResponse.images[0].url : '',
                email = spotifyResponse.email,
                accessToken = spotifyResponse.accessToken;
              try {
                let body = new URLSearchParams()
                body.set('spotifyID', spotifyID)
                body.set('display_name', display_name)
                body.set('photoURL', photoURL)
                body.set('email', email)
                body.set('accessToken', accessToken)
                let firebaseResponse = await ky.post('/spotifyLogin', {
                  body: body
                }).json()
                FBIDToken = firebaseResponse.token
                console.log('firebase', FBIDToken)

              } catch (firebaseResponse) {
                console.log('firebaseResponseError', firebaseResponse)
                try {
                  let firebaseResponseError = await firebaseResponse.response.json()
                  console.log('firebaseResponseError', firebaseResponseError)
                } catch(err) {
                  console.log('err', err)
                }
              }
              return {
                spotifyUser: spotifyResponse,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                FBIDToken
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

export const getAllUserPlaylists = async (access_token) => {
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
export const getMyUserPlaylists = async (FBIDToken) => {
  console.log('FBIDToken', FBIDToken)
    try {
      let myPlaylists = await ky.get('/playlists', {
        headers: {
          Authorization: `Bearer ${FBIDToken}`
        }
      }).json()
      console.log('myPlaylists', myPlaylists)
      return { myPlaylists }
    } catch (getUserPlaylistsErrorResponse) {
      let getUserPlaylistsError = await getUserPlaylistsErrorResponse.json()
      console.log({ getUserPlaylistsError })
      return { error: getUserPlaylistsError }
    }
}
