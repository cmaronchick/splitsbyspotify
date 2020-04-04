import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import withStyles from '@material-ui/core/styles/withStyles'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'

import ShareIcon from '@material-ui/icons/Share'
import CommentIcon from '@material-ui/icons/Comment'

import LikeButton from './LikeButton'
import { handleSpotifyLogin } from '../../redux/actions/userActions'

const styles = (theme) => ({
    ...theme.spreadThis
})

const PlaylistActions = props => {
    const {playlist, likeCount, commentCount, FBUser, likePlaylist, unlikePlaylist, user, handleOpenComments} = props

    const handleLikePlaylist = () => {
        props.likePlaylist(playlist.FBId)
    }
    const handleUnlikePlaylist = () => {
        props.unlikePlaylist(playlist.FBId)
    }

    const handleShowCommentsDialog = () => {
        props.handleShowCommentsDialog()
    }
    return (
        <CardActions disableSpacing>
            <LikeButton
                user={user}
                FBUser={FBUser}
                playlist={playlist}
                handleLikePlaylist={handleLikePlaylist} handleUnlikePlaylist={handleUnlikePlaylist} handleSpotifyLogin={handleSpotifyLogin} /> {likeCount}
            <IconButton aria-label="Share the Playlist">
                <ShareIcon />
            </IconButton>
            <IconButton aria-label="Share the Playlist" onClick={handleShowCommentsDialog}>
                <CommentIcon />
            </IconButton>
            {commentCount}
        </CardActions>
    )
}

PlaylistActions.propTypes = {
    user: PropTypes.object.isRequired,
    playlist: PropTypes.object.isRequired,
    FBUser: PropTypes.object
}

const mapStateToProps = (state) => ({
    user: state.user,
    FBUser: state.FBUser
})

export default connect(mapStateToProps)(withStyles(styles)(PlaylistActions))
