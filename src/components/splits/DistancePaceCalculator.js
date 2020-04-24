import React from 'react'
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

import { setTargetPace, setSelectedDistance, calculateSplits } from '../../redux/actions/splitsActions'

import { connect } from 'react-redux'

const styles = {
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
}

const DistancePaceCalculator = (props) => {
    const { selectedDistance, targetPace, classes, splitsObj } = props

    const handleSelectDistance = (event) => {
        props.setSelectedDistance(event.target.value)
    }
    const handleTextInput = (event) => {
        props.setTargetPace(event.target.value)
    }
    const handleCalculateButtonClick = () => {
        props.calculateSplits(splitsObj.selectedDistance, splitsObj.targetPace)
    }
    return (
        <div className={classes.formDiv}>
        <Container className={classes.form}>
        <FormControl className={classes.formControl}>
        <InputLabel id="distance-select-label">Distance</InputLabel>
        <Select
            labelId={`distance-label`}
            value={props.selectedDistance ? props.selectedDistance : 'Select'}
            onChange={handleSelectDistance}>
                <MenuItem value={'Select'}>Select Distance</MenuItem>
                {Object.keys(distanceSplits).map(distance => {
                    return (
                        <MenuItem key={distance} value={distanceSplits[distance]}>{distance}</MenuItem>
                    )
                })}
        </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
            <TextField id="pace" value={splitsObj.targetPace} label="Pace (min/mile)" name="targetPace" onChange={(event) => handleTextInput(event)}/>
        </FormControl>
        </Container>
            <Button disabled={(!splitsObj.selectedDistance || splitsObj.selectedDistance === 'Select') || !splitsObj.targetPace} onClick={() => handleCalculateButtonClick()} color="primary" variant="outlined">
                Calculate!
            </Button>
        </div>
    )
}

const mapStateToProps = (state) => ({
    splitsObj: state.splits
})

const mapActionsToProps = {
    setSelectedDistance,
    setTargetPace,
    calculateSplits
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(DistancePaceCalculator))