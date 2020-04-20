import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../../constants/theme'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import Splits from '../splits/Splits'

import { connect } from 'react-redux'

const styles = {
    tracksContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    track: {
        borderWidth: 1,
        borderColor: '#4f98ca',
        borderStyle: 'solid',
        overflow: 'hidden',
        width: '100%',
        paddingLeft: 10,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',

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
        '&:hover': {
            minHeight: '25px !important',
            overflow: 'auto',
            backgroundColor: theme.palette.secondary.light,
            '-webkit-transition': 'ease-out 0.4s',
            '-moz-transition': 'ease-out 0.4s',
            transition: 'ease-out 0.4s',
            animation: 'trackHover 2s alternate',
            animationFillMode: 'forwards'

        },
        '&:hover:after': {
        //     position: 'absolute',
            marginLeft: 5,
            content: 'attr(data)',
            fontSize: 14,
        //     left: 24,
        //     top: -10,
        //     height: 50,
        //     minWidth: '200px',
        //     border: '1px #aaaaaa solid',
        //     borderRadius: '10px',
        //     backgroundColor: theme.palette.secondary.main,
        //     padding: '3px 6px',
        //     color: '#000000',
        //     fontSize: 14,
        //     zIndex: 9999,
        }
    }
}

const Tracks = props => {
    const { tracks, classes, splitsObj } = props
    const { targetPace, selectedDistance, splits } = splitsObj
    const { items } = tracks
    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            {splits && (
                <Splits splits={splits} targetPace={targetPace} selectedDistance={selectedDistance} />
            )}

        <Grid container className={classes.tracksContainer}>
        {items && items.length > 0 ? (
            items.map((trackObj, index) => {
                return (
                    <Grid item key={index} className={classes.track}
                        style={{
                        height: trackObj.track.duration_ms / 10000
                    }} data={` - ${Math.floor((trackObj.track.duration_ms/1000)/60)}:${Math.round((trackObj.track.duration_ms/1000)%60) < 10 ? '0' : ''}${Math.round((trackObj.track.duration_ms/1000)%60)}`}>
                        <Typography variant="body2">{trackObj.track.name}</Typography>
                    </Grid>
                )
            })
        ) : null}
        </Grid>
        </div>
    )
}

Tracks.propTypes = {

}


const mapStateToProps = (state) => ({
    splitsObj: state.splits
})

export default connect(mapStateToProps, null)(withStyles(styles)(Tracks))