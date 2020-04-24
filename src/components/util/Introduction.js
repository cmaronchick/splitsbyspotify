import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { handleSpotifyLogin } from '../../redux/actions/userActions'

import withStyles from '@material-ui/core/styles/withStyles'

import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import Timer from '@material-ui/icons/Timer'
import LockOpen from '@material-ui/icons/LockOpen'
import AddCircle from '@material-ui/icons/AddCircle'

import { connect } from 'react-redux'

const styles = (theme) => ({
    ...theme.spreadThis,
})

const Introduction = props => {
    const { classes } = props
    return (
        <Fragment>
            <Typography variant="h2" color="secondary" className={classes.pageTitle}>
                Welcome to Splits By Spotify!
            </Typography>

            <div className={`${classes.textField} ${classes.introText} introText`}>
            <div className="introBox">
                <Typography variant="h5">
                    Ever wanted to know what song should be playing when you hit a certain mile marker? Then <span className="bold-text">Splits By Spotify</span> is the app for you.
                </Typography>
            </div>
            <div>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <Typography variant="body1">
                                <LockOpen />
                            </Typography>
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body1">
                            Log In to Spotify to view your playlists.
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography variant="body1">
                                <AddCircle />
                            </Typography>
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body1">
                                Add your Spotify playlists to Your Splits Playlists
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Typography variant="body1">
                                <Timer />
                            </Typography>
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body1">
                                Select your distance and target pace to see which song is playing at each mile marker
                            </Typography>
                        </ListItemText>
                    </ListItem>
                </List>
            <Button className={classes.spotifyLoginButton} variant="contained" color="primary" onClick={() => props.handleSpotifyLogin()}>
            {props.user.loading ? (
                    <CircularProgress size={30} className={classes.progress} />
                ) : (
                    <Typography variant="body1">
                        Login to Spotify
                    </Typography>
                )}
            </Button>
            </div>
        </div>
        </Fragment>
    )
}

Introduction.propTypes = {

}

const mapStateToProps = (state) => ({
    user: state.user,
})

const mapActionsToProps = {
    handleSpotifyLogin
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Introduction))
