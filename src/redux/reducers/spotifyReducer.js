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
    FOLLOW_PLAYLIST,
    UNFOLLOW_PLAYLIST,
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
            Object.keys(action.payload.myPlaylists).forEach(firebasePlaylistId => {
                if (myPlaylistsFromSpotify[action.payload.myPlaylists[firebasePlaylistId].firebasePlaylistId]) {
                    myPlaylistsFromSpotify[action.payload.myPlaylists[firebasePlaylistId].firebasePlaylistId] = {
                        ...myPlaylistsFromSpotify[action.payload.myPlaylists[firebasePlaylistId].firebasePlaylistId],
                        firebasePlaylistId: firebasePlaylistId,
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
            newPlaylists[action.payload.playlist.firebasePlaylistId] = {
                ...newPlaylists[action.payload.playlist.firebasePlaylistId],
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
            addToMyPlaylists[action.payload.firebasePlaylistId] = {...action.payload, inMyPlaylists: true}
            addToAllMySpotifyPlaylists[action.payload.id].inMyPlaylists = true
            return {
                ...state,
                myPlaylists: addToMyPlaylists
            }
        case REMOVE_FROM_MY_PLAYLISTS:
            let removeFromMyPlaylists = {...state.myPlaylists}
            let removeFromAllPlaylists = {...state.allPlaylists}
            let removeFromAllMySpotifyPlaylists = {...state.myPlaylistsFromSpotify}
            delete removeFromMyPlaylists[action.payload.firebasePlaylistId]   
            removeFromAllMySpotifyPlaylists[action.payload.spotifyPlaylistId].inMyPlaylists = false
            return {
                ...state,
                showConfirmRemoveDialog: false,
                removePlaylistId: null,
                removeFirebasePlaylistId: null,
                removePlaylistName: '',
                myPlaylists: removeFromMyPlaylists,
                allPlaylists: removeFromAllPlaylists,
                myPlaylistsFromSpotify: removeFromAllMySpotifyPlaylists
            }
        case CONFIRM_REMOVE_FROM_MY_PLAYLISTS:
            console.log('action.payload', action.payload)
            return {
                ...state,
                removeSpotifyPlaylistId: action.payload.spotifyPlaylistId,
                removeFirebasePlaylistId: action.payload.firebasePlaylistId,
                removePlaylistName: action.payload.playlistName,
                showConfirmRemoveDialog: true,

            }
        case CANCEL_REMOVE_FROM_MY_PLAYLISTS:
            return {
                ...state,
                removeSpotifyPlaylistId: null,
                removeFirebasePlaylistId: null,
                removePlaylistName: null,
                showConfirmRemoveDialog: false
            }
        case FOLLOW_PLAYLIST:
            const followedPlaylistFBUser = action.payload.FBUser
            console.log('followedPlaylistFBUser', followedPlaylistFBUser)
            const followedPlaylist = action.payload.playlist
            let followAllPlaylists = {...state.allPlaylists}
            let followMyPlaylists = {...state.myPlaylists}
            if (followAllPlaylists[followedPlaylist.firebasePlaylistId].followers) {
                followAllPlaylists[followedPlaylist.firebasePlaylistId].followers[followedPlaylistFBUser.credentials.spotifyUser] = {
                    userImage: followedPlaylistFBUser.credentials.photoURL,
                    followedAt: new Date().toISOString()
                }
            } else {
                followAllPlaylists[followedPlaylist.firebasePlaylistId].followers = {
                    [followedPlaylistFBUser.credentials.spotifyUser]: {
                        userImage: followedPlaylistFBUser.credentials.photoURL,
                        followedAt: new Date().toISOString()
                    }
                }
            }
            followMyPlaylists[followedPlaylist.firebasePlaylistId] = {...followedPlaylist}
            return {
                ...state,
                allPlaylists: followAllPlaylists,
                myPlaylists: followMyPlaylists
            }
        case UNFOLLOW_PLAYLIST:

            const unfollowPlaylistFBUser = action.payload.FBUser
            const unfollowedPlaylist = action.payload.playlist
            let unfollowAllPlaylists = {...state.allPlaylists}
            let unfollowMyPlaylists = {...state.myPlaylists}
            console.log('unfollowPlaylistFBUser', unfollowPlaylistFBUser)
            delete unfollowAllPlaylists[unfollowedPlaylist.firebasePlaylistId].followers[unfollowPlaylistFBUser.credentials.spotifyUser]
            delete unfollowMyPlaylists[unfollowedPlaylist.firebasePlaylistId]
            return {
                ...state,
                allPlaylists: unfollowAllPlaylists,
                myPlaylists: unfollowMyPlaylists
            }
        case LIKE_PLAYLIST:
        case UNLIKE_PLAYLIST:
            let likeAllPlaylists = {...state.allPlaylists}
            let likeMyPlaylists = {...state.myPlaylists}
            let likeMySpotifyPlaylists = {...state.myPlaylistsFromSpotify}
            likeAllPlaylists[action.payload.firebasePlaylistId] = {
                ...likeAllPlaylists[action.payload.firebasePlaylistId],
                ...action.payload
            }
            likeMyPlaylists[action.payload.firebasePlaylistId] = {
                ...likeMyPlaylists[action.payload.firebasePlaylistId],
                ...action.payload
            }
            return {
                ...state,
                allPlaylists: likeAllPlaylists,
                myPlaylists: likeMyPlaylists
            }
        case COMMENT_ON_PLAYLIST:
            let myPlaylists = {...state.myPlaylists}
            myPlaylists[action.payload.firebasePlaylistId].comments ? myPlaylists[action.payload.firebasePlaylistId].comments.push({...action.payload}) : myPlaylists[action.payload.firebasePlaylistId].comments = [action.payload]
            myPlaylists[action.payload.firebasePlaylistId].commentCount++;
            let playlist = {...state.playlist}
            playlist.comments = myPlaylists[action.payload.firebasePlaylistId].comments
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