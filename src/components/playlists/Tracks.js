import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import theme from '../../constants/theme'

// React DnD functionality

import Reorder, {
    reorder
  } from 'react-reorder'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import Splits from '../splits/Splits'

import { connect } from 'react-redux'

import { reorderPlaylist, submitReorderedPlaylistToSpotify } from '../../redux/actions/spotifyActions'

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
        paddingRight: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '&:hover': {
            height: 'inherit !important',
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
    },
    convertingColorsLinearGradient: {
        backgroundCmage: 'linear-gradient(90deg, rgba(0, 230, 80, 1) 35%, rgba(244, 236, 6, 1) 65%, rgba(242, 7, 7, 1) 100%)'
    }
}

const Tracks = props => {
    const { tracks, classes, splitsObj } = props
    const { targetPace, selectedDistance, splits } = splitsObj
    const { items } = tracks

    const targetPaceMin = parseInt(targetPace.split(':')[0])
    const targetPaceSec = parseInt(targetPace.split(':')[1])
    let splitTop = 0;
    const finishTop = splits && splits.length > 0 ? ((parseInt(splits[splits.length-1].split(':')[0])*6) + parseInt(splits[splits.length-1].split(':')[1])) : 0

    const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {
        //console.log('reorder(items, previousIndex, nextIndex)', reorder(items, previousIndex, nextIndex))
        props.reorderPlaylist(reorder(items, previousIndex, nextIndex))
    }

    return (
        <Fragment>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button style={{flex: 1, marginBottom: 10}} color={props.playlist.updated ? 'primary' : 'secondary'} variant="contained" disabled={!props.playlist.updated && !props.spotify.playlistUpdating} onClick={() => props.submitReorderedPlaylistToSpotify(props.playlist)}>
                {!props.playlist.updated ? (
                    <Typography variant="body1">
                        Drag and Drop to Reorder
                    </Typography>
                ) : !props.spotify.playlistUpdating ? (
                    <Typography variant="body1">Update Playlist</Typography>
                ) : (
                    <CircularProgress size={30} />
                )}
            </Button>
        </div>
        <div style={{position: 'relative'}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            {splits && (
                <Splits splits={splits} targetPace={targetPace} selectedDistance={selectedDistance} />
            )}

        <Grid container className={classes.tracksContainer}>
        {items && items.length > 0 ? (
                <Reorder
                    reorderId="tracksList" // Unique ID that is used internally to track this list (required)
                    draggedClassName="dragged" // Class name to be applied to dragged elements (optional), defaults to 'dragged'
                    lock="horizontal" // Lock the dragging direction (optional): vertical, horizontal (do not use with groups)
                    holdTime={200} // Default hold time before dragging begins (mouse & touch) (optional), defaults to 0
                    onReorder={onReorder} // Callback when an item is dropped (you will need this to update your state)
                    autoScroll={true} // Enable auto-scrolling when the pointer is close to the edge of the Reorder component (optional), defaults to true
                    disabled={props.playlist.owner.id !== props.user.spotifyUser.id} // Disable reordering (optional), defaults to false
                    disableContextMenus={true} // Disable context menus when holding on touch devices (optional), defaults to true
                    placeholder={
                    <div className="custom-placeholder" /> // Custom placeholder element (optional), defaults to clone of dragged element
                    }
                >
            {items.map((trackObj, index) => {
                const height = trackObj.track.duration_ms / 10000
                return (
                    <Grid item key={index} className={classes.track}
                        style={{
                        height: height
                    }} data={`${trackObj.track.artists[0].name} - ${Math.floor((trackObj.track.duration_ms/1000)/60)}:${Math.round((trackObj.track.duration_ms/1000)%60) < 10 ? '0' : ''}${Math.round((trackObj.track.duration_ms/1000)%60)}`}>
                        <Typography variant="body2">{trackObj.track.name}</Typography>
                        { trackObj.audioFeatures && (
                            <Typography variant="body1">
                                {`${Math.round(trackObj.audioFeatures.tempo)} BPM`}
                            </Typography>)}
                    </Grid>
                )
            })}
            {
                    // this.state.list.map((item) => (
                    //     <li key={item.name}>
                    //     {item.name}
                    //     </li>
                    // )).toArray()
                    /*
                    Note this example is an ImmutableJS List so we must convert it to an array.
                    I've left this up to you to covert to an array, as react-reorder updates a lot,
                    and if I called this internally it could get rather slow,
                    whereas you have greater control over your component updates.
                    */
                    }
                </Reorder>
        ) : null}
        </Grid>
        </div>

        
        {splits && splits.length > 0 && splits.map(split => {
            let splitMin = parseInt(split.split(':')[0])*6
            let splitSec = parseInt(split.split(':')[1])
            splitTop = splitMin + splitSec
            return <Box key={splitTop} style={{top: splitTop, display: splitTop > 0 ? 'block' : 'none'}} className="splitMarker"></Box>
        })}
        <Box style={{top: finishTop, display: finishTop > 0 ? 'block' : 'none'}} className="finish"></Box>
        </div>
        </Fragment>
    )
}

Tracks.propTypes = {
    splitsObj: PropTypes.object.isRequired,
    playlist: PropTypes.object.isRequired,
    spotify: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired

}


const mapStateToProps = (state) => ({
    splitsObj: state.splits,
    playlist: state.spotify.playlist,
    spotify: state.spotify,
    user: state.user
})

const mapActionsToProps = {
    reorderPlaylist,
    submitReorderedPlaylistToSpotify
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Tracks))
