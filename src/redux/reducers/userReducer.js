import { SET_USER, 
    LOADING_USER, 
    SET_ERRORS, 
    CLEAR_ERRORS, 
    LOADING_UI, 
    SET_AUTHENTICATED, 
    SET_UNAUTHENTICATED,
    LIKE_PLAYLIST,
    UNLIKE_PLAYLIST,
    MARK_NOTIFICATIONS_READ } from '../types'

const initialState = {
    authenticated: false,
    FBUser: {
        credentials: {},
        likes: [],
        notifications: []
    },
    spotifyUser: {},
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_AUTHENTICATED:
            return {
                ...state,
                loading: true,
                authenticated: true
            }
        case SET_UNAUTHENTICATED:
            return {
                ...initialState,
                loading: false,
            }
        case SET_USER:
            return {
                authenticated: true,
                loading: false,
                ...state,
                ...action.payload
            }
        case LOADING_USER:
            return {
                ...state,
                loading: true
            }
        case LIKE_PLAYLIST:
            let LikePlaylistFBUser = {...state.FBUser}
            LikePlaylistFBUser.likes = [
                ...state.FBUser.likes,
                {
                    spotifyUser: state.FBUser.credentials.spotifyUser,
                    playlistId: action.payload.playlistId
                }
            ]
            return {
                ...state,
                FBUser: LikePlaylistFBUser
            }
        case UNLIKE_PLAYLIST:
            let UnlikePlaylistFBUser = {...state.FBUser}
            UnlikePlaylistFBUser.likes = state.FBUser.likes.filter(
                (like) => like.playlistId !== action.payload.playlistId
            )
            return {
                ...state,
                FBUser: UnlikePlaylistFBUser
            }
        case MARK_NOTIFICATIONS_READ: 
            let FBUser = {...state.FBUser}
            FBUser.notifications.forEach(notification => notification.read = true);
            return {
                ...state,
                FBUser
            }

        default: 
            return {
                ...state
            }
    }
}