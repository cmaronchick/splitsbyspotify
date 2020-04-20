import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../../constants/theme'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

const styles = (theme) => ({
    ...theme.spreadThis
    
})

const Splits = props => {
    const { splits, targetPace, classes } = props
    console.log('splits', splits)
    const targetPaceMin = parseInt(targetPace.split(':')[0])
    const targetPaceSec = parseInt(targetPace.split(':')[1])
    const targetPace_ms = ((targetPaceMin*60) + targetPaceSec) * 1000
    return (
        <Grid>
        {splits && splits.length > 0 ? (
            splits.map((split, index) => {
                return (
                    // <Grid style={{height: targetPace_ms / 10000}} item key={split} className={classes.split}>
                    <Box component="div" style={{height: targetPace_ms / 10000}} bgcolor="secondary.dark" key={split} className={classes.split}>
                        <Typography variant="body1">
                            {split}
                        </Typography>
                    </Box>
                    //</Grid> 
                )
            })
        ) : null}
        </Grid>
    )
}

Splits.propTypes = {

}


export default withStyles(styles)(Splits)
