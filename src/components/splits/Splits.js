import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

const styles = (theme) => ({
    ...theme.spreadThis,
    splitsContainer: {
        position: 'relative'
    }
    
})

const Splits = props => {
    const { splits, targetPace, classes } = props
    const targetPaceMin = parseInt(targetPace.split(':')[0])
    const targetPaceSec = parseInt(targetPace.split(':')[1])
    const targetPace_ms = ((targetPaceMin*60) + targetPaceSec) * 1000
    return (
        <Grid>
        {splits && splits.length > 0 ? (
            <div className={classes.splitsContainer}>
            {splits.map((split, index) => {
                return (
                    // <Grid style={{height: targetPace_ms / 10000}} item key={split} className={classes.split}>
                    <Box component="div" style={{height: targetPace_ms / 10000}} bgcolor="secondary.dark" key={split} className={classes.split}>
                        <Typography variant="body1">
                            {split}
                        </Typography>
                    </Box>
                    //</Grid> 
                )
            })}

            {/* <Box className="finish"></Box> */}
            </div>
        ) : null}
        </Grid>
    )
}

Splits.propTypes = {
    splits: PropTypes.array.isRequired,
    targetPace: PropTypes.string.isRequired,
    selectedDistance: PropTypes.number.isRequired
}


export default withStyles(styles)(Splits)
