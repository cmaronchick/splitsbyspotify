import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../constants/theme'
import Grid from '@material-ui/core/Grid'

const styles = {
    track: {

    },
    split: {
        borderWidth: 1,
        borderColor: theme.palette.secondary.dark,
        borderStyle: 'solid'
    }
}

const Splits = props => {
    const { splits, targetPace, classes } = props
    const targetPaceMin = parseInt(targetPace.split(':')[0])
    const targetPaceSec = parseInt(targetPace.split(':')[1])
    const targetPace_ms = ((targetPaceMin*60) + targetPaceSec) * 1000
    return (
        <Grid>
        {splits && splits.length > 0 ? (
            splits.map((split, index) => {
                return (
                    <Grid style={{height: targetPace_ms / 10000}} item key={split} className={classes.split}>
                        {split}
                    </Grid>
                )
            })
        ) : null}
        </Grid>
    )
}

Splits.propTypes = {

}

export default withStyles(styles)(Splits)
