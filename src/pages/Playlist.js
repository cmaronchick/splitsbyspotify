import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import {withStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import GridList from '@material-ui/core/GridList'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'

import SpotifyImage from '../images/Spotify_Icon_RGB_Green.png'

import DistancePaceCalculator from '../components/splits/DistancePaceCalculator'
import Splits from '../components/splits/Splits'
import Tracks from '../components/playlists/Tracks'
import Comments from '../components/playlists/Comments'
import PostComment from '../components/playlists/PostComment'
import Introduction from '../components/util/Introduction'
import PlaylistActions from '../components/playlists/PlaylistActions'
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
    
    if (props.firebasePlaylistId && playlistObj.firebasePlaylistId && (props.firebasePlaylistId !== playlistObj.firebasePlaylistId)) {
        if (!props.playlistLoading) {
            props.getMyPlaylist(props.firebasePlaylistId)
        }
    }
    if (props.firebasePlaylistId && !props.playlistObj.firebasePlaylistId && !props.playlistLoading && props.FBUser.credentials.userId) {
        props.getMyPlaylist(props.firebasePlaylistId)
    }

    const handleShowCommentsDialog = () => {
        props.toggleCommentsDialog(props.showCommentsDialog)
    }
    return authenticated ? ((
        <Grid container spacing={2}> 
                <Grid item xs={12}>
                    <div className={classes.playlistHeader}>
                        <Link className={classes.link} to="/">
                            <NavigateBefore style={{fontSize: '3rem'}} color="inherit"/>
                        </Link>
                    <Typography variant="h4">
                        {playlistObj.name}
                    </Typography>
                        {playlistObj.external_urls && playlistObj.external_urls.spotify && (
                            <a href={playlistObj.external_urls.spotify} rel="noopener noreferrer" target="_blank">
                            <img src={SpotifyImage} alt="Open in Spotify" className={classes.spotifyIcon}/>
                            </a>
                        )}
                    </div>
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
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                                    <div>Average BPM: {playlistObj.avgBPM.toFixed(2)}</div>
                                    <div>Min: {Math.round(playlistObj.minBPM)}</div>
                                    <div>Max: {Math.round(playlistObj.maxBPM)}</div>
                                </div>)}
                            <PlaylistActions 
                            playlist={playlistObj} 
                            likePlaylist={props.likePlaylist} 
                            unlikePlaylist={props.unlikePlaylist} 
                            likeCount={likeCount} 
                            commentCount={commentCount} 
                            handleShowCommentsDialog={handleShowCommentsDialog}/>
                        </Grid>
                        {tracks && tracks.items && 
                        (<Grid item xs={12}>
                            <Card>
                                <CardHeader title="Tracks" />
                                <CardContent>
                                    <Tracks tracks={tracks} />
                                </CardContent>
                            </Card>
                        </Grid>)}
                    </Fragment>
                )}
                </Grid>
                <Comments
                    open={props.showCommentsDialog}
                    playlistName={playlistName}
                    spotifyPlaylistId={spotifyPlaylistId}
                    firebasePlaylistId={firebasePlaylistId}
                    comments={comments}
                    onClose={handleShowCommentsDialog}
                    user={props.FBuser} />
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
    user: state.user
})


export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Playlist))