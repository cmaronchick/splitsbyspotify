import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../../constants/theme'
import Grid from '@material-ui/core/Grid'
import zIndex from '@material-ui/core/styles/zIndex'

const styles = {
    tracksContainer: {
        position: 'relative'
    },
    track: {
        borderWidth: 1,
        borderColor: '#4f98ca',
        borderStyle: 'solid',
        overflow: 'hidden',

        // '&[data]:after': {
        //     textAlign: 'center',
        //     fontWeight: 400,
        //     content: 'attr(data)',
        //     animation: 'anim2 .2s',
        //     /*-moz-animation: anim2 .2s;
        //     -webkit-animation: anim2 .2s;*/
        //     animationFillMode: 'forwards',
        //     cursor: 'default',
        //     zIndex: 9999
        // },
        // '&:hover:after': {
        //     textAlign: 'center',
        //     animation: 'anim1 .3s',
        //     /*-moz-animation: anim1 .3s;
        //     -webkit-animation: anim1 .3s;*/
        //     animationFillMode: 'forwards',
        //     cursor: 'default',
        //     zIndex: 9999
        // },
        // '&[data]:after': {
        //     textAlign: 'center',
        //     fontWeight: 400,
        //     content: '"Here is some text"',
        //     animation: 'anim2 .2s',
        //     /*-moz-animation: anim2 .2s;
        //     -webkit-animation: anim2 .2s;*/
        //     animationFillMode: 'forwards',
        //     cursor: 'default',
        //     zIndex: 9998
        // },
        '&:hover:after': {
            position: 'absolute',
            content: 'attr(data)',
            left: 24,
            top: 0,
            minWidth: '200px',
            border: '1px #aaaaaa solid',
            borderRadius: '10px',
            backgroundColor: theme.palette.secondary.main,
            padding: '3px 6px',
            color: '#000000',
            fontSize: 14,
            zIndex: 9999,
        }
    }
}

const Tracks = props => {
    const { tracks, classes } = props
    const { items } = tracks
    return (
        <Grid container className={classes.tracksContainer}>
        {items && items.length > 0 ? (
            items.map((trackObj, index) => {
                return (
                    <Grid item key={trackObj.track.id} className={classes.track}  style={{height:trackObj.track.duration_ms / 10000}} data={`${trackObj.track.name} - ${trackObj.track.artists[0].name} - ${Math.floor((trackObj.track.duration_ms/1000)/60)}:${Math.round((trackObj.track.duration_ms/1000)%60)}`}>
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
