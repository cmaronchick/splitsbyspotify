import React, { Component, Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'
import ky from 'ky/umd'
import PropTypes from 'prop-types'

import PlaylistPreview from '../components/playlists/PlaylistPreview'
import Introduction from '../components/util/Introduction'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ConfirmDeleteDialog from '../components/playlists/ConfirmDeleteDialog'
import CircularProgress from '@material-ui/core/CircularProgress'
import Comments from '../components/playlists/Comments'
import PlaylistSkeleton from '../util/PlaylistSkeleton'
import LockOpen from '@material-ui/icons/LockOpen'
import AddCircle from '@material-ui/icons/AddCircle'
import Timer from '@material-ui/icons/Timer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

// Redux
import { connect } from 'react-redux'
import { getAllPlaylists, 
    getAllMyPlaylistsFromSpotify, 
    getMyPlaylists,
    getMyPlaylist,
    getPlaylistsFromSpotify, 
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist, 
    unlikePlaylist
} from '../redux/actions/spotifyActions'
import { Icon } from '@material-ui/core'

const styles = (theme) => ({
    ...theme.spreadThis
})

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            allPlaylists: props.allPlaylists,
            myPlaylists: props.myPlaylists,
            handleAddPlaylistClick: props.handleAddPlaylistClick,
            handleRemovePlaylistClick: props.handleRemovePlaylistClick,
            handleGetPlaylistTracks: props.handleGetPlaylistTracks,
            handleConfirmDeletePlaylist: props.handleConfirmDeletePlaylist,
            handleShowConfirmDeleteDialog: props.handleShowConfirmDeleteDialog,
            handleHideConfirmDeleteDialog: props.handleHideConfirmDeleteDialog,
            showConfirmDeleteDialog: props.showConfirmDeleteDialog,
            confirmDeletePlaylistName: props.confirmDeletePlaylistName,
            confirmDeletePlaylistId: props.confirmDeletePlaylistId,
            showCommentsDialog: false
        }
    }
    componentDidMount() {
        if (this.props.spotifyAccessToken) {
            this.props.getAllMyPlaylistsFromSpotify(this.props.spotifyAccessToken);
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.spotifyAccessToken !== prevProps.spotifyAccessToken) {
            this.props.getAllMyPlaylistsFromSpotify(this.props.spotifyAccessToken);
        }
    }

    handleShowCommentsDialog = (playlistName, spotifyPlaylistId, firebasePlaylistId, comments) => {
        this.setState({
            showCommentsDialog: true,
            commentsPlaylistName: playlistName,
            commentsSpotifyPlaylistId: spotifyPlaylistId,
            commentsPlaylistFirebasePlaylistId: firebasePlaylistId,
            commentsPlaylistCommentsArray: comments
        })
        this.props.getMyPlaylist(firebasePlaylistId)

    }
    handleHideCommentsDialog = () => {
        this.setState({
            showCommentsDialog: false,
            commentsPlaylistName: null,
            commentsSpotifyPlaylistId: null,
            commentsPlaylistfirebasePlaylistId: null,
            commentsPlaylistCommentsArray: null
        })
    }

    playlistsMarkup = (playlists) => playlists && Object.keys(playlists).length > 0 ? (
        Object.keys(playlists).map(playlistId => {
            return (
                <PlaylistPreview
                 playlist={playlists[playlistId]}
                 id={playlistId}
                 key={playlistId}
                 handleAddPlaylistClick={this.state.handleAddPlaylistClick}
                 handleGetPlaylistTracks={this.state.handleGetPlaylistTracks}
                 handleShowConfirmDeleteDialog={this.state.handleShowConfirmDeleteDialog}
                 handleHideConfirmDeleteDialog={this.state.handleHideConfirmDeleteDialog}
                 handleLikePlaylist={this.props.likePlaylist}
                 handleUnlikePlaylist={this.props.unlikePlaylist}
                 handleShowCommentsDialog={this.handleShowCommentsDialog}/>
            )
        })
    ) : (
        <Typography variant="body1" color="inherit">You have no playlists yet. Add some of yours from Spotify or browse other users' playlists.</Typography>
    )

    render() {
        const { classes, user } = this.props
        return (
            <Grid container spacing={2} className={classes.container}>
                {user.tourCompleted ? (
                    <Fragment>
                    <Grid item sm={6} xs={12}>
                        <div className="playlist-container">
                        <Typography variant="h4" value="My Spotify Playlists">My Spotify Playlists</Typography>
                            {!this.props.myPlaylistsFromSpotifyLoading ? (
                                this.playlistsMarkup(this.props.myPlaylistsFromSpotify)
                            ) : (
                                <PlaylistSkeleton />
                            )}

                        </div>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <div className="playlist-container">
                        <Typography variant="h4" value="My Workout Playlists">My Splits Playlists</Typography>

                            {!this.props.myPlaylistsLoading ? (
                                this.playlistsMarkup(this.props.myPlaylists)
                            ) : (
                                <PlaylistSkeleton />
                            )}
                        </div>
                    </Grid>

                    <ConfirmDeleteDialog
                    open={this.props.showConfirmRemoveDialog}
                    playlistName={this.props.removePlaylistName}
                    spotifyPlaylistId={this.props.removeSpotifyPlaylistId}
                    firebasePlaylistId={this.props.removeFirebasePlaylistId}
                    handleConfirmDeletePlaylist={this.props.removeFromMyPlaylists}
                    onClose={this.props.cancelRemoveFromMyPlaylists}/>
                    <Comments
                        open={this.state.showCommentsDialog}
                        playlistName={this.state.commentsPlaylistName}
                        spotifyPlaylistId={this.state.commentsSpotifyPlaylistId}
                        firebasePlaylistId={this.state.commentsPlaylistFirebasePlaylistId}
                        comments={this.state.commentsPlaylistCommentsArray}
                        onClose={this.handleHideCommentsDialog}
                        user={this.props.user} />
                </Fragment>
                ) : (
                    <Introduction handleSpotifyLogin={this.props.handleSpotifyLogin} />
                )}
            </Grid>
        )
    }
}

