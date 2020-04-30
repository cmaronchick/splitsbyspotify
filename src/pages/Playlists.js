import React from 'react'
import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'

//MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'

import MyButton from '../util/MyButton'

import {
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist,
    followPlaylist,
    unfollowPlaylist
} from '../redux/actions/spotifyActions'
import { connect } from 'react-redux'

const styles = (theme) => ({
    ...theme.spreadThis,
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      width: '100%',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
    subTitle: {
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    link: {
        color: theme.palette.primary.main,
    }
})

const Playlists = props => {
    const playlists = props.allPlaylists
    const { classes, spotifyUser, FBUser } = props
    return (
    <GridList cellHeight={180} className={classes.gridList} cols={(window.innerWidth < 600) ? 1 : (window.innerWidth < 800) ? 2 : 3}>
        <GridListTile key="Subheader" cols={(window.innerWidth < 600) ? 1 : (window.innerWidth < 800) ? 2 : 3} style={{ height: 'auto' }}>
        <ListSubheader component="div">
            <Typography variant="h3">
                User Playlists
            </Typography>
        </ListSubheader>
        </GridListTile>
        {Object.keys(playlists).map(playlistId => {
            const playlist = playlists[playlistId]
            console.log('playlist', playlist)
            const { firebasePlaylistId, playlistImage, playlistName } = playlist
            return (
                <GridListTile key={firebasePlaylistId}>
                <img src={playlistImage} alt={playlistName} />
                <GridListTileBar
                title={<Link to={`/playlist/${firebasePlaylistId}`} className={classes.link}>{playlistName}{playlist.avgBPM && ` (${Math.round(playlist.avgBPM)} BPM)`}</Link>}
                subtitle={<span>by: {playlist.spotifyUser}</span>}
                className={classes.subTitle}
                actionIcon={spotifyUser && spotifyUser.id !== playlist.spotifyUser && (!playlist.firebaseFollowers || !playlist.firebaseFollowers[spotifyUser.id] ? (
                    <MyButton tip={`Add ${playlistName} to My Playlists`} onClick={() => props.followPlaylist(FBUser, playlist)}
                    tipPlacement='bottom' btnClassName={classes.followButton}>
                        <AddCircle />
                    </MyButton>
                    ) : (
                        <MyButton tip={`Remove ${playlistName} from My Playlists`} onClick={() => props.unfollowPlaylist(FBUser, playlist)}
                        tipPlacement='bottom' btnClassName={classes.followButton}>
                            <RemoveCircle />
                        </MyButton>
                    ))}
                    />
                </GridListTile>
            )
        })}
    </GridList>
    )
}

Playlists.propTypes = {
    FBUser: PropTypes.object.isRequired,
    spotifyUser: PropTypes.object.isRequired,
    allPlaylists: PropTypes.object.isRequired
}

const mapActionsToProps = {
    addToMyPlaylists,
    removeFromMyPlaylists,
    confirmRemoveFromMyPlaylists,
    cancelRemoveFromMyPlaylists,
    likePlaylist,
    unlikePlaylist,
    followPlaylist,
    unfollowPlaylist
}

const mapStateToProps = (state) => ({
    FBUser: state.user.FBUser,
    spotifyUser: state.user.spotifyUser,
    allPlaylists: state.spotify.allPlaylists
})

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Playlists))
