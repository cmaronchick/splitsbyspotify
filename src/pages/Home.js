import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'
import ky from 'ky/umd'
import PropTypes from 'prop-types'

import PlaylistPreview from '../components/playlists/PlaylistPreview'
import Typography from '@material-ui/core/Typography'
import ConfirmDeleteDialog from '../components/playlists/ConfirmDeleteDialog'
import CircularProgress from '@material-ui/core/CircularProgress'
import Comments from '../components/playlists/Comments'
import PlaylistSkeleton from '../util/PlaylistSkeleton'

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

    handleShowCommentsDialog = (playlistName, playlistId, FBId, comments) => {
        this.setState({
            showCommentsDialog: true,
            commentsPlaylistName: playlistName,
            commentsPlaylistId: playlistId,
            commentsPlaylistFBId: FBId,
            commentsPlaylistCommentsArray: comments
        })
        this.props.getMyPlaylist(FBId)

    }
    handleHideCommentsDialog = () => {
        this.setState({
            showCommentsDialog: false,
            commentsPlaylistName: null,
            commentsPlaylistId: null,
            commentsPlaylistFBId: null,
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
        const { classes } = this.props
        return (
            <Grid container spacing={2} className={this.props.classes.container}>
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
                    <Typography variant="h4" value="My Workout Playlists">My Workout Playlists</Typography>

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
                 playlistId={this.props.removePlaylistId}
                 FBId={this.props.removePlaylistFBId}
                 handleConfirmDeletePlaylist={this.props.removeFromMyPlaylists}
                 onClose={this.props.cancelRemoveFromMyPlaylists}/>
                 <Comments
                    open={this.state.showCommentsDialog}
                    playlistName={this.state.commentsPlaylistName}
                    playlistId={this.state.commentsPlaylistId}
                    FBId={this.state.commentsPlaylistFBId}
                    comments={this.state.commentsPlaylistCommentsArray}
                    onClose={this.handleHideCommentsDialog}
                    user={this.props.user} />
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
    FBUser: PropTypes.object,
    handleAddPlaylistClick: PropTypes.func.isRequired,
    handleRemovePlaylistClick: PropTypes.func.isRequired,
    handleGetPlaylistTracks: PropTypes.func.isRequired,
    handleConfirmDeletePlaylist: PropTypes.func.isRequired,
    handleShowConfirmDeleteDialog: PropTypes.func.isRequired,
    handleHideConfirmDeleteDialog: PropTypes.func.isRequired,
    showConfirmDeleteDialog: PropTypes.bool.isRequired,
    confirmDeletePlaylistName: PropTypes.string,
    confirmDeletePlaylistId: PropTypes.number
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
    removePlaylistId: state.spotify.removePlaylistId,
    removePlaylistFBId: state.spotify.removePlaylistFBId,
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