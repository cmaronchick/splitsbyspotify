import React from 'react'
import PropTypes from 'prop-types'

import NoImg from '../images/noImg.png'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'

//MUI Stuff
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'
//Icons
import LocationOn from '@material-ui/icons/LocationOn'
import CalendarToday from '@material-ui/icons/CalendarToday'
import LinkIcon from '@material-ui/icons/Link'

import withStyles from '@material-ui/core/styles/withStyles'

const styles = (theme) => ({
    ...theme.spreadThis
})

const ProfileSkeleton = props => {
    const { classes } = props
    return (
        <Paper className={classes.paper}>
            <div className={classes.profile}>
                <div className='image-wrapper'>
                    <img src={NoImg} alt="Profile" className='profile-image'/>
                </div>
                <hr />
                <div className='profile-details'>
                    <div className={classes.skeletonSpotifyUser}></div>
                    <hr />
                    <div className={classes.skeletonFullLine}></div>
                    <div className={classes.skeletonFullLine}></div>
                    <hr />
                    <LocationOn color="primary" /> <div className={classes.skeletonHalfLine}></div>
                    <LinkIcon color="primary" />
                    <div className={classes.skeletonHalfLine}></div>
                    <hr />
                    <CalendarToday color="primary" />{' '}
                    <div className={classes.skeletonDate}></div>
                </div>
            </div>


        </Paper>

    )
}

ProfileSkeleton.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ProfileSkeleton)
