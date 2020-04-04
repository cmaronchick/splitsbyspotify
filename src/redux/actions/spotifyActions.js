import { 
    SET_PLAYLISTS_ALL, 
    SET_PLAYLISTS_MY, 
    SET_PLAYLISTS_MY_FROM_SPOTIFY, 
    SET_PLAYLIST,
    UPDATE_PLAYLIST_FROM_SPOTIFY, 
    UPDATE_SINGLE_PLAYLIST_FROM_SPOTIFY, 
    CONFIRM_REMOVE_FROM_MY_PLAYLISTS,
    CANCEL_REMOVE_FROM_MY_PLAYLISTS,
    ADD_TO_MY_PLAYLISTS,
    REMOVE_FROM_MY_PLAYLISTS,
    LOADING_PLAYLISTS_ALL, 
    LOADING_PLAYLISTS_MY, 
    LIKE_PLAYLIST, 
    UNLIKE_PLAYLIST, 
    COMMENT_ON_PLAYLIST,
    DELETE_COMMENT_ON_PLAYLIST,
    LOADING_PLAYLISTS_MY_FROM_SPOTIFY, 
    SET_ERRORS,
    CLEAR_ERRORS,
    LOADING_PLAYLIST} from '../types'
import ky from 'ky/umd'
import firebase from '../../constants/firebase'
import store from '../store'

const api = ky.create({prefixUrl: process.env.NODE_ENV === 'production' ? 'https://us-central1-splitsbyspotify.cloudfunctions.net/api/' : 'http://localhost:5001/splitsbyspotify/us-central1/api/'});

// GET ALL PLAYLISTS

export const getAllPlaylists = () => async (dispatch) => {
    dispatch({ type: LOADING_PLAYLISTS_ALL })
    try {
        let getPlaylistsResponse = await api.get('playlists').json()
        console.log('getPlaylistsResponse', getPlaylistsResponse)
        let allPlaylists = {}
        getPlaylistsResponse.forEach(playlist => {
            allPlaylists[playlist.id] = playlist
        })
        dispatch({
            type: SET_PLAYLISTS_ALL,
            payload: {
                allPlaylists,
                allPlaylistsLoading: false
            }
        })
    }catch (getPlaylistsResponseError) {
        console.log('getPlaylistsResponseError', getPlaylistsResponseError)
        dispatch({
            type: SET_PLAYLISTS_ALL,
            payload: {
                allPlaylists: {},
                allPlaylistsLoading: false
            }
        })
    }
}

// GET ALL MY PLAYLISTS FROM SPOTIFY
export const getAllMyPlaylistsFromSpotify = (access_token) => async (dispatch) => {
    try {
        let allMyPlaylistsResponse = await ky.get('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }).json()
        
            console.log('allMyPlaylistsResponse', allMyPlaylistsResponse)
            let myPlaylistsFromSpotify = {}
            allMyPlaylistsResponse.items.forEach(playlist => {
                myPlaylistsFromSpotify[playlist.id] = playlist
            })

            dispatch({
                type: SET_PLAYLISTS_MY_FROM_SPOTIFY,
                payload: {
                    myPlaylistsFromSpotify,
                    myPlaylistsFromSpotifyLoading: false
                }
            })
        } catch(getUserPlaylistsErrorResponse) {
            console.trace()
            console.log('getUserPlaylistsErrorResponse', getUserPlaylistsErrorResponse)
            // let getUserPlaylistsError = await getUserPlaylistsErrorResponse.json()
            // console.log({ getUserPlaylistsError })
            return { error: getUserPlaylistsErrorResponse }
        }
}

export const getPlaylistsFromSpotify = (spotifyAccessToken, playlists) => async (dispatch) => {
  try {
    Object.keys(playlists).forEach(async (id) => {
        let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlists[id].spotifyPlaylistId}`, {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`
        }
        }).json()
        spotifyPlaylistResponse.FBId = id
        spotifyPlaylistResponse.inMyPlaylists = true
        dispatch({
            type: UPDATE_PLAYLIST_FROM_SPOTIFY,
            payload: {
                playlist: spotifyPlaylistResponse
            }
        })
    })
  } catch (getPlaylistFromSpotifyError) {
    console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    throw new Error(JSON.stringify(getPlaylistFromSpotifyError))
  }
}

export const getSinglePlaylistFromSpotify = (spotifyAccessToken, playlistId) => async (dispatch) => {
  try {
    let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
        Authorization: `Bearer ${spotifyAccessToken}`
    }
    }).json()
    dispatch({
        type: UPDATE_SINGLE_PLAYLIST_FROM_SPOTIFY,
        payload: spotifyPlaylistResponse
    })
  } catch (getPlaylistFromSpotifyError) {
    console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    
  }
}

// GET MY PLAYLISTS

