import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import GridList from '@material-ui/core/GridList'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'

import DistancePaceCalculator from '../components/splits/DistancePaceCalculator'
import Splits from '../components/splits/Splits'
import Tracks from '../components/playlists/Tracks'
import Comments from '../components/playlists/Comments'
import PostComment from '../components/playlists/PostComment'
import Introduction from '../components/util/Introduction'
import { getMyPlaylist,
    getSinglePlaylistFromSpotify } from '../redux/actions/spotifyActions'
import { setTargetPace, setSelectedDistance, calculateSplits } from '../redux/actions/splitsActions'

import { connect } from 'react-redux'

const styles = {
    card: {
        margin: 10
    }
}

const Playlist = (props) => {
    const { 
        splitsObj,
        spotifyPlaylistId,
        playlistObj,
        playlistLoading,
        firebasePlaylistId, FBUser, spotifyUser, authenticated } = props
        const { selectedDistance, targetPace, splits } = splitsObj
    const tracks = playlistObj ? playlistObj.tracks : []
    if (spotifyPlaylistId && !playlistObj && !playlistLoading) {
        console.log('spotifyUser', spotifyUser)
        props.getSinglePlaylistFromSpotify({id: spotifyPlaylistId, href:null})
    }
    return authenticated ? ((
        <Grid container spacing={2}> 
                <Grid item xs={12}>
                    <Typography variant="h2">
                        Playlist: {playlistObj.name}
                    </Typography>
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
                    <CircularProgress />
                ) : (
                    <Fragment>
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
        </Grid>
    )) : (
        <Introduction />
    )
}

const mapActionsToProps = {
    setSelectedDistance,
    setTargetPace,
    calculateSplits,
    getSinglePlaylistFromSpotify
}

const mapStateToProps = (state) => ({
    playlistObj: state.spotify.playlist,
    authenticated: state.user.authenticated,
    spotifyUser: state.user.spotifyUser,
    FBUser: state.user.FBUser,
    playlistLoading: state.spotify.playlistLoading,
    splitsObj: state.splits
})


export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Playlist))