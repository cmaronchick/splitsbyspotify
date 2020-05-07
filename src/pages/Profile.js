import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

import SpotifyImage from '../images/Spotify_Icon_RGB_Green.png'
import PlaylistPreview from '../components/playlists/PlaylistPreview'

//MUI Stuff
import Grid from '@material-ui/core/Grid'
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

import { likePlaylist, unlikePlaylist, toggleCommentsDialog} from '../redux/actions/spotifyActions'

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
    let userDetails = FBUser.credentials ? FBUser.credentials : FBUser.user ? FBUser.user : { photoURL: null}
    if (props.selectedUser && props.selectedUser !== spotifyUser.id && props.user.profile && !loading) {
        userDetails = props.user.profile
        userDetails.id = props.user.profile.spotifyUser
        userDetails.external_urls = {
            spotify: `https://open.spotify.com/user/${props.user.profile.spotifyUser}`
        }
    }
    console.log('userDetails', userDetails)

    const { photoURL, imageURL, stravaProfile, bio, location, createdAt } = userDetails
    const { display_name, id, external_urls } = props.selectedUser && props.selectedUser !== spotifyUser.id ? userDetails : spotifyUser
    const {playlists} = props.selectedUser && props.selectedUser !== spotifyUser.id ? userDetails : FBUser
    let profileMarkup = !loading ? (authenticated ? (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                    <div className={classes.profile}>
                        <div className='image-wrapper'>
                            <img src={imageURL ? imageURL : photoURL ? photoURL : `https://firebasestorage.googleapis.com/v0/b/splitsbyspotify.appspot.com/o/blank-profile-picture.png?alt=media&token=a78e5914-43fd-4e0b-b22e-0ae216ad19c4`} alt={display_name} className='profile-image'/>
                            <input type='file' hidden='hidden' id='imageInput' onChange={handleImageChange}/>
                            {!(props.selectedUser !== spotifyUser.id) && (
                                <MyButton tip="Edit Profile Picture" 
                                    placement="top"
                                    onClick={handleEditPicture}
                                    btnClassName='button'>
                                        <EditIcon color="primary" />
                                </MyButton>
                            )}
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
                            {!(props.selectedUser !== spotifyUser.id) && (
                                <EditDetails />
                            )}
                        </div>
                    </div>


                </Paper>
            </Grid>
            <Grid item xs={12} sm={8}>
                {playlists === undefined ? (
                    <CircularProgress size={30} />
                ) : playlists && Object.keys(playlists).length > 0 ? (
                    Object.keys(playlists).map(playlistId => {
                        return (
                            <PlaylistPreview
                            playlist={playlists[playlistId]}
                            id={playlistId}
                            key={playlistId}
                            handleLikePlaylist={props.likePlaylist}
                            handleUnlikePlaylist={props.unlikePlaylist}
                            handleShowCommentsDialog={props.toggleCommentsDialog}/>
                        )
                    })
                ) : (
                    <Typography variant="body1" color="inherit">You have no playlists yet. Add some of yours from Spotify or browse other users' playlists.</Typography>
                )}
            </Grid>
        </Grid>) : (
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
    logout,
    likePlaylist,
    unlikePlaylist,
    toggleCommentsDialog
}

Profile.propTypes = {
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile))
