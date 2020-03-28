import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

//MUI Stuff
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'
//Icons
import LocationOn from '@material-ui/icons/LocationOn'
import CalendarToday from '@material-ui/icons/CalendarToday'
import EditIcon from '@material-ui/icons/Edit'
import KeyboardReturn from '@material-ui/icons/KeyboardReturn'
import LinkIcon from '@material-ui/icons/Link'

// Redux stuff
import {connect} from 'react-redux'
import { logout, uploadImage } from '../redux/actions/userActions'

import MyButton from '../util/MyButton'
import EditDetails from '../components/profile/EditDetails'

const styles = {
    profile: {
        '& .image-wrapper': {
            textAlign: 'center',
            position: 'relative',
            '& button': {
            position: 'absolute',
            top: '80%',
            left: '70%'
            }
        },
        '& .profile-image': {
            width: 200,
            height: 200,
            objectFit: 'cover',
            maxWidth: '100%',
            borderRadius: '50%'
        },
        '& .profile-details': {
            textAlign: 'center',
            '& span, svg': {
            verticalAlign: 'middle'
            },
            '& a': {
            color: '#00bcd4'
            }
        },
        '& hr': {
            border: 'none',
            margin: '0 0 10px 0'
        },
        '& svg.button': {
            '&:hover': {
            cursor: 'pointer'
            }
        }
    },
    paper: {
        padding: 20
    },
    button: {
        float: 'right'
    }
}


const Profile = (props) => {
    const { classes, user: {loading, authenticated, spotifyUser, FBUser }}  = props
    console.log('!spotifyUser || !FBUser || !FBUser.user', loading)
    if (!spotifyUser || !FBUser || (!FBUser.user && !FBUser.credentials)) {
        return loading ? (
            <div>Loading ...</div>
            ) : (
            <div>Please log in again.</div>
        )
    }
    const handleImageChange = (event) => {
        const image = event.target.files[0]
        let formData = new FormData()
        formData.append('image', image, image.name);
        props.uploadImage(formData)
    }
    const handleEditPicture = () => {
        const fileInput = document.getElementById('imageInput')
        fileInput.click();
    }

    const handleLogout = () => {
        this.props.logout()
    }
    const { photoURL, imageURL, stravaProfile, bio, location, createdAt } = FBUser.credentials ? FBUser.credentials : FBUser.user ? FBUser.user : { photoURL: null}
    const { display_name, id } = spotifyUser
    let profileMarkup = !loading ? (authenticated ? (
        <Paper className={classes.paper}>
            <div className={classes.profile}>
                <div className='image-wrapper'>
                    <img src={imageURL ? imageURL : photoURL ? photoURL : `https://firebasestorage.googleapis.com/v0/b/splitsbyspotify.appspot.com/o/blank-profile-picture.png?alt=media&token=a78e5914-43fd-4e0b-b22e-0ae216ad19c4`} alt={display_name} className='profile-image'/>
                    <input type='file' hidden='hidden' id='imageInput' onChange={handleImageChange}/>
                    
                    <MyButton tip="Edit Profile Picture" 
                        placement="top"
                        onClick={handleEditPicture}
                        btnClassName='button'>
                            <EditIcon color="primary" />
                    </MyButton>
                </div>
                <hr />
                <div className='profile-details'>
                    <MuiLink component={Link} to={`/users/${id}`} color="primary" variant="h5">
                        @{id}
                    </MuiLink>
                    
                    {bio && <Typography variant="body2">{bio}</Typography>}
                    <hr />
                    {location && (
                        <Fragment>
                        <LocationOn color="primary" /> <span>{location}</span>
                        <hr />
                        </Fragment>
                    )}
                    {stravaProfile && (
                        <Fragment>
                        <LinkIcon color="primary" />
                        <a href={stravaProfile} target="_blank" rel="noopener noreferrer">
                            {' '}
                            Strava Profile
                        </a>
                        <hr />
                        </Fragment>
                    )}
                    <CalendarToday color="primary" />{' '}
                    <span>Joined {dayjs(createdAt).format('MMM YYYY')}</span>
                </div>
                <MyButton tip="Logout" 
                    placement="top"
                    onClick={handleLogout}
                    btnClassName='button'>
                        <KeyboardReturn color="primary" />
                </MyButton>
                <EditDetails />
            </div>


        </Paper>) : (
            <Paper className={classes.paper}>
            <Typography variant="body2" align="center">
                No profile found, please login again
            </Typography>
            <div className={classes.buttons}>
                <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/login"
                >
                Login
                </Button>
                <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/signup"
                >
                Signup
                </Button>
            </div>
            </Paper>
        )) : (
        <div>
            
        </div>
    )
    return profileMarkup;
}

const mapStateToProps = (state) => ({
    user: state.user
})

const mapActionsToProps = {
    uploadImage,
    logout
}

Profile.propTypes = {
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile))
