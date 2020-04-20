import React from 'react'
import PropTypes from 'prop-types'

import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteIconBorder from '@material-ui/icons/FavoriteBorder'

import MyButton from '../../util/MyButton'
const LikeButton = (props) => {
    const likedPlaylist = () => {
        if (props.user.FBUser.likes && 
            props.user.FBUser.likes.find(
            (like) => like.firebasePlaylistId === props.playlist.firebasePlaylistId)
            ) {
            return true
        }
        return false
    }
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin();
    }
    return !props.user.authenticated ? (
            <MyButton tip="Log in to Like" onClick={handleSpotifyLogin}>
                <FavoriteIconBorder />    
            </MyButton>
        ) : props.user.FBUser ? likedPlaylist() ? (
            <MyButton tip="Unlike This playlist" onClick={props.handleUnlikePlaylist}>
                <FavoriteIcon />
            </MyButton>
        ) : (
            <MyButton tip="Like This Playlist" onClick={props.handleLikePlaylist}>
                <FavoriteIconBorder />    
            </MyButton>
        ) : (
            <div>Loading User</div>
        )
    }

LikeButton.propTypes = {
    FBUser: PropTypes.object,
    user: PropTypes.object.isRequired,
}

export default LikeButton