export const getMyPlaylists = (FBIDToken) => async (dispatch) => {
    dispatch({ type: LOADING_PLAYLISTS_MY })
    try {
        //let FBIDToken = firebase.auth().currentUser.getIdToken()
        let getPlaylistsResponse = await api.get('playlists/my', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        let myPlaylists = {}
        getPlaylistsResponse.forEach(playlist => {
            myPlaylists[playlist.id] = {...playlist}
            myPlaylists[playlist.id].inMyPlaylists = true
        })
        dispatch({
            type: SET_PLAYLISTS_MY,
            payload: {
                myPlaylists,
                myPlaylistsLoading: false
            }
        })
        dispatch(getPlaylistsFromSpotify(store.getState().user.spotifyAccessToken,myPlaylists))
    }catch (getPlaylistsResponseError) {
        console.log('getPlaylistsResponseError', getPlaylistsResponseError)
        dispatch({
            type: SET_PLAYLISTS_MY,
            payload: {
                myPlaylists: {},
                myPlaylistsLoading: false
            }
        })
    }
}

// GET SINGLE PLAYLISTS

export const getMyPlaylist = (FBId) => async (dispatch) => {
    dispatch({ type: LOADING_PLAYLIST })
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let getPlaylistResponse = await api.get(`playlists/${FBId}`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        console.log('store.getState().user.spotifyAccessToken', store.getState().user.spotifyAccessToken)
        let playlist = {...getPlaylistResponse.playlistData}
        console.log('playlist', playlist)
        let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlist.spotifyPlaylistId}`, {
            headers: {
                Authorization: `Bearer ${store.getState().user.spotifyAccessToken}`
            }
            }).json()
        playlist = {
            ...playlist,
            ...spotifyPlaylistResponse
        }
        dispatch({
            type: SET_PLAYLIST,
            payload: playlist
        })
    }catch (getPlaylistsResponseError) {
        console.log('getPlaylistsResponseError', getPlaylistsResponseError)
        dispatch({
            type: SET_PLAYLIST,
            payload: {}
        })
    }
}

export const addToMyPlaylists = (playlist) => async (dispatch) => {
  console.log('playlist', playlist)
  const {id, name, collaborative} = playlist
  const publicPlaylist = playlist.public
  const searchParams = new URLSearchParams()
  searchParams.set('spotifyPlaylistId', id)
  searchParams.set('playlistName', name)
  searchParams.set('playlistImage', playlist.images[0].url)
  searchParams.set('public', publicPlaylist)
  searchParams.set('collaborative', collaborative)
  try {
    let FBIDToken = await firebase.auth().currentUser.getIdToken()
    console.log('FBUser', FBIDToken)
    let addPlaylistResponse = await api.post('playlists', {
      headers: {
        Authorization: `Bearer ${FBIDToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams
    }).json()
    console.log('addPlaylistResponse', addPlaylistResponse)
    dispatch({
        type: ADD_TO_MY_PLAYLISTS,
        payload: {
            ...playlist,
            ...addPlaylistResponse.playlist
        }
    })
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

export const removeFromMyPlaylists = (playlistId, FBId) => async (dispatch) => {
  try {
    let FBIDToken = await firebase.auth().currentUser.getIdToken()
    console.log('FBIDToken', FBIDToken)
    let removePlaylistResponse = await api.delete(`playlists/${FBId}`, {
      headers: {
        Authorization: `Bearer ${FBIDToken}`
      }
    }).json()
    console.log('removePlaylistResponse', removePlaylistResponse)
    dispatch({
        type: REMOVE_FROM_MY_PLAYLISTS,
        payload: {
            playlistId,
            FBId,
            FBIDToken
        }
    })
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

export const confirmRemoveFromMyPlaylists = (playlistId, FBId, playlistName) => (dispatch) => {
    dispatch({
        type: CONFIRM_REMOVE_FROM_MY_PLAYLISTS,
        payload: {
            playlistId,
            FBId,
            playlistName
        }
    })
}
export const cancelRemoveFromMyPlaylists = () => (dispatch) => {
    dispatch({
        type: CANCEL_REMOVE_FROM_MY_PLAYLISTS
    })
}

// Like a playlist

export const likePlaylist = (playlistId) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let FBUser = await ky.get('/user', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        console.log('FBUser', FBUser)
        let likeResponse = await api.post(`playlists/${playlistId}/like`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        dispatch({
            type: LIKE_PLAYLIST,
            payload: likeResponse
        })
    } catch (likePlaylistError) {
        console.log('likePlaylistError', likePlaylistError)
    }
}

// Unlike a playlist

export const unlikePlaylist = (playlistId) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let unlikeResponse = await api.delete(`playlists/${playlistId}/like`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        dispatch({
            type: UNLIKE_PLAYLIST,
            payload: unlikeResponse
        })
    } catch (unlikePlaylistError) {
        console.log('likePlaylistError', unlikePlaylistError)
    }
}

export const commentOnPlaylist = (FBId, commentBody) => async (dispatch) => {
    console.log('commentBody', commentBody)
    console.log('FBId', FBId)
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        const searchParams = new URLSearchParams()
        searchParams.set('body', commentBody)
        let postCommentResponse = await api.post(`playlists/${FBId}/comment`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
          body: JSON.stringify({body: commentBody})
        }).json()
        console.log('postCommentResponse', postCommentResponse)
        dispatch({
            type: COMMENT_ON_PLAYLIST,
            payload: postCommentResponse.comment
        })
        dispatch(clearErrors())
    } catch (postCommentError) {
        console.log('postCommentError', postCommentError)
        try {
            let postCommentErrorsJSON = await postCommentError.response.json()
            console.log('postCommentErrorsJSON', postCommentErrorsJSON)
            dispatch({
                type: SET_ERRORS,
                payload: postCommentErrorsJSON
            })
        } catch (postCommentErrors) {
            console.log('postCommentErrors', postCommentErrors)
            dispatch({
                type: SET_ERRORS,
                payload: postCommentErrors
            })
        }
    }
}


export const clearErrors = () => (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}