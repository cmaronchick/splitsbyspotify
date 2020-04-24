import { SET_USER, 
    LOADING_USER, 
    UPDATE_TOKENS,
    SET_ERRORS, 
    CLEAR_ERRORS, 
    LOADING_UI, 
    SET_AUTHENTICATED, 
    SET_UNAUTHENTICATED,
    SET_TOUR_COMPLETED,
    LIKE_PLAYLIST,
    UNLIKE_PLAYLIST,
    FOLLOW_PLAYLIST,
    UNFOLLOW_PLAYLIST,
    MARK_NOTIFICATIONS_READ } from '../types'

const initialState = {
    authenticated: false,
    tourCompleted: false,
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
                tourCompleted: true,
                loading: true,
                authenticated: true
            }
        case SET_UNAUTHENTICATED:
            return {
                ...initialState,
                loading: false,
            }
        case SET_TOUR_COMPLETED:
            return {
                ...state,
                tourCompleted: true
            }
        case SET_USER:
            return {
                ...state,
                ...action.payload,
                authenticated: true,
                tourCompleted: true,
                loading: false
            }
        case UPDATE_TOKENS:
            return {
                ...state,
                ...action.payload,
                authenticated: true,
                tourCompleted: true,
                loading: false
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
                    firebasePlaylistId: action.payload.firebasePlaylistId
                }
            ]
            return {
                ...state,
                FBUser: LikePlaylistFBUser
            }
        case UNLIKE_PLAYLIST:
            let UnlikePlaylistFBUser = {...state.FBUser}
            UnlikePlaylistFBUser.likes = state.FBUser.likes.filter(
                (like) => like.firebasePlaylistId !== action.payload.firebasePlaylistId
            )
            return {
                ...state,
                FBUser: UnlikePlaylistFBUser
            }

        case FOLLOW_PLAYLIST:
            let FollowedPlaylistFBUser = {...state.FBUser}
            let FollowedPlaylists = state.FBUser.credentials.followedPlaylists ? {...state.FBUser.credentials.followedPlaylists} : {}
            FollowedPlaylists[action.payload.playlist.firebasePlaylistId] = {...action.payload.playlist}
            FollowedPlaylistFBUser.credentials.followedPlaylists = FollowedPlaylists
            return {
                ...state,
                FBUser: FollowedPlaylistFBUser
            }
        case UNFOLLOW_PLAYLIST:
            let UnfollowedPlaylistFBUser = {...state.FBUser}
            let UnfollowedPlaylists = state.FBUser.credentials.followedPlaylists ? {...state.FBUser.credentials.followedPlaylists} : {}
            delete UnfollowedPlaylists[action.payload.playlist.firebasePlaylistId]
            UnfollowedPlaylistFBUser.credentials.followedPlaylists = UnfollowedPlaylists
            return {
                ...state,
                FBUser: UnfollowedPlaylistFBUser
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