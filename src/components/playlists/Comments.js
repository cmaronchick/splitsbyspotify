import React,{ Fragment }  from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import dayjs from 'dayjs'
//MUI Stuff

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'

import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

import PostComment from './PostComment'
import { clearErrors } from '../../redux/actions/spotifyActions'
import { DialogTitle } from '@material-ui/core';

const styles = (theme) => ({
    ...theme.spreadThis,
    commentsContainer: {
        position: 'relative',
        padding: 5
    },
    commentImage: {
        maxWidth: '100%',
        height: 100,
        objectFit: 'cover',
        borderRadius: '50%'
    },
    commentData: {
        marginLeft: 20
    },
    closeIcon: {
        position: 'absolute',
        left: '95%',
        top: '5%'
    }
})

const Comments = (props) => {
    
    const handleClose = () => {
        props.onClose()
    }

    const { open, playlistName, spotifyPlaylistId, firebasePlaylistId, classes, user, playlistLoading } = props
    const {comments} = props.playlist
        return (
        <Dialog open={open}>
            <DialogTitle title={`${playlistName} Comments`} />
            <DialogContent>
                <Grid container className={classes.commentsContainer}>
                    <CloseIcon className={classes.closeIcon} onClick={handleClose} />
                    {playlistLoading ? (
                        <CircularProgress />
                    ) : (
                        <Fragment>
                            {user.authenticated && (
                                <PostComment firebasePlaylistId={firebasePlaylistId}  />
                            )}
                            {comments && comments.length > 0 && comments.map((comment, index) => {
                                const { body, createdAt, userImage, spotifyUser } = comment
                                return (
                                    <Fragment key={createdAt}>

                                        <Grid item sm={12}>
                                            <Grid container className={classes.commentsContainer}>
                                                <Grid item sm={2}>
                                                    <img src={userImage} className={classes.commentImage} alt={spotifyUser} />
                                                </Grid>
                                                <Grid item sm={9}>
                                                    <div className={classes.commentData}>
                                                        <Typography
                                                            variant="h5"
                                                            component={Link}
                                                            to={`/user/${spotifyUser}`}
                                                            color="primary">
                                                                {spotifyUser}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2" color="inherit">
                                                                {dayjs(createdAt).format('h:mm a, MMMM DD YYYY')}
                                                            </Typography>
                                                        <hr className={classes.invisibleSeparator}/>
                                                        <Typography variant="body1">{body}</Typography>
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Fragment>
                                )
                            })}
                        </Fragment>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
        )
}

Comments.propTypes = {
    comments: PropTypes.array.isRequired

}

const mapActionsToProps = {
    clearErrors: () => clearErrors()
}

const mapStateToProps = (state) => ({
    user: state.user,
    playlist: state.spotify.playlist,
    comments: state.spotify.playlist ? state.spotify.playlist.comments : [],
    playlistLoading: state.spotify.playlistLoading
})

export default connect(mapStateToProps, null)(withStyles(styles)(Comments))
