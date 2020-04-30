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
    GET_PLAYLIST_AUDIO_FEATURES,
    FOLLOW_PLAYLIST,
    UNFOLLOW_PLAYLIST,
    LOADING_PLAYLISTS_ALL, 
    LOADING_PLAYLISTS_MY, 
    LIKE_PLAYLIST, 
    UNLIKE_PLAYLIST, 
    COMMENT_ON_PLAYLIST,
    SHOW_COMMENT_DIALOG,
    HIDE_COMMENT_DIALOG,
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
        let allPlaylists = {}
        getPlaylistsResponse.forEach(playlist => {
            allPlaylists[playlist.firebasePlaylistId] = playlist
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
        
            let myPlaylistsFromSpotify = {}
            allMyPlaylistsResponse.items.sort((a,b) => {
                return a.name > b.name ? 1 : -1
            })
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
    Object.keys(playlists).forEach(async (firebasePlaylistId) => {
        let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlists[firebasePlaylistId].spotifyPlaylistId}`, {
        headers: {
            Authorization: `Bearer ${spotifyAccessToken}`
        }
        }).json()
        spotifyPlaylistResponse.firebasePlaylistId = firebasePlaylistId
        spotifyPlaylistResponse.inMyPlaylists = true
        dispatch({
            type: UPDATE_PLAYLIST_FROM_SPOTIFY,
            payload: {
                playlist: spotifyPlaylistResponse
            }
        })
        if (playlists[firebasePlaylistId].spotifyUser === store.getState().user.spotifyUser.id) {
            console.log('playlists[firebasePlaylistId].spotifyUser === store.getState().user.spotifyUser.id', spotifyPlaylistResponse.name, playlists[firebasePlaylistId].spotifyUser, store.getState().user.spotifyUser.id)
            dispatch(updatePlaylist(spotifyPlaylistResponse))
        }
    })
  } catch (getPlaylistFromSpotifyError) {
    console.log('getPlaylistFromSpotifyError', getPlaylistFromSpotifyError)
    throw new Error(JSON.stringify(getPlaylistFromSpotifyError))
  }
}

export const updatePlaylist = (playlist) => async (dispatch) => {

    const { id, firebasePlaylistId, name, collaborative, images, avgBPM, minBPM, maxBPM, owner } = playlist
    const publicPlaylist = playlist.public
    const searchParams = new URLSearchParams()
    searchParams.set('spotifyPlaylistId', id)
    searchParams.set('playlistName', name)
    searchParams.set('playlistImage', images[0].url)
    searchParams.set('public', publicPlaylist)
    searchParams.set('collaborative', collaborative)
    if (avgBPM) {
        searchParams.set('avgBPM', avgBPM)
        searchParams.set('minBPM', minBPM)
        searchParams.set('maxBPM', maxBPM)
    }
    let FBIDToken = await firebase.auth().currentUser.getIdToken()
    let updatePlaylistResponse = await api.post(`playlists/${firebasePlaylistId}`, {
    headers: {
        Authorization: `Bearer ${FBIDToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: searchParams
    }).json()

}

export const getSinglePlaylistFromSpotify = (spotifyAccessToken, spotifyPlaylistId) => async (dispatch) => {
  try {
    let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`, {
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
            myPlaylists[playlist.id].firebasePlaylistId = playlist.id
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

export const getTrackAudioFeatures = (spotifyAccessToken, playlist) => async (dispatch) => {
    console.log('playlist', playlist)
    let avgBPM = 0;
    let minBPM = 9999,
        maxBPM = 0;
    let totalBPM = 0;
    //console.log('totalBPM', totalBPM)
    try {
        const {tracks} = playlist
        let tracksIds = ''
        tracks.items.forEach((trackObj, index) => {
            tracksIds += `${index > 0 ? ',' : ''}${trackObj.track.id}`
        })
        let tracksAudioFeatures = await ky.get(`https://api.spotify.com/v1/audio-features?ids=${tracksIds}`, {
                headers: {
                    Authorization: `Bearer ${spotifyAccessToken}`
                }
            }).json()
        //   }
          
        //   const anAsyncFunction = async item => {
        //       let audioFeatures = await functionWithPromise(item)
        //       item.audioFeatures = audioFeatures
        //       minBPM = (audioFeatures.tempo < minBPM) ? audioFeatures.tempo : minBPM
        //       maxBPM = (audioFeatures.tempo > maxBPM) ? audioFeatures.tempo : maxBPM
        //       totalBPM += audioFeatures.tempo
        //       return item
        //   }
          
        //   const getData = async () => {
        //     return Promise.all(tracks.items.map(track => {
        //         return anAsyncFunction(track)
        //     }))
        //   }
        // let tracksWithAudioFeatures = await getData()
        tracks.items.map(trackObj => {
            tracksAudioFeatures.audio_features.forEach(audioFeature => {

                if (trackObj.track.id === audioFeature.id) {
                    minBPM = (audioFeature.tempo < minBPM) ? audioFeature.tempo : minBPM
                    maxBPM = (audioFeature.tempo > maxBPM) ? audioFeature.tempo : maxBPM
                    totalBPM += audioFeature.tempo
                    trackObj.audioFeatures = audioFeature
                    return trackObj
                }
            })
        })
        const updatedPlaylist = {
            ...playlist,
            avgBPM: totalBPM / tracks.items.length,
            minBPM,
            maxBPM,
            tracks
        }
        dispatch({
            type: GET_PLAYLIST_AUDIO_FEATURES,
            payload: {
                playlist: updatedPlaylist
            }
        })

        if (playlist.spotifyUser === store.getState().user.spotifyUser.id) {
            dispatch(updatePlaylist(updatedPlaylist))
        }
    } catch (getAudioFeaturesError) {
        if (getAudioFeaturesError.response) {
            const getAudioFeaturesErrorJSON = await getAudioFeaturesError.response.json()
            console.log('getAudioFeaturesErrorJSON', getAudioFeaturesErrorJSON)
        }
        console.log('getAudioFeaturesError', getAudioFeaturesError)
    }
}

