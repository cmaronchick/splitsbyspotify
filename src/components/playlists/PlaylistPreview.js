import React from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CommentIcon from '@material-ui/icons/Comment'

import FavoriteIconBorder from '@material-ui/icons/FavoriteBorder';
import ShareIcon from '@material-ui/icons/Share';
import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'
import MuiLink from '@material-ui/core/Link'

import { connect } from 'react-redux'
import { 
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist } from '../../redux/actions/spotifyActions'
import { handleSpotifyLogin } from '../../redux/actions/userActions'

import PostComment from './CommentForm'
import MyButton from '../../util/MyButton'

const styles = (theme) => ({
    ...theme.spreadThis,
    playlistLink: {
        color: theme.palette.primary.dark
    }
})


const PlaylistPreview = (props) => {
    const likedPlaylist = () => {
        if (props.FBUser.likes && 
            props.FBUser.likes.find(
            (like) => like.playlistId === props.playlist.FBId)
            ) {
            return true
        }
        return false
    }
    const handleLikePlaylist = () => {
        props.likePlaylist(props.playlist.FBId)
    }
    const handleUnlikePlaylist = () => {
        props.unlikePlaylist(props.playlist.FBId)
    }
    const handleAddToMyPlaylistsClick = () => {
        props.addToMyPlaylists(props.playlist)
    }
    const handleShowConfirmDeleteDialog = (playlistId, FBId, playlistName) => {
        props.confirmRemoveFromMyPlaylists(playlistId, FBId, playlistName)
    }
    dayjs.extend(relativeTime)
    if (!props.playlist) {
        return (<div></div>)
    }
    const { classes, playlist : { name, images, id, owner, collaborative, inMyPlaylists, href, likeCount, commentCount } } = props
    const FBId = props.playlist.FBId
    const publicPlaylist = props.playlist.public
    const LikeButton = !props.user.authenticated ? (
        <MyButton tip="Log in to Like" onClick={handleSpotifyLogin}>
            <FavoriteIconBorder />    
        </MyButton>
    ) : props.FBUser ? likedPlaylist() ? (
        <MyButton tip="Unlike This playlist" onClick={handleUnlikePlaylist}>
            <FavoriteIcon />
        </MyButton>
    ) : (
        <MyButton tip="Like This Playlist" onClick={handleLikePlaylist}>
            <FavoriteIconBorder />    
        </MyButton>
    ) : (
        <div>Loading User</div>
    )
    return (
        <Card className={classes.card}>
            
            <CardHeader
            title={<Link className={classes.playlistLink} to={`/playlist/${FBId}`} onClick={() => props.handleGetPlaylistTracks(props.playlist)}>{name}</Link>}
            action={ inMyPlaylists ? (
                <IconButton aria-label="settings"  onClick={() => handleShowConfirmDeleteDialog(id, FBId, name)}>
                    <RemoveCircle/>
                </IconButton>
                ) : (
                <IconButton aria-label="settings"  onClick={handleAddToMyPlaylistsClick}>
                    <AddCircle/>
                </IconButton>
                )
            }
            />
            <CardContent className={classes.content}>
                
                {images && images.length > 0 ? (
                <CardMedia
                image={`${images[0].url}`}
                title={`${name}`}
                className={classes.image}
                />
                ) : null}
                {/* <Typography variant="h5" color="primary" value={id} component={Link} to={`/playlist/${id}`}>{owner ? owner.id : null}</Typography> */}
                {/* <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography> */}
                <Typography variant="body1" value={name}>{name}</Typography>
            </CardContent>

            <CardActions disableSpacing>
                {LikeButton} {likeCount}
                <IconButton aria-label="Share the Playlist">
                    <ShareIcon />
                </IconButton>
                <IconButton aria-label="Share the Playlist">
                    <CommentIcon />
                </IconButton>
                {commentCount}
            </CardActions>
            <PostComment FBId={FBId}  />
        </Card>
    )
}

PlaylistPreview.propTypes = {
    spotifyUser: PropTypes.object,
    FBUser: PropTypes.object,
    likePlaylist: PropTypes.func.isRequired,
    unlikePlaylist: PropTypes.func.isRequired,
    playlist: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    spotifyUser: state.user.spotifyUser,
    FBUser: state.user.FBUser,
    user: state.user
})

const mapActionsToProps = {
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PlaylistPreview))