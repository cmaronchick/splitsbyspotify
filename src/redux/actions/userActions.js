import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED } from '../types'
import store from '../store'
import ky from 'ky/umd'
import { getUrlParameters } from '../../functions/utils'
import {spotifyConfig} from '../../constants/spotifyConfig'
import firebase from '../../constants/firebase'

const SpotifyAPI = ky.create()
const FBAPI = ky.create()

export const login = (location, history) => async (dispatch) => {
    dispatch({ type: LOADING_UI });

    // your application requests refresh and access tokens
    // after checking the state parameter
    if (!location) {
        return { error: 'No Location Submitted'}
    }
    let FBIDToken, FBUser;
    let code = getUrlParameters(location.search, 'code')

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

            localStorage.spotifyAccessToken = access_token;
            localStorage.spotifyRefreshToken = refresh_token;
            const spotifyAccessToken = `Bearer ${access_token}`
            SpotifyAPI.extend({
                headers: {
                    'Authorization': spotifyAccessToken
                }
            })
            let spotifyResponse = await ky.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': spotifyAccessToken
                }
            }).json()
            const spotifyID = spotifyResponse.id,
            display_name = spotifyResponse.display_name,
            photoURL = spotifyResponse.images && spotifyResponse.images.length > 0 ? spotifyResponse.images[0].url : '',
            email = spotifyResponse.email,
            accessToken = spotifyResponse.accessToken;
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
            FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
            FBAPI.extend({
                headers: {
                    'Authorization': `Bearer ${FBIDToken}`
                }
            })
            dispatch({
                type: SET_USER,
                payload: {
                    spotifyUser: spotifyResponse,
                    spotifyAccessToken: access_token,
                    spotifyRefreshToken: refresh_token,
                    FBUser,
                    FBIDToken,
                    loading: false
                }
            })
            window.history.pushState({ 'page_id': 1, 'user': 'spotifyUser'}, '', '/')
        } else {

            dispatch({
                type: SET_ERRORS,
                payload: {error: 'No access token received from Spotify'},
                loading: false
            })
        }
  }catch (spotifyTokenErrorResponse) {
    let spotifyTokenError = spotifyTokenErrorResponse.response ? await spotifyTokenErrorResponse.response.json() : spotifyTokenErrorResponse
    console.log('spotifyTokenError', spotifyTokenError)
    dispatch({
        type: SET_ERRORS,
        payload: spotifyTokenError,
        loading: false
    })
  }
}


export const logout = () => (dispatch) => {
    localStorage.removeItem('spotifyAccessToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('FBIDToken');
    dispatch({ type: SET_UNAUTHENTICATED })
}

export const refreshTokens = (spotifyRefreshToken) => async (dispatch) => {
    let FBIDToken = localStorage.FBIDToken
    console.log('refresh_token', spotifyRefreshToken)
    const searchParams = new URLSearchParams();
    searchParams.set('grant_type', 'refresh_token')
    searchParams.set('refresh_token', spotifyRefreshToken)
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
                  dispatch({
                      type: SET_USER,
                        payload: {
                            spotifyUser: spotifyResponse,
                            spotifyAccessToken: access_token,
                            spotifyRefreshToken: spotifyRefreshToken,
                            FBUser
                        }
                  })
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

export const getUserData = () => async (dispatch) => {
    try {
        let spotifyUser = await SpotifyAPI.get('https://api.spotify.com/v1/me').json()
        let FBUser = await FBAPI.get('/user')
        dispatch({
            type: SET_USER,
            payload: {
                spotifyUser,
                FBUser
            }
        })

    } catch (getUserDataError) {
        console.log('getUserDataError', getUserDataError)

    }
}