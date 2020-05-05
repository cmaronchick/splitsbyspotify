import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

import SpotifyImage from '../images/Spotify_Icon_RGB_Green.png'

//MUI Stuff
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'
import CircularProgress from '@material-ui/core/CircularProgress'
//Icons
import LocationOn from '@material-ui/icons/LocationOn'
import CalendarToday from '@material-ui/icons/CalendarToday'
import EditIcon from '@material-ui/icons/Edit'
import LinkIcon from '@material-ui/icons/Link'

// Redux stuff
import {connect} from 'react-redux'
import { logout, uploadImage, login } from '../redux/actions/userActions'

import MyButton from '../util/MyButton'
import EditDetails from '../components/profile/EditDetails'
import ProfileSkeleton from '../util/ProfileSkeleton'

const styles = (theme) => ({
    ...theme.spreadThis,
    paper: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        float: 'right',
    },
    spotifyLoginButton: {
        margin: '0 auto',
    },
})


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

    const { photoURL, imageURL, stravaProfile, bio, location, createdAt } = FBUser.credentials ? FBUser.credentials : FBUser.user ? FBUser.user : { photoURL: null}
    const { display_name, id, external_urls } = spotifyUser
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
                    <MuiLink component={Link} to={`/user/${id}`} color="primary" variant="h5">
                        @{id}
                    </MuiLink>
                    {external_urls && external_urls.spotify && (
                        <a href={external_urls.spotify} target="_blank" rel="noopener noreferrer" color="primary" variant="h5">
                            <img src={SpotifyImage} alt="View on Spotify" className={classes.spotifyIcon} style={{marginLeft: 10}} />
                        </a>
                    )}
                    
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
                        <a href={stravaProfile} target="_blank" rel="noopener noreferrer">
                        <LinkIcon color="primary" />
                            {' '}
                            Strava Profile
                        </a>
                        <hr />
                        </Fragment>
                    )}
                    <Fragment>
                        <CalendarToday color="primary" /> {' '}
                        <span>Joined {dayjs(createdAt).format('MMM YYYY')}</span>
                    </Fragment>
                    <hr />
                    <EditDetails />
                </div>
            </div>


        </Paper>) : (
            <Paper className={classes.paper}>
            <Typography variant="h3" align="center">
                User Profile
            </Typography>
            <Typography variant="body2" align="center">
                No profile found, please login again
            </Typography>
            <Button className={classes.spotifyLoginButton} variant="contained" color="primary" onClick={() => props.handleSpotifyLogin()}>
            {loading ? (
                    <CircularProgress size={30} className={classes.progress} />
                ) : (
                    <span>Login to Spotify</span>
                )}
            </Button>
            </Paper>
        )) : (
            <ProfileSkeleton />
        )
    return profileMarkup;
}

const mapStateToProps = (state) => ({
    user: state.user
})

const mapActionsToProps = {
    uploadImage,
    login,
    logout
}

Profile.propTypes = {
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile))
