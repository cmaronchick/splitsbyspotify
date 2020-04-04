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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'

import { connect } from 'react-redux'
import { 
    getMyPlaylist,
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist } from '../../redux/actions/spotifyActions'

import PlaylistActions from './PlaylistActions'

const styles = (theme) => ({
    ...theme.spreadThis,
    playlistLink: {
        color: theme.palette.primary.dark
    }
})


const PlaylistPreview = (props) => {
    const handleAddToMyPlaylistsClick = () => {
        props.addToMyPlaylists(props.playlist)
    }
    const handleShowConfirmDeleteDialog = (playlistId, FBId, playlistName) => {
        props.confirmRemoveFromMyPlaylists(playlistId, FBId, playlistName)
    }
    // const handleOpenComments = (FBId) => {
    //     props.openCommentsDialog(FBId)
    // }
    dayjs.extend(relativeTime)
    if (!props.playlist) {
        return (<div></div>)
    }
    const { classes, playlist : { name, images, id, owner, collaborative, inMyPlaylists, href, likeCount, commentCount, comments } } = props
    const FBId = props.playlist.FBId
    const handleShowCommentsDialog = () => {
        props.handleShowCommentsDialog(name, id, FBId, comments)
    }
    const publicPlaylist = props.playlist.public
    return (
        <Card className={classes.card}>
            
            <CardHeader
            title={<Link className={classes.playlistLink} to={`/playlist/${FBId}`} onClick={() => props.getMyPlaylist(FBId)}>{name}</Link>}
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
                className={classes.playlistImage}
                />
                ) : null}
                {/* <Typography variant="h5" color="primary" value={id} component={Link} to={`/playlist/${id}`}>{owner ? owner.id : null}</Typography> */}
                {/* <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography> */}
                <Typography variant="body1" value={name}>{name}</Typography>
            </CardContent>
            <PlaylistActions playlist={props.playlist} likePlaylist={props.likePlaylist} unlikePlaylist={props.unlikePlaylist} likeCount={likeCount} commentCount={commentCount} handleShowCommentsDialog={handleShowCommentsDialog}/>
            {/* {comments && comments.length > 0 && (
            <Comments comments={comments} FBId={props.playlist.FBId} openCommentsDialog />
            )} */}
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
    getMyPlaylist,
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PlaylistPreview))