import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

import SpotifyImage from '../../images/Spotify_Icon_RGB_Green.png'
import MyButton from '../../util/MyButton'

import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import PlaylistAdd from '@material-ui/icons/PlaylistAdd'
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck'
import PersonAdd from '@material-ui/icons/PersonAdd'
import PersonAddDisabled from '@material-ui/icons/PersonAddDisabled'

import { followPlaylistOnSpotify, unfollowPlaylistOnSpotify, followUserOnSpotify, unfollowUserOnSpotify } from '../../redux/actions/spotifyActions'

const styles = (theme) => ({
    ...theme.spreadThis,
})

const PlaylistHeader = props => {
  const { classes, playlistObj, playlistLoading, user } = props
  return !playlistLoading && playlistObj.name ? (
    <div className={classes.playlistHeader}>
      <Link className={classes.link} to="/">
          <NavigateBefore style={{fontSize: '3rem'}} color="inherit"/>
      </Link>
      <ExpansionPanel
          style={{width: '100%'}}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Box className={classes.expansionPanelSummary}>

          <Typography variant="h4">
              {playlistObj.name}
          </Typography>
              {playlistObj.external_urls && playlistObj.external_urls.spotify && (
                  <a href={playlistObj.external_urls.spotify} rel="noopener noreferrer" target="_blank">
                  <img src={SpotifyImage} alt="Open in Spotify" className={classes.spotifyIcon}/>
                  </a>
              )}
          </Box>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {playlistObj.following ? (
              <Box className={classes.spotifyButton}>
              <MyButton tip="Unfollow Playlist on Spotify" onClick={() => props.unfollowPlaylistOnSpotify(user.spotifyAccessToken, playlistObj.spotifyPlaylistId)} >
                <PlaylistAddCheck />
              </MyButton>
              {window.innerWidth > 500 && (
              <Typography variant="body1">
                Unfollow Playlist on Spotify
              </Typography>
              )}
              </Box>
            ) : (
              <Box className={classes.spotifyButton}>
                <MyButton tip="Follow Playlist on Spotify"  onClick={() => props.followPlaylistOnSpotify(user.spotifyAccessToken, playlistObj.spotifyPlaylistId)}>
                  <PlaylistAdd />
                </MyButton>
                {window.innerWidth > 500 && (
                <Typography variant="body1">
                  Follow Playlist on Spotify
                </Typography>
                )}
              </Box>
            )}

            {playlistObj.followingOwner ? (
              <Box className={classes.spotifyButton}>
              <MyButton tip={`Unfollow ${playlistObj.owner.id} on Spotify`} onClick={() => props.unfollowUserOnSpotify(user.spotifyAccessToken, playlistObj.owner.id)} >
                <PersonAddDisabled />
              </MyButton>
              {window.innerWidth > 500 && (
              <Typography variant="body1">
                Unfollow {playlistObj.owner.id} on Spotify
              </Typography>
              )}
              </Box>
            ) : (
              <Box className={classes.spotifyButton}>
                <MyButton tip={`Follow ${playlistObj.owner.id} on Spotify`}  onClick={() => props.followUserOnSpotify(user.spotifyAccessToken, playlistObj.owner.id)}>
                  <PersonAdd />
                </MyButton>
                {window.innerWidth > 500 && (
                <Typography variant="body1">
                  Follow {playlistObj.owner.id} on Spotify
                </Typography>
                )}
              </Box>
            )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  ) : (
    <div></div>
  );
}

PlaylistHeader.propTypes = {

}

const mapStateToProps = state => ({
  user: state.user,
  playlistObj: state.spotify.playlist,
  playlistLoading: state.spotify.playlistLoading
})

const mapActionsToProps = {
    followPlaylistOnSpotify,
    unfollowPlaylistOnSpotify,
    followUserOnSpotify,
    unfollowUserOnSpotify
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PlaylistHeader))