// GET SINGLE PLAYLISTS

export const getMyPlaylist = (firebasePlaylistId) => async (dispatch) => {
    dispatch({ type: LOADING_PLAYLIST, payload: firebasePlaylistId })
    try {
        let FBUser = await firebase.auth().currentUser
        // let FBIDToken = await firebase.auth().currentUser.getIdToken()
        // let getPlaylistResponse = await api.get(`playlists/${firebasePlaylistId}`, {
        //         headers: {
        //             Authorization: `Bearer ${FBIDToken}`
        //         }
        //     }).json()
        let getPlaylistResponse = await api.get(`playlists/${firebasePlaylistId}`).json()
        // console.log('store.getState().user.spotifyAccessToken', store.getState().user.spotifyAccessToken)
        let playlist = {...getPlaylistResponse.playlistData}
        console.log('playlist', playlist)

        /*check to see if user has access to the playlist
        Playlist must be public or must belong to the user
        */
        if (playlist.public !== 'true' && (!FBUser || store.getState().user.FBUser.credentials.spotifyUser !== playlist.spotifyUser)) {
            dispatch({
                type: SET_PLAYLIST,
                payload: playlist
            })
            return;
        }
        let spotifyPlaylistResponse = await ky.get(`https://api.spotify.com/v1/playlists/${playlist.spotifyPlaylistId}`, {
            headers: {
                Authorization: `Bearer ${store.getState().user.spotifyAccessToken}`
            }
        }).json()
        spotifyPlaylistResponse.firebasePlaylistId = firebasePlaylistId
        playlist = {
            ...playlist,
            ...spotifyPlaylistResponse
        }
        firebase.analytics().logEvent('getPlaylist', { firebasePlaylistId })
        dispatch({
            type: SET_PLAYLIST,
            payload: playlist
        })

        dispatch(getTrackAudioFeatures(store.getState().user.spotifyAccessToken, playlist))

    }catch (getPlaylistsResponseError) {
        console.log('getPlaylistsResponseError', getPlaylistsResponseError.response ? await getPlaylistsResponseError.response.json() : getPlaylistsResponseError)
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

export const removeFromMyPlaylists = (spotifyPlaylistId, firebasePlaylistId) => async (dispatch) => {
  try {
    let FBIDToken = await firebase.auth().currentUser.getIdToken()
    console.log('FBIDToken', FBIDToken)
    let removePlaylistResponse = await api.delete(`playlists/${firebasePlaylistId}`, {
      headers: {
        Authorization: `Bearer ${FBIDToken}`
      }
    }).json()
    console.log('removePlaylistResponse', removePlaylistResponse)
    dispatch({
        type: REMOVE_FROM_MY_PLAYLISTS,
        payload: {
            spotifyPlaylistId,
            firebasePlaylistId,
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

export const confirmRemoveFromMyPlaylists = (spotifyPlaylistId, firebasePlaylistId, playlistName) => (dispatch) => {
    console.log('{object}', {spotifyPlaylistId, firebasePlaylistId, playlistName})
    dispatch({
        type: CONFIRM_REMOVE_FROM_MY_PLAYLISTS,
        payload: {
            spotifyPlaylistId,
            firebasePlaylistId,
            playlistName
        }
    })
}
export const cancelRemoveFromMyPlaylists = () => (dispatch) => {
    dispatch({
        type: CANCEL_REMOVE_FROM_MY_PLAYLISTS
    })
}

export const followPlaylist = (FBUser, playlist) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let followResponse = await api.post(`playlists/${playlist.firebasePlaylistId}/follow`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
            body: JSON.stringify({body: playlist})
        }).json()
        dispatch({
            type: FOLLOW_PLAYLIST,
            payload: {
                FBUser,
                playlist
            }
        })
    } catch (followError) {
        console.log('followError', followError)
        dispatch({
            type: SET_ERRORS,
            errors: followError
        })
    }
}
export const unfollowPlaylist = (FBUser, playlist) => async (dispatch) => {
    console.log('playlist', playlist)
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let unfollowResponse = await api.delete(`playlists/${playlist.firebasePlaylistId}/follow`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
            body: JSON.stringify({body: playlist})
        }).json()
        dispatch({
            type: UNFOLLOW_PLAYLIST,
            payload: {
                FBUser,
                playlist,
            }
        })
    } catch (followError) {
        console.log('followError', followError)
        dispatch({
            type: SET_ERRORS,
            errors: followError
        })
    }
}

// Like a playlist

export const likePlaylist = (firebasePlaylistId) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let FBUser = await ky.get('/user', {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            }
        }).json()
        console.log('FBUser', FBUser)
        let likeResponse = await api.post(`playlists/${firebasePlaylistId}/like`, {
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

export const unlikePlaylist = (firebasePlaylistId) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        let unlikeResponse = await api.delete(`playlists/${firebasePlaylistId}/like`, {
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

export const commentOnPlaylist = (firebasePlaylistId, commentBody) => async (dispatch) => {
    try {
        let FBIDToken = await firebase.auth().currentUser.getIdToken()
        const searchParams = new URLSearchParams()
        searchParams.set('body', commentBody)
        let postCommentResponse = await api.post(`playlists/${firebasePlaylistId}/comment`, {
            headers: {
                Authorization: `Bearer ${FBIDToken}`
            },
          body: JSON.stringify(commentBody)
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

export const toggleCommentsDialog = (showCommentsDialog, firebasePlaylistId) => (dispatch) => {
    dispatch({
        type: showCommentsDialog ? HIDE_COMMENT_DIALOG : SHOW_COMMENT_DIALOG
    })

    // get a playlist from the browse playlists views to load in comments
    // calls getMyPlaylist if the firebasePlaylistId exists

    if (showCommentsDialog === false && firebasePlaylistId) {
        dispatch(getMyPlaylist(firebasePlaylistId))
    }
}


export const clearErrors = () => (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}