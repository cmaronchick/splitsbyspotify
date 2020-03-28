import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../../constants/theme'
import Grid from '@material-ui/core/Grid'

const styles = {
    track: {
        borderWidth: 1,
        borderColor: '#4f98ca',
        borderStyle: 'solid'
    }
}

const Tracks = props => {
    const { tracks, classes } = props
    const { items } = tracks
    return (
        <Grid>
        {items && items.length > 0 ? (
            items.map((trackObj, index) => {
                return (
                    <Grid item key={trackObj.track.id} className={classes.track}  style={{height:trackObj.track.duration_ms / 10000}}>
                        {trackObj.track.name}
                    </Grid>
                )
            })
        ) : null}
        </Grid>
    )
}

Tracks.propTypes = {

}

export default withStyles(styles)(Tracks)
