import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'


const Link = require('react-router-dom').Link

const Navbar = (props) => {
    return (
        <AppBar>
            <Toolbar>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                {props.user ? (
                    <Button color="inherit" component={Link} to="/profile">Profile</Button>
                ) : null}
            </Toolbar>
        </AppBar>
    )
}

export default Navbar