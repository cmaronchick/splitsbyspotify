import React, { Fragment} from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import HomeIcon from '@material-ui/icons/Home'
import Notifications from './Notifications'
import Logo from '../../images/favicon.png'

import MyButton from '../../util/MyButton'

// Redux 
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core'
import { handleSpotifyLogin } from '../../redux/actions/userActions'

const Link = require('react-router-dom').Link

const styles = (theme) => ({
        ...theme.spreadThis
    });


const Navbar = (props) => {
    const {authenticated} = props
    return (
        <AppBar>
            <Toolbar className="nav-container">
                <Link to="/">
                    <img src={Logo} alt="Splits by Spotify" style={{width: 50, height: 50}} />
                </Link>
                <Button color="inherit" component={Link} to="/">{window.innerWidth > 500 ? `My Playlists` : <HomeIcon />}</Button>
                <Button color="inherit" component={Link} to="/Playlists">Browse {window.innerWidth > 500 ? `Playlists` : `All`}</Button>
                {/* show Login button only if user is not authenticated */}
                {!authenticated ? (
                    <Fragment>
                        <Button color="inherit" onClick={() => props.handleSpotifyLogin()}>Login</Button>
                        {/* <Button color="inherit" component={Link} to="/signup">Sign Up</Button> */}
                    </Fragment>
                ) : (
                    <Fragment>
                        {/* <MyButton tip="Add a Playlist">
                            <AddIcon />
                        </MyButton> */}
                        <Notifications />
                        <Button color="inherit" component={Link} to="/Profile">Profile</Button>
                    </Fragment>
                )}
            </Toolbar>
        </AppBar>
    )
}

Navbar.propTypes = {
    authenticated: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated
})

const mapActionsToProps = {
    handleSpotifyLogin
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Navbar))