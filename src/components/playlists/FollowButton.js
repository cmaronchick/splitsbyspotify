import React from 'react'
import PropTypes from 'prop-types'

import PlaylistAdd from '@material-ui/icons/PlaylistAdd'
import PlaylistAddChecked from '@material-ui/icons/PlaylistAddCheck'

import MyButton from '../../util/MyButton'
const FollowPlaylistButton = (props) => {
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin();
    }
    return !props.user.authenticated ? (
            <MyButton tip="Log in to Follow on Spotify" onClick={handleSpotifyLogin}>
                <PlaylistAdd />    
            </MyButton>
        ) : props.user.FBUser ? props.playlist.following ? (
            <MyButton tip="Unfollow this Playlist on Spotify" onClick={props.handleUnfollowPlaylistOnSpotify}>
                <PlaylistAddChecked />
            </MyButton>
        ) : (
            <MyButton tip="Follow this Playlist on Spotify" onClick={props.handleFollowPlaylistOnSpotify}>
                <PlaylistAdd />    
            </MyButton>
        ) : (
            <div>Loading User</div>
        )
    }

FollowPlaylistButton.propTypes = {
    FBUser: PropTypes.object,
    user: PropTypes.object.isRequired,
    playlist: PropTypes.object.isRequired
}

export default FollowPlaylistButton