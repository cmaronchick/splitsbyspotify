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

import Comments from './Comments'
import ConfirmDeleteDialog from './ConfirmDeleteDialog'

import { connect } from 'react-redux'
import { 
    getMyPlaylist,
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist,
    toggleCommentsDialog } from '../../redux/actions/spotifyActions'

import PlaylistActions from './PlaylistActions'

const styles = (theme) => ({
    ...theme.spreadThis,
    playlistLink: {
        color: theme.palette.primary.dark
    }
})


const PlaylistPreview = (props) => {

    const { classes, listType, playlist : { name, images, id, spotifyUser, owner, collaborative, inMyPlaylists, href, likeCount, commentCount, comments, tracks, spotifyPlaylistId } } = props
    const playlistName = name ? name : props.playlist.playlistName
    const firebasePlaylistId = props.playlist.firebasePlaylistId
    const playlistImage = images && images[0] ? images[0].url : props.playlist.playlistImage

    const handleAddToMyPlaylistsClick = () => {
        props.addToMyPlaylists(props.playlist)
    }
    const handleShowConfirmDeleteDialog = (spotifyPlaylistId, firebasePlaylistId, playlistName) => {
        console.log('(spotifyPlaylistId, firebasePlaylistId, playlistName)', {spotifyPlaylistId, firebasePlaylistId, playlistName})
        props.confirmRemoveFromMyPlaylists(spotifyPlaylistId, firebasePlaylistId, playlistName)
    }
    dayjs.extend(relativeTime)
    if (!props.playlist) {
        return (<div></div>)
    }
    const handleShowCommentsDialog = () => {
        props.handleShowCommentsDialog(props.showCommentsDialog, firebasePlaylistId)
    }
    const publicPlaylist = props.playlist.public
    return (
        <Card className={classes.card}>
            <CardContent className={classes.content} style={{position: 'relative'}}>
                <div style={{position:'absolute', right: -5, top: -10}}>   
                { inMyPlaylists ? (
                    <IconButton aria-label="settings"  onClick={() => handleShowConfirmDeleteDialog(id, firebasePlaylistId, name)}>
                        <RemoveCircle/>
                    </IconButton>
                    ) : (
                    <IconButton aria-label="settings"  onClick={handleAddToMyPlaylistsClick}>
                        <AddCircle/>
                    </IconButton>
                    )
                }
                </div>
                {playlistImage ? (
                <CardMedia
                image={`${playlistImage}`}
                title={`${name}`}
                className={classes.playlistImage}
                />
                ) : null}
                
                {/* <Typography variant="h5" color="primary" value={id} component={Link} to={`/playlist/${id}`}>{owner ? owner.id : null}</Typography> */}
                {/* <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography> */}
                <div className={classes.details}>
                    {firebasePlaylistId ? (
                        <Link className={classes.playlistLink} to={`/playlist/${firebasePlaylistId}`} onClick={() => props.getMyPlaylist(firebasePlaylistId)}>
                            <Typography variant="h5">{playlistName}</Typography>
                        </Link>
                    ) : (
                        <Typography variant="h5">{playlistName}</Typography>
                    )}
                    {(listType === 'all' && spotifyUser) || (owner && (owner.id !== props.spotifyUser.id)) && (
                        <Typography variant="body1" value={spotifyUser}>Owner: {owner.id}</Typography>
                    )}
                    {tracks && (
                        <Typography variant="body1" value={tracks.total}>Total Tracks: {tracks.total}</Typography>
                    )}
                    {firebasePlaylistId && (
                        <PlaylistActions playlist={props.playlist} likePlaylist={props.likePlaylist} unlikePlaylist={props.unlikePlaylist} likeCount={likeCount} commentCount={commentCount} handleShowCommentsDialog={handleShowCommentsDialog}/>
                    )}
                </div>
            </CardContent>
            {/* {comments && comments.length > 0 && (
            <Comments comments={comments} firebasePlaylistId={props.playlist.firebasePlaylistId} openCommentsDialog />
            )} */}
            <ConfirmDeleteDialog
                open={props.showConfirmRemoveDialog}
                playlistName={playlistName}
                spotifyPlaylistId={spotifyPlaylistId}
                firebasePlaylistId={firebasePlaylistId}
                handleConfirmDeletePlaylist={props.removeFromMyPlaylists}
                onClose={props.cancelRemoveFromMyPlaylists}/>
            <Comments
                open={props.showCommentsDialog}
                playlistName={playlistName}
                spotifyPlaylistId={spotifyPlaylistId}
                firebasePlaylistId={firebasePlaylistId}
                comments={comments}
                onClose={props.toggleCommentsDialog}
                user={props.user} />
        </Card>
    )
}

PlaylistPreview.propTypes = {
    spotifyUser: PropTypes.object,
    FBUser: PropTypes.object,
    likePlaylist: PropTypes.func.isRequired,
    unlikePlaylist: PropTypes.func.isRequired,
    playlist: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    showCommentsDialog: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    spotifyUser: state.user.spotifyUser,
    FBUser: state.user.FBUser,
    user: state.user,
    showCommentsDialog: state.spotify.showCommentsDialog,
    showConfirmRemoveDialog: state.spotify.showConfirmRemoveDialog
})

const mapActionsToProps = {
    getMyPlaylist,
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist,
    toggleCommentsDialog
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PlaylistPreview))