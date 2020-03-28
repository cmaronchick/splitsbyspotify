import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'

//MUI Stuff
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import MuiLink from '@material-ui/core/Link'

//MUI Stuff
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'
//Icons
import LocationOn from '@material-ui/icons/LocationOn'
import CalendarToday from '@material-ui/icons/CalendarToday'
import LinkIcon from '@material-ui/icons/Link'

// Redux stuff
import {connect} from 'react-redux'

const styles = {
  paper: {
    padding: 20
  }
};

Profile = (props) => {
    const { classes, user: {credentials: {spotifyUser, createdAt, photoURL, }} } = props
    let profileMarkup = !loading ? (authenticated ? (
        <Paper className={classes.paper}>
            <div className={classes.profile}>
                <div className='profile-image'>
                    <img src={photoURL} alt={display_name} />
                </div>
                <hr />
                <div className='profile-details'>
                    <MuiLink component={Link} to={`/users/${spotifyUser}`} color="primary" variant="h5">
                        @{spotifyUser}
                    </MuiLink>
                </div>
            </div>

        </Paper>) : (<div />)) : (
        <div>
            
        </div>
    )
    return profileMarkup;
}

const mapStateToProps = (state) => {
    user: state.user
}

Profile.propTypes = {
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(withStyles(styles)(Profile))
