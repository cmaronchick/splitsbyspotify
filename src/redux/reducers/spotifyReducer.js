import { 
    SET_PLAYLISTS_ALL, 
    SET_PLAYLISTS_MY, 
    SET_PLAYLISTS_MY_FROM_SPOTIFY, 
    SET_PLAYLIST,
    UPDATE_PLAYLIST_FROM_SPOTIFY,
    ADD_TO_MY_PLAYLISTS,
    REMOVE_FROM_MY_PLAYLISTS,
    CONFIRM_REMOVE_FROM_MY_PLAYLISTS,
    CANCEL_REMOVE_FROM_MY_PLAYLISTS,
    CLEAR_PLAYLISTS,
    COMMENT_ON_PLAYLIST,
    DELETE_COMMENT_ON_PLAYLIST,
    LOADING_PLAYLISTS_ALL, 
    LOADING_PLAYLISTS_MY,
    LOADING_PLAYLISTS_MY_FROM_SPOTIFY, 
    LOADING_PLAYLIST, 
    LIKE_PLAYLIST, 
    UNLIKE_PLAYLIST,
    SET_ERRORS,
    CLEAR_ERRORS } from '../types'

const initialState = {
    allPlaylists: {},
    myPlaylists: {},
    myPlaylistsFromSpotify: {},
    playlist: {
        comments: []
    },
    showConfirmRemoveDialog: false,
    allPlaylistsLoading: false,
    myPlaylistsLoading: false,
    myPlaylistsFromSpotifyLoading: false,
    playlistLoading: false
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_PLAYLISTS_ALL:
            return {
                ...state,
                ...action.payload,
                allPlaylistsLoading: false
            }
        case SET_PLAYLISTS_MY:
            let myPlaylistsFromSpotify = {...state.myPlaylistsFromSpotify}
            Object.keys(action.payload.myPlaylists).forEach(FBId => {
                if (myPlaylistsFromSpotify[action.payload.myPlaylists[FBId].playlistId]) {
                    myPlaylistsFromSpotify[action.payload.myPlaylists[FBId].playlistId] = {
                        ...myPlaylistsFromSpotify[action.payload.myPlaylists[FBId].playlistId],
                        FBId: FBId,
                        inMyPlaylists: true
                    }
                }
            })

            return {
                ...state,
                ...action.payload,
                myPlaylistsFromSpotify,
                myPlaylistsLoading: false,
            }
        case SET_PLAYLISTS_MY_FROM_SPOTIFY:
            return {
                ...state,
                ...action.payload,
                myPlaylistsFromSpotifyLoading: false,
            }
        case SET_PLAYLIST:
            console.log('action.payload', action.payload)
            return {
                ...state,
                playlist: action.payload,
                playlistLoading: false
            }
        case UPDATE_PLAYLIST_FROM_SPOTIFY:
            let newPlaylists = {...state.myPlaylists}
            newPlaylists[action.payload.playlist.FBId] = {
                ...newPlaylists[action.payload.playlist.FBId],
                ...action.payload.playlist}
            return {
                ...state,
                myPlaylists: newPlaylists,
                myPlaylistsFromSpotifyLoading: false
            }
        case LOADING_PLAYLISTS_ALL:
            return {
                ...state,
                allPlaylistsLoading: true
            }
        case LOADING_PLAYLISTS_MY:
            return {
                ...state,
                myPlaylistsLoading: true
            }
        case LOADING_PLAYLISTS_MY_FROM_SPOTIFY:
            return {
                ...state,
                myPlaylistsFromSpotifyLoading: true
            }
        case LOADING_PLAYLIST:
            return {
                ...state,
                playlistLoading: true
            }
        case ADD_TO_MY_PLAYLISTS:
            console.log('action.payload', action.payload)
            let addToMyPlaylists = {...state.myPlaylists}
            let addToAllPlaylists = {...state.allPlaylists}
            let addToAllMySpotifyPlaylists = {...state.myPlaylistsFromSpotify}
            addToMyPlaylists[action.payload.playlistId] = {...action.payload, inMyPlaylists: true}
            addToAllMySpotifyPlaylists[action.payload.id].inMyPlaylists = true
            return {
                ...state,
                myPlaylists: addToMyPlaylists
            }
        case REMOVE_FROM_MY_PLAYLISTS:
            let removeFromMyPlaylists = {...state.myPlaylists}
            let removeFromAllPlaylists = {...state.allPlaylists}
            let removeFromAllMySpotifyPlaylists = {...state.myPlaylistsFromSpotify}
            delete removeFromMyPlaylists[action.payload.FBId]   
            removeFromAllMySpotifyPlaylists[action.payload.playlistId].inMyPlaylists = false
            return {
                ...state,
                showConfirmRemoveDialog: false,
                removePlaylistId: null,
                removePlaylistFBId: null,
                removePlaylistName: '',
                myPlaylists: removeFromMyPlaylists,
                allPlaylists: removeFromAllPlaylists,
                myPlaylistsFromSpotify: removeFromAllMySpotifyPlaylists
            }
        case CONFIRM_REMOVE_FROM_MY_PLAYLISTS:
            console.log('action.payload', action.payload)
            return {
                ...state,
                removePlaylistId: action.payload.playlistId,
                removePlaylistFBId: action.payload.FBId,
                removePlaylistName: action.payload.playlistName,
                showConfirmRemoveDialog: true,

            }
        case CANCEL_REMOVE_FROM_MY_PLAYLISTS:
            return {
                ...state,
                removePlaylistId: null,
                removePlaylistFBId: null,
                removePlaylistName: null,
                showConfirmRemoveDialog: false
            }
        case LIKE_PLAYLIST:
        case UNLIKE_PLAYLIST:
            let likeAllPlaylists = {...state.allPlaylists}
            let likeMyPlaylists = {...state.myPlaylists}
            let likeMySpotifyPlaylists = {...state.myPlaylistsFromSpotify}
            likeAllPlaylists[action.payload.playlistId] = {
                ...likeAllPlaylists[action.payload.playlistId],
                ...action.payload
            }
            likeMyPlaylists[action.payload.playlistId] = {
                ...likeMyPlaylists[action.payload.playlistId],
                ...action.payload
            }
            // Object.keys(likeMySpotifyPlaylists).forEach(playlistId => {
            //     if (playlistId === action.payload)
            // })
            return {
                ...state,
                allPlaylists: likeAllPlaylists,
                myPlaylists: likeMyPlaylists
            }
        case COMMENT_ON_PLAYLIST:
            let myPlaylists = {...state.myPlaylists}
            myPlaylists[action.payload.playlistId].comments ? myPlaylists[action.payload.playlistId].comments.push({...action.payload}) : myPlaylists[action.payload.playlistId].comments = [action.payload]
            myPlaylists[action.payload.playlistId].commentCount++;
            let playlist = {...state.playlist}
            playlist.comments = myPlaylists[action.payload.playlistId].comments
            playlist.commentCount++;
            return {
                ...state,
                myPlaylists,
                playlist
            }
        case DELETE_COMMENT_ON_PLAYLIST:
            return {
                ...state
            }
        case CLEAR_PLAYLISTS:
            return initialState
        default: 
            return {
                ...state
            }
    }
}