Home.propTypes = {
    allPlaylists: PropTypes.object,
    allPlaylistsLoading: PropTypes.bool,
    myPlaylists: PropTypes.object,
    myPlaylistsLoading: PropTypes.bool,
    myPlaylistsFromSpotify: PropTypes.object,
    myPlaylistsFromSpotifyLoading: PropTypes.bool,
    spotifyUser: PropTypes.object,
    spotifyAccessToken: PropTypes.string,
    addToMyPlaylist: PropTypes.func.isRequired,
    removeFromMyPlaylist: PropTypes.func.isRequired,
    confirmRemoveFromMyPlaylists: PropTypes.func.isRequired,
    cancelRemoveFromMyPlaylists: PropTypes.func.isRequired,
    likePlaylist: PropTypes.func.isRequired,
    unlikePlaylist: PropTypes.func.isRequired,
    showConfirmDeleteDialog: PropTypes.bool.isRequired,
    confirmDeletePlaylistName: PropTypes.string,
    confirmDeletePlaylistId: PropTypes.number,
    user: PropTypes.object.isRequired,
    FBUser: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
    allPlaylists: state.spotify.allPlaylists,
    allPlaylistsLoading: state.spotify.allPlaylistsLoading,
    myPlaylists: state.spotify.myPlaylists,
    myPlaylistsLoading: state.spotify.myPlaylistsLoading,
    myPlaylistsFromSpotify: state.spotify.myPlaylistsFromSpotify,
    myPlaylistsFromSpotifyLoading: state.spotify.myPlaylistsFromSpotifyLoading,
    spotifyUser: state.user.spotifyUser,
    spotifyAccessToken: state.user.spotifyAccessToken,
    FBUser: state.user.FBUser,
    showConfirmRemoveDialog: state.spotify.showConfirmRemoveDialog,
    removeSpotifyPlaylistId: state.spotify.removeSpotifyPlaylistId,
    removeFirebasePlaylistId: state.spotify.removeFirebasePlaylistId,
    removePlaylistName: state.spotify.removePlaylistName,
})

const mapActionsToProps = {
    getAllPlaylists,
    getMyPlaylists,
    getMyPlaylist,
    getAllMyPlaylistsFromSpotify,
    getPlaylistsFromSpotify,
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist
}


export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Home))