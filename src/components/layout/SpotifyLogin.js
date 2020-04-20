import React, { Fragment } from 'react'
import withStyles from '@material-ui/core/styles/withStyles'

import {connect} from 'react-redux'
import { login, logout } from '../../redux/actions/userActions'

import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
    spotifyUser: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '0 15px'
    },
    progress: {
        color: '#fff'
    }
}

const SpotifyLogin = (props) => {
    const { classes, user, user: {loading} } = props
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin()
    }
    const handleSpotifyLogout = () => {
        props.logout()
    }
    return user && user.authenticated ? (
        <div className={classes.spotifyUser}>
            <Fragment>
                {loading ? (
                    <CircularProgress size={30} className={classes.progress} />
                ) : user.spotifyUser && user.spotifyUser.id && (
                    <Link to="/Profile">
                        <Typography variant="h3" color="primary" value={`${user.spotifyUser.id}`}>{user.spotifyUser.id}</Typography>
                    </Link>
                )}
                <Button variant="contained" color="default" onClick={() => handleSpotifyLogout()}>Logout</Button>
            </Fragment>
        </div>
    ) : user.tourCompleted && (
        <div className={classes.spotifyUser}>
            <Button className={classes.spotifyLoginButton} variant="contained" color="primary" onClick={() => handleSpotifyLogin()}>
            {loading ? (
                    <CircularProgress size={30} className={classes.progress} />
                ) : (
                    <span>Login to Spotify</span>
                )}
            </Button>
        </div>
    )
}

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
})

const mapActionsToProps = {
    login,
    logout
}

export default connect(
    mapStateToProps,
    mapActionsToProps,
)(withStyles(styles)(SpotifyLogin))