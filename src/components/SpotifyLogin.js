import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles'

import {connect} from 'react-redux'
import { login, logout } from '../redux/actions/userActions'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const styles = {
    spotifyUser: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '0 15px'
    }
}

const SpotifyLogin = (props) => {
    const { classes, user } = props
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin()
    }
    const handleSpotifyLogout = () => {
        props.logout()
    }
    return user && user.spotifyUser ? (
        <div className={classes.spotifyUser}>
            <Typography variant="h3" color="primary" value={`${user.spotifyUser.id}`}>{user.spotifyUser.id}</Typography>
            <Button variant="contained" color="default" onClick={() => handleSpotifyLogout()}>Logout</Button>
        </div>
    ) : (
        <div className={classes.spotifyUser}>
            <Button variant="contained" color="primary" onClick={() => handleSpotifyLogin()}>Login to Spotify</Button>
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