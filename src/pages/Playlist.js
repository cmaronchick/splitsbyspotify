import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import {withStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import Slider from '@material-ui/core/Slider'
import Box from '@material-ui/core/Box'

import SpotifyImage from '../images/Spotify_Icon_RGB_Green.png'

import DistancePaceCalculator from '../components/splits/DistancePaceCalculator'
import Tracks from '../components/playlists/Tracks'
import Comments from '../components/playlists/Comments'
import Introduction from '../components/util/Introduction'
import PlaylistActions from '../components/playlists/PlaylistActions'
import PlaylistHeader from '../components/playlists/PlaylistHeader'
import { getMyPlaylist,
    getSinglePlaylistFromSpotify,
    getTrackAudioFeatures,
    likePlaylist,
    unlikePlaylist,
    toggleCommentsDialog } from '../redux/actions/spotifyActions'
import { setTargetPace, setSelectedDistance, calculateSplits } from '../redux/actions/splitsActions'

import { connect } from 'react-redux'

const styles = (theme) => ({
    ...theme.spreadThis,
    link: {
        color: theme.palette.secondary.dark
    },
    card: {
        margin: 10
    },
    slider: {
        padding: '0 20px',
        width: '90%',
        textAlign: 'center'
    }
})

const Playlist = (props) => {
    const { 
        classes,
        splitsObj,
        playlistObj,
        playlistLoading, FBUser, spotifyUser, authenticated } = props
        const { selectedDistance, targetPace, splits } = splitsObj

    const { playlistName, likeCount, commentCount, comments, firebasePlaylistId, spotifyPlaylistId } = playlistObj
    const tracks = playlistObj ? playlistObj.tracks : []
    if (props.errors) {
        return (
            <Grid container spacing={2}> 
                <Grid item xs={12}>
                    <Typography variant="h5">
                        Something went wrong. Please log in and try again
                    </Typography>
                </Grid>
            </Grid>
        )
    }
    

    const handleShowCommentsDialog = () => {
        console.log('comments clicked', props.showCommentsDialog)
        props.toggleCommentsDialog(props.showCommentsDialog, firebasePlaylistId)
    }

    return authenticated ? ((
        <Grid container spacing={2}> 
                <Grid item xs={12}>
                    <PlaylistHeader />
                    <Card>
                        <DistancePaceCalculator
                        selectedDistance={selectedDistance}
                        targetPace={targetPace}/>
                    </Card>
                </Grid>
                <Grid container spacing={2} style={{padding: '0 10px'}}>
                {/* {splits && splits.length > 0 && (
                    <Grid item sm={6}>
                                <Card>
                                    <CardHeader title="Splits" />
                                    <CardContent>
                                        <Splits targetPace={targetPace} splits={splits} />
                                    </CardContent>
                                </Card>
                    </Grid>
                )} */}
                {playlistLoading ? (
                    <Box className={classes.playlistLoading}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Fragment>
                        <Grid item xs={12}>
                            {/* <Button disabled={!props.user.spotifyAccessToken} onClick={() => props.getTrackAudioFeatures(props.user.spotifyAccessToken,props.playlistObj)}>
                                Get Audio Analysis
                            </Button> */}
                            {playlistObj.avgBPM && (
                                <div className={classes.slider}>
                                    <Typography variant="h5">
                                        Beats per Minute
                                    </Typography>
                                    <Slider 
                                        defaultValue={Math.round(playlistObj.avgBPM)}
                                        min={Math.round(playlistObj.minBPM)}
                                        max={Math.round(playlistObj.maxBPM)}
                                        marks={[
                                        {
                                            value: Math.round(playlistObj.minBPM),
                                            label: `Min ${Math.round(playlistObj.minBPM)}`
                                        },
                                        {
                                            value: playlistObj.avgBPM.toFixed(2),
                                            label: `Avg ${playlistObj.avgBPM.toFixed(2)}`
                                        },
                                        {
                                            value: Math.round(playlistObj.maxBPM),
                                            label: `Max ${Math.round(playlistObj.maxBPM)}`
                                        }]}
                                        disabled={true}
                                    />
                                </div>
                            )}
                            {playlistObj.firebasePlaylistId && (
                                <PlaylistActions 
                                playlist={playlistObj} 
                                likePlaylist={props.likePlaylist} 
                                unlikePlaylist={props.unlikePlaylist} 
                                likeCount={likeCount} 
                                commentCount={commentCount} 
                                handleShowCommentsDialog={handleShowCommentsDialog}/>
                            )}
                        </Grid>
                        {tracks && tracks.items && 
                        (<Grid item xs={12}>
                            <Card>
                                <CardHeader title="Tracks" />
                                <CardContent>
                                    <Tracks tracks={tracks} updatedTracks={playlistObj.spotifyUser === spotifyUser.id ? tracks : null} />
                                </CardContent>
                            </Card>
                        </Grid>)}
                    </Fragment>
                )}
                </Grid>
                {playlistObj.firebasePlaylistId && (
                    <Comments
                        open={props.showCommentsDialog}
                        playlistName={playlistName}
                        spotifyPlaylistId={spotifyPlaylistId}
                        firebasePlaylistId={firebasePlaylistId}
                        comments={comments}
                        onClose={handleShowCommentsDialog}
                        user={props.FBuser} />
                )}
        </Grid>
    )) : (
        <Introduction />
    )
}

const mapActionsToProps = {
    setSelectedDistance,
    setTargetPace,
    calculateSplits,
    getMyPlaylist,
    getSinglePlaylistFromSpotify,
    getTrackAudioFeatures,
    likePlaylist,
    unlikePlaylist,
    toggleCommentsDialog
}

const mapStateToProps = (state) => ({
    playlistObj: state.spotify.playlist,
    showCommentsDialog: state.spotify.showCommentsDialog,
    authenticated: state.user.authenticated,
    spotifyUser: state.user.spotifyUser,
    FBUser: state.user.FBUser,
    playlistLoading: state.spotify.playlistLoading,
    splitsObj: state.splits,
    user: state.user,
    errors: state.UI.errors
})


export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Playlist))