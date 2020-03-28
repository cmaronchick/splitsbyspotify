import React, { Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import HomeIcon from '@material-ui/icons/Home'
import NotificationsIcon from '@material-ui/icons/Notifications'

import MyButton from '../../util/MyButton'

// Redux 
import { connect } from 'react-redux'
import { makeStyles, withStyles } from '@material-ui/core'

const Link = require('react-router-dom').Link

const styles = (theme) => ({
        ...theme.spreadThis
    });


const Navbar = (props) => {
    const {authenticated} = props
    return (
        <AppBar>
            <Toolbar className="nav-container">
                <Button color="inherit" component={Link} to="/">Home</Button>
                {!authenticated ? (
                    <Fragment>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                    </Fragment>
                ) : (
                    <Fragment>
                        <MyButton tip="Add a Playlist">
                            <AddIcon />
                        </MyButton>
                        <Link to="/">
                            <HomeIcon color="primary"/>
                        </Link>
                        <MyButton tip="Notifications">
                            <NotificationsIcon />
                        </MyButton>
                        <Button color="inherit" component={Link} to="/profile">Profile</Button>
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

export default connect(mapStateToProps)(withStyles(styles)(Navbar))