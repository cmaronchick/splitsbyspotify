import { 
    SET_USER, 
    SET_ERRORS, 
    CLEAR_ERRORS, 
    LOADING_UI, 
    STOP_LOADING_UI, 
    SET_UNAUTHENTICATED,
    SET_TOUR_COMPLETED,
    LOADING_USER,
    CLEAR_PLAYLISTS,
    LOADING_PLAYLISTS_MY,
    LOADING_PLAYLISTS_MY_FROM_SPOTIFY,
    MARK_NOTIFICATIONS_READ} from '../types'
import ky from 'ky/umd'
import { getUrlParameters } from '../../functions/utils'
import {spotifyConfig} from '../../constants/spotifyConfig'
import firebase from '../../constants/firebase'
import { generateRandomString } from '../../functions/utils'

import { getAllMyPlaylistsFromSpotify, getMyPlaylists, getMyPlaylist } from './spotifyActions'

const api = ky.create({prefixUrl: process.env.NODE_ENV === 'production' ? 'https://us-central1-splitsbyspotify.cloudfunctions.net/api/' : 'http://localhost:5001/splitsbyspotify/us-central1/api/'});

export const login = (location, history) => async (dispatch) => {

    // your application requests refresh and access tokens
    // after checking the state parameter
    if (!location) {
        return { error: 'No Location Submitted'}
    }
    let FBIDToken, FBUser;
    let code = getUrlParameters(location.search, 'code')

    const searchParams = new URLSearchParams();
    searchParams.set('code', code)
    searchParams.set('redirect_uri', `${window.location.origin}/spotifyCallback`)
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
            console.log('spotifyAccessToken', spotifyAccessToken)
            let spotifyResponse = await ky.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': spotifyAccessToken
                }
            }).json()
            dispatch({
                type: SET_USER,
                payload: {
                    spotifyUser: spotifyResponse
                }
            })
            console.log('spotifyResponse', spotifyResponse)
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
            let firebaseResponse = await api.post('spotifyLogin', {
                body: body
            }).json()
            FBIDToken = firebaseResponse.token
            localStorage.FBIDToken = FBIDToken
            FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
            dispatch({
                type: CLEAR_ERRORS
            })
            dispatch({
                type: SET_USER,
                payload: {
                    spotifyAccessToken: access_token,
                    spotifyRefreshToken: refresh_token,
                    FBIDToken
                }
            })
            dispatch(getUserData(access_token, FBIDToken))
            window.history.replaceState({}, 'Logged in successfully', '/')
            window.history.pushState({}, 'Logged in successfully', localStorage.loggedInPage ? localStorage.loggedInPage : '/')

        } else {

            dispatch({
                type: SET_ERRORS,
                payload: {error: 'No access token received from Spotify'},
                loading: false
            })
        }
  }catch (spotifyTokenErrorResponse) {
      console.log('spotifyTokenErrorResponse', spotifyTokenErrorResponse)
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
    console.log('logging out user')
    localStorage.removeItem('spotifyAccessToken');
    localStorage.removeItem('spotifyRefreshToken');
    localStorage.removeItem('FBIDToken');
    dispatch({ type: CLEAR_PLAYLISTS })
    dispatch({ type: SET_UNAUTHENTICATED })
    dispatch({ type: STOP_LOADING_UI})
}

