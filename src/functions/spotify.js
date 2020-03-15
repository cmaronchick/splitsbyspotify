import ky from 'ky/umd'
import { getUrlParameters } from './utils'
import { spotifyConfig } from '../constants/spotifyConfig'
import firebase from '../constants/firebase'

//const requestAccessToken = async ()

export const login = async (location) => {

    // your application requests refresh and access tokens
    // after checking the state parameter
    if (!location) {
        return { error: 'No Location Submitted'}
    }
    let FBIDToken;
    let code = getUrlParameters(location.search, 'code')

    const searchParams = new URLSearchParams();
    console.log(`origin: ${window.location.hostname === 'localhost' ? `http://localhost:3000` : window.location.origin}/spotifyCallback`)
    searchParams.set('code', code)
    searchParams.set('redirect_uri', `${window.location.hostname === 'localhost' ? `http://localhost:3000` : window.location.origin}/spotifyCallback`)
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
              let FBIDToken;
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
                localStorage.FBIDToken = FBIDToken
              } catch (firebaseResponse) {
                console.log('firebaseResponseError', firebaseResponse)
                try {
                  let firebaseResponseError = await firebaseResponse.response.json()
                  console.log('firebaseResponseError', firebaseResponseError)
                } catch(err) {
                  console.log('err', err)
                }
              }
              let FBUser
              try {
                let FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
                console.log('FBUser', FBUser)
                return {
                  spotifyUser: spotifyResponse,
                  spotifyAccessToken: access_token,
                  spotifyRefreshToken: refresh_token,
                  FBUser
                }
              } catch (getFBUserError) {
                console.log('getFBUserError', getFBUserError)
                throw new Error(getFBUserError)
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

export const logout = () => {
    localStorage.removeItem('spotifyAccessToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('FBIDToken');
    return { message: 'User logged out successfully.'};
}

export const refreshAccessToken = async (refresh_token) => {
    let FBIDToken = localStorage.FBIDToken
    console.log('refresh_token', refresh_token)
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
    let FBUser
    try {
      FBUser = firebase.auth().currentUser;
      if (!FBUser && FBIDToken !== 'null') {
        console.log('FBIDToken', FBIDToken)
        
        FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
        FBIDToken = await firebase.auth().currentUser.getIdToken()
        localStorage.FBIDToken = FBIDToken
      }
    } catch(getFBUserError) {
      console.log('getFBUserError', getFBUserError)
    }
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
                try {
                  let FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
                  FBIDToken = await firebase.auth().currentUser.getIdToken()
                  localStorage.FBIDToken = FBIDToken
                  return {
                    spotifyUser: spotifyResponse,
                    spotifyAccessToken: access_token,
                    spotifyRefreshToken: refresh_token,
                    FBUser
                  }
                } catch (getFBUserError) {
                  console.log('getFBUserError', getFBUserError)
                  throw new Error(getFBUserError)
                }

              } catch (firebaseResponse) {
                console.log('firebaseResponseError', firebaseResponse)
                try {
                  let firebaseResponseError = await firebaseResponse.response.json()
                  console.log('firebaseResponseError', firebaseResponseError)
                } catch(err) {
                  console.log('err', err)
                }
              }
            } catch (spotifyLoginError) {
                console.log('spotifyLoginError :', spotifyLoginError);
                return { error: spotifyLoginError }
            }
        }
  }catch (spotifyTokenErrorResponse) {
    let spotifyTokenError = spotifyTokenErrorResponse.response ? await spotifyTokenErrorResponse.response.json() : spotifyTokenErrorResponse
    console.log('spotifyTokenError', spotifyTokenError)
    throw new Error(JSON.stringify({ error: spotifyTokenErrorResponse }))
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
    try {
      let myPlaylists = await ky.get('/playlists/my', {
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

export const addToMyPlaylists = async (FBIDToken, playlistId, publicPlaylist, collaborative) => {
  let FBUser = firebase.auth().currentUser
  console.log('FBUser', FBUser)
  const searchParams = new URLSearchParams()
  searchParams.set('playlistId', playlistId)
  searchParams.set('public', publicPlaylist)
  searchParams.set('collaborative', collaborative)
  try {
    let addPlaylistResponse = await ky.post('/playlists', {
      headers: {
        Authorization: `Bearer ${FBIDToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams
    }).json()
    console.log('addPlaylistResponse', addPlaylistResponse)
  } catch (addPlaylistErrorResponse) {
    console.log('addPlaylistErrorResponse', addPlaylistErrorResponse)
    try {
      let addPlaylistErrorJSON = await addPlaylistErrorResponse.json()
      console.log('addPlaylistError', addPlaylistErrorJSON)
      throw new Error(addPlaylistErrorJSON)
    } catch (addPlaylistError) {
      console.log('addPlaylistError', addPlaylistError)
      throw new Error(addPlaylistError)
    }
  }
}

export const removeFromMyPlaylists = async (FBIDToken, playlistId) => {
  try {
    let removePlaylistResponse = await ky.delete(`/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${FBIDToken}`
      }
    }).json()
    console.log('removePlaylistResponse', removePlaylistResponse)
  } catch (removePlaylistErrorResponse) {
    console.log('removePlaylistErrorResponse', removePlaylistErrorResponse)
    try {
      let removePlaylistErrorJSON = await removePlaylistErrorResponse.json()
      console.log('removePlaylistErrorJSON', removePlaylistErrorJSON)
      throw new Error(removePlaylistErrorJSON)
    } catch (removePlaylistError) {
      console.log('removePlaylistError', removePlaylistError)
      throw new Error(removePlaylistError)
    }
  }

}

export const getPlaylistFromSpotify = async (spotifyAccessToken, playlistId) => {
  console.log('spotifyAccessToken', spotifyAccessToken)
  try {
    let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`
      }
    }).json()
    console.log('spotifyPlaylistResponse', spotifyPlaylistResponse)
    return { ...spotifyPlaylistResponse }
  } catch (getPlaylistFromSpotifyError) {
    console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    throw new Error(JSON.stringify(getPlaylistFromSpotifyError))
  }

}

export const getPlaylistTracks = async (spotifyAccessToken, playlistTracksHref) => {
  // TO DO CHECK STATUS OF ACCESS TOKEN

  try {
    let playlistTracksResponse = await ky.get(playlistTracksHref, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`
      }
    }).json()
    console.log('playlistTracksResponse', playlistTracksResponse)
    return { currentPlaylist: playlistTracksResponse }
  } catch (getPlaylistTracksError) {
    console.log('getPlaylistFromSpotifyError', getPlaylistTracksError)
    throw new Error(JSON.stringify(getPlaylistTracksError))
  }
}
