import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'
import ky from 'ky/umd'
import PropTypes from 'prop-types'

import PlaylistPreview from '../components/playlists/PlaylistPreview'
import Introduction from '../components/util/Introduction'

import Typography from '@material-ui/core/Typography'
import ConfirmDeleteDialog from '../components/playlists/ConfirmDeleteDialog'
import Comments from '../components/playlists/Comments'
import PlaylistSkeleton from '../util/PlaylistSkeleton'
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box'

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
    unlikePlaylist,
    toggleCommentsDialog
} from '../redux/actions/spotifyActions'
import { Icon } from '@material-ui/core'

const styles = (theme) => ({
    ...theme.spreadThis
})

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
      </Typography>
    );
  }

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
            showCommentsDialog: false,
            selectedTab: 0
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

    // handleShowCommentsDialog = (playlistName, spotifyPlaylistId, firebasePlaylistId, comments) => {
    //     this.setState({
    //         showCommentsDialog: true,
    //         commentsPlaylistName: playlistName,
    //         commentsSpotifyPlaylistId: spotifyPlaylistId,
    //         commentsPlaylistFirebasePlaylistId: firebasePlaylistId,
    //         commentsPlaylistCommentsArray: comments
    //     })
    //     // this.props.getMyPlaylist(firebasePlaylistId)

    // }
    // handleHideCommentsDialog = () => {
    //     this.setState({
    //         showCommentsDialog: false,
    //         commentsPlaylistName: null,
    //         commentsSpotifyPlaylistId: null,
    //         commentsPlaylistfirebasePlaylistId: null,
    //         commentsPlaylistCommentsArray: null
    //     })
    // }

    playlistsMarkup = (playlists) => (
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
                 handleShowCommentsDialog={this.props.toggleCommentsDialog}/>
            )
        })
    )

    handleChange = (event, newValue) => {
        this.setState({
            selectedTab: newValue
        });
    };

    a11yProps = (index) => {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    };

    render() {
        const { classes, user } = this.props
        const { selectedTab } = this.state
        return (
            <Fragment>
                {user.authenticated ? (
                    window.innerWidth < 800 ? (
                    <div className={classes.root}>
                        <AppBar position="static">
                        <Tabs
                            value={this.state.selectedTab}
                            onChange={this.handleChange}
                            aria-label="simple tabs example"
                            indicatorColor="secondary"
                            textColor="inherit">

                            <Tab label="My Spotify Playlists" {...this.a11yProps(0)} />
                            <Tab label="My Splits Playlists" {...this.a11yProps(1)} />
                        </Tabs>
                        </AppBar>
                        <TabPanel value={selectedTab} index={0}>
                            <div className="playlist-container">
                                {!this.props.myPlaylistsFromSpotifyLoading ? this.props.myPlaylistsFromSpotify && Object.keys(this.props.myPlaylistsFromSpotify).length > 0 ? (
                                    this.playlistsMarkup(this.props.myPlaylistsFromSpotify)
                                ) : (
                                    <Typography variant="body1" color="inherit">You have no Spotify playlists. You can <Link to="/Playlists">browse other users' playlists</Link> in order to find one you like.</Typography>
                                ) : (
                                    <PlaylistSkeleton />
                                )}

                            </div>
                        </TabPanel>
                        <TabPanel value={selectedTab} index={1}>
                            <div className="playlist-container">
                                {!this.props.myPlaylistsLoading ? this.props.myPlaylists && Object.keys(this.props.myPlaylists).length > 0 ? (
                                    this.playlistsMarkup(this.props.myPlaylists)
                                ) : (
                                    <Typography variant="body1" color="inherit">You have not saved any playlists yet. Add some of yours from Spotify or <Link to="/Playlists">browse other users' playlists</Link> to save your splits.</Typography>
                                ) : (
                                    <PlaylistSkeleton />
                                )}
                            </div>
                        </TabPanel>
                    </div>
                    ) : (
                    <Grid container spacing={2} className={classes.container}>
                            <Fragment>
                            <Grid item sm={6} xs={12}>
                                <div className="playlist-container">
                                <Typography variant="h4" value="My Spotify Playlists">
                                My Spotify Playlists</Typography>
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
                        </Fragment>
                    </Grid>
                    )
                ) : (
                    <Introduction handleSpotifyLogin={this.props.handleSpotifyLogin} />
                )}


                <ConfirmDeleteDialog
                open={this.props.showConfirmRemoveDialog}
                handleConfirmDeletePlaylist={this.props.removeFromMyPlaylists}
                onClose={this.props.cancelRemoveFromMyPlaylists}/>
            <Comments
                open={this.props.showCommentsDialog}
                onClose={this.props.toggleCommentsDialog}
                user={this.props.user} />
        </Fragment>
    )}
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
    addToMyPlaylists: PropTypes.func.isRequired,
    removeFromMyPlaylists: PropTypes.func.isRequired,
    confirmRemoveFromMyPlaylists: PropTypes.func.isRequired,
    cancelRemoveFromMyPlaylists: PropTypes.func.isRequired,
    likePlaylist: PropTypes.func.isRequired,
    unlikePlaylist: PropTypes.func.isRequired,
    showConfirmDeleteDialog: PropTypes.bool,
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
    showCommentsDialog: state.spotify.showCommentsDialog
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
    unlikePlaylist,
    toggleCommentsDialog
}


export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Home))