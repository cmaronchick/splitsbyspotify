import React from 'react'
import PropTypes from 'prop-types'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import GridList from '@material-ui/core/GridList'
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import Typography from '@material-ui/core/Typography'

import distanceSplits from '../../constants/distanceSplits'

import { setTargetPace, setSelectedDistance, setSelectedMeasurement, calculateSplits } from '../../redux/actions/splitsActions'
import { addToMyPlaylists, updatePlaylist, getMyPlaylistBySpotifyId } from '../../redux/actions/spotifyActions'
import { editUserDetails, saveSplits, deleteSplits } from '../../redux/actions/userActions'

import { connect } from 'react-redux'

const styles = (theme) => ({
    ...theme.spreadThis,
    formDiv: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15
    },
    form: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingBottom: 10
    },
    formControl: {
        minWidth: 120,
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%'
    }
})

const DistancePaceCalculator = (props) => {
    const { classes, splitsObj, playlist, FBUser } = props
    let {selectedDistance, targetPace, selectedMeasurement} = splitsObj;
    const allPlaylistSplits = FBUser.splits
    let playlistSplits, savedSelectedDistance, savedTargetPace, savedSelectedMeasurement;
    if (allPlaylistSplits && Object.keys(allPlaylistSplits).length > 0){
        playlistSplits = allPlaylistSplits[playlist.firebasePlaylistId]
        if (playlistSplits) {
        savedSelectedDistance = playlistSplits.selectedDistance
        savedTargetPace = playlistSplits.targetPace
        savedSelectedMeasurement = playlistSplits.selectedMeasurement
        }
    }

    const handleSelectDistance = (event) => {
        props.setSelectedDistance(event.target.value)
    }
    const handleSelectMeasurement = (event) => {
        props.setSelectedMeasurement(event.target.value)
    }
    const handleTextInput = (event) => {
        props.setTargetPace(event.target.value)
    }
    const handleCalculateButtonClick = () => {
        props.calculateSplits(splitsObj.selectedDistance, splitsObj.targetPace)
    }
    const splitChoices = () => {
        for (var i=1; i < 51; i++) {
            console.log('i', i)
            return (
                <MenuItem key={i} value={i}>{i}</MenuItem>
            )
        }
    }
    return (
        <div className={classes.formDiv}>
            <Container className={classes.form}>
            <div className={classes.selectDistanceForm}>
                <FormControl className={classes.formControl}>
                {/* <InputLabel id="distance-select-label">Distance</InputLabel> */}
                <Select
                    labelId={`distance-label`}
                    value={selectedDistance ? selectedDistance : 'Select'}
                    onChange={handleSelectDistance}>
                        <MenuItem value={'Select'}>Select Distance</MenuItem>
                        {Object.keys(distanceSplits[selectedMeasurement]).map(distance => {
                            return (
                                <MenuItem key={distance} value={distanceSplits[selectedMeasurement][distance]}>{distance}</MenuItem>
                            )
                        })}
                        {[...Array(50)].map((x, i) => <MenuItem key={`selectedMeasurement${i+1}`} value={i+1}>{i+1}</MenuItem>)}
                </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                <Select
                    value={selectedMeasurement ? selectedMeasurement : 'mi'}
                    onChange={handleSelectMeasurement}>
                        <MenuItem value={'mi'}>mi</MenuItem>
                        <MenuItem value={'km'}>km</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <FormControl className={classes.formControl}>
                {/* <InputLabel id="pace-label">Pace (min/${selectedMeasurement})</InputLabel> */}
                <TextField id="pace" value={targetPace ? targetPace : ''} placeholder={!targetPace ? `Pace (min/${selectedMeasurement})` : null} name="targetPace" onChange={(event) => handleTextInput(event)}/>
            </FormControl>
            </Container>
            <div className={classes.buttonRow}>
                <Button disabled={(!splitsObj.selectedDistance || splitsObj.selectedDistance === 'Select') || !splitsObj.targetPace} onClick={() => handleCalculateButtonClick()} color="primary" variant="outlined">
                    Calculate!
                </Button>
                {playlist.firebasePlaylistId ? (
                <Button
                    disabled={(!splitsObj.selectedDistance || !splitsObj.targetPace || !splitsObj.splits || splitsObj.splits.length === 0) || (splitsObj.targetPace === savedTargetPace && splitsObj.selectedDistance === savedSelectedDistance)}
                    onClick={() => props.saveSplits({
                        firebasePlaylistId: playlist.firebasePlaylistId,
                        targetPace: splitsObj.targetPace,
                        selectedDistance: splitsObj.selectedDistance,
                        selectedMeasurement: splitsObj.selectedMeasurement,
                    })} color="primary" variant="outlined">
                    Save
                </Button>
                ) : (
                    <Button disabled={(!splitsObj.selectedDistance || !splitsObj.targetPace || !splitsObj.splits || splitsObj.splits.length === 0) || (splitsObj.targetPace === playlist.targetPace && splitsObj.selectedDistance === playlist.targetPace)}
                    onClick={() => {
                        props.addToMyPlaylists(playlist)
                        props.getMyPlaylistBySpotifyId(playlist.spotifyPlaylistId)
                    }
                    } color="primary" variant="outlined">
                    Add To My Playlists
                </Button>
                )}
            </div>
        </div>
    )
}

DistancePaceCalculator.propTypes = {
    splitsObj: PropTypes.object.isRequired,
    selectedDistance: PropTypes.number,
    targetPace: PropTypes.string,
    classes: PropTypes.object.isRequired,
    playlist: PropTypes.object.isRequired,
    FBUser: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    splitsObj: state.splits,
    playlist: state.spotify.playlist,
    FBUser: state.user.FBUser
})

const mapActionsToProps = {
    setSelectedDistance,
    setSelectedMeasurement,
    setTargetPace,
    calculateSplits,
    addToMyPlaylists,
    updatePlaylist,
    getMyPlaylistBySpotifyId,
    saveSplits,
    deleteSplits
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(DistancePaceCalculator))