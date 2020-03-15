import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import GridList from '@material-ui/core/GridList'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'

import DistancePaceCalculator from '../components/DistancePaceCalculator'
import Splits from '../components/Splits'
import Tracks from '../components/Tracks'

const styles = {
    card: {
        margin: 10
    }
}

const Playlist = (props) => {
    const { selectedDistance,
        targetPace,
        splits,
        playlistId,
        playlist,
        playlistLoading,
        spotifyUser,
        handleGetPlaylistTracks,
        handleSelectDistance,
        handleTextInput,
        handleCalculateButtonClick } = props
    const tracks = playlist ? playlist.tracks : []
    if (playlistId && !playlist && !playlistLoading) {
        console.log('spotifyUser', spotifyUser)
        handleGetPlaylistTracks({id: playlistId, href:null})
    }
    return (
        <Grid container spacing={2}> 
            <Grid item xs={12}>
                <Card>
                    <DistancePaceCalculator
                    selectedDistance={selectedDistance}
                    targetPace={targetPace}
                    handleTextInput={handleTextInput}
                    handleSelectDistance={handleSelectDistance}
                    handleCalculateButtonClick={handleCalculateButtonClick} />
                </Card>
            </Grid>
            <Grid container spacing={2} style={{padding: '0 10px'}}>
            {splits && splits.length > 0 ? (
                <Grid item sm={6}>
                            <Card>
                                <CardHeader title="Splits" />
                                <CardContent>
                                    <Splits targetPace={targetPace} splits={splits} />
                                </CardContent>
                            </Card>
                </Grid>
            ) : null}
                <Grid item sm={6}>
                    <Card>
                        <CardHeader title="Tracks" />
                        <CardContent>
                            <Tracks tracks={tracks} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Playlist