export const handleSpotifyLogin = () => {
    let state = generateRandomString(16)
    let stateKey = 'spotify_auth_state'
    localStorage[stateKey] = state
    let currentOrigin = window.location.origin
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyConfig.client_id}&scope=${spotifyConfig.scope}&redirect_uri=${currentOrigin}/spotifyCallback&state=${state}`
  }

export const refreshTokens = (spotifyRefreshToken) => async (dispatch) => {
    dispatch({ type: LOADING_USER})
    dispatch({ type: LOADING_PLAYLISTS_MY})
    dispatch({ type: LOADING_PLAYLISTS_MY_FROM_SPOTIFY})
    let FBIDToken = localStorage.FBIDToken
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
    try {
        let spotifyTokenResponse = await ky.post('https://accounts.spotify.com/api/token', authOptions).json()
        const { access_token, refresh_token, error} = spotifyTokenResponse;
            localStorage.spotifyAccessToken = access_token;

        if (access_token) {
            try {
              let spotifyResponse = await ky.get('https://api.spotify.com/v1/me',{
                  headers: {
                      'Authorization': 'Bearer ' + access_token
                  }
              }).json()
              dispatch({
                  type: SET_USER,
                  payload: {
                      spotifyUser: spotifyResponse
                  }
              })
              const spotifyID = spotifyResponse.id,
                display_name = spotifyResponse.display_name,
                photoURL = spotifyResponse.images && spotifyResponse.images.length > 0 ? spotifyResponse.images[0].url : '',
                email = spotifyResponse.email,
                accessToken = access_token;
              try {
                let body = new URLSearchParams()
                body.set('spotifyID', spotifyID)
                body.set('display_name', display_name)
                body.set('photoURL', photoURL)
                body.set('email', email)
                body.set('accessToken', accessToken)
                let firebaseResponse = await api.post('spotifyLogin', {
                  body: body
                }).json()
                FBIDToken = firebaseResponse.token
                try {
                  let FBUser = await firebase.auth().signInWithCustomToken(FBIDToken)
                  FBIDToken = await firebase.auth().currentUser.getIdToken()
                  localStorage.FBIDToken = FBIDToken
                  dispatch(getUserData(access_token, FBIDToken))
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

export const editUserDetails = (userDetails) => async (dispatch) => {
    console.log('222 calling loadingUser')
    dispatch({ type: LOADING_USER })
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        localStorage.FBIDToken = FBIDToken

        let editUserResponse = await api.post('user', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(userDetails)
        }).json()
        dispatch(getUserData(null, FBIDToken))
    } catch(editUserDetailsError) {
        console.log('editUserDetailsError', editUserDetailsError)
    }
}

export const markNotificationsRead = (notificationIds) => async (dispatch) => {
    console.log('notificationIds', notificationIds)
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let notificationsResponse = await api.post('notifications', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
            body: JSON.stringify(notificationIds)
        })
        console.log('notificationsResponse', notificationsResponse)
        dispatch({
            type: MARK_NOTIFICATIONS_READ
        })
    } catch (markNotificationsReadError) {
        console.log('markNotificationsReadError', markNotificationsReadError)
    }
}

export const uploadImage = (formData) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        dispatch({ type: LOADING_USER })
        let uploadImageResponse = await api.post('user/image', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
            body: formData
        })
        console.log('uploadImageResponse', uploadImageResponse)
        dispatch(getUserData())
    } catch (uploadImageError) {
        console.log('uploadImageError', uploadImageError)
        dispatch({ type: SET_USER })
    }
}

export const setTourCompleted = () => (dispatch) => {
    localStorage.tourCompleted = true
    dispatch({
        type: SET_TOUR_COMPLETED
    })
}

export const getUserData = (accessToken, IDToken) => async (dispatch) => {
    
    //dispatch({ type: LOADING_USER })
    const spotifyAccessToken = accessToken ? accessToken : localStorage.spotifyAccessToken
    const FBIDToken = IDToken ? IDToken : localStorage.FBIDToken

    try {
        let spotifyUser = await ky.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`
            }
        }).json()
        let FBUser = await api.get('user', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        dispatch({
            type: SET_USER,
            payload: {
                spotifyUser,
                FBUser,
                spotifyAccessToken,
                loading: false
            }
        })
        dispatch(getAllMyPlaylistsFromSpotify(spotifyAccessToken))
        let firebasePlaylistId;
        if (window.location.pathname.indexOf('/playlist') > -1 && window.location.pathname.split('/').length > 2) {
            firebasePlaylistId = window.location.pathname.split('/')[2]
            dispatch(getMyPlaylist(firebasePlaylistId))
        }
        dispatch(getMyPlaylists(FBIDToken))

    } catch (getUserDataError) {
        console.log('getUserDataError', getUserDataError)

    }
}