import { SET_USER, 
    LOADING_USER, 
    UPDATE_TOKENS,
    LOADING_OTHER_USER,
    SET_OTHER_USER,
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
    MARK_NOTIFICATIONS_READ,
    SAVE_SPLITS,
    DELETE_SPLITS } from '../types'

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
        case LOADING_OTHER_USER:
            return {
                ...state,
                loadingOtherUser: true
            }
        case SET_OTHER_USER:
            return {
                ...state,
                profile: {
                    ...action.payload
                },
                loading: false
            }
        case SAVE_SPLITS:
            let splitsFBUser = {...state.FBUser}
            splitsFBUser.splits[action.payload.firebasePlaylistId] = {
                ...action.payload
            }
            return {
                ...state,
                FBUser: splitsFBUser
            }
        case DELETE_SPLITS:
            let deleteSplitsFBUser = {...state.FBUser}
            delete deleteSplitsFBUser.splits[action.payload.firebasePlaylistId]
            return {
                ...state,
                FBUser: deleteSplitsFBUser
            }
        default: 
            return {
                ...state
            }
    }
}