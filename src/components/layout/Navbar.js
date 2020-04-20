import React, { Fragment} from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import HomeIcon from '@material-ui/icons/Home'
import Notifications from './Notifications'

import MyButton from '../../util/MyButton'

// Redux 
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core'

const Link = require('react-router-dom').Link

const styles = (theme) => ({
        ...theme.spreadThis
    });


const Navbar = (props) => {
    const {authenticated} = props
    return (
        <AppBar>
            <Toolbar className="nav-container">
                <Button color="inherit" component={Link} to="/">My Playlists</Button>
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
                        <Button color="inherit" component={Link} to="/profile">Profile</Button>
                    </Fragment>
                )}
                <Button color="inherit" component={Link} to="/Playlists">Browse Playlists</Button>
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

export default connect(mapStateToProps)(withStyles(styles)(Navbar))