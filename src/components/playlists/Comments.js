import React,{ Component, Fragment }  from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import dayjs from 'dayjs'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { Link } from 'react-router-dom'

import { connect } from 'react-redux'


const styles = (theme) => ({
    ...theme.spreadThis,
    commentImage: {
        maxWidth: '100%',
        height: 100,
        objectFit: 'cover',
        borderRadius: '50%'
    },
    commentData: {
        marginLeft: 20
    }
})

const Comments = (props) => {
    const { classes, comments} = props
    return (
        <Grid container>
            {comments.map((comment, index) => {
                const { body, createdAt, userImage, spotifyUser } = comment
                return (
                    <Fragment key={createdAt}>
                        <Grid item sm={12}>
                            <Grid container>
                                <Grid item sm={2}>
                                    <img src={userImage} className={classes.commentImage} alt={spotifyUser} />
                                </Grid>
                                <Grid item sm={2}>
                                    <div className={classes.commentData}>
                                        <Typography
                                            variant="h5"
                                            component={Link}
                                            to={`/user/${spotifyUser}`}
                                            color="primary">
                                                {spotifyUser}
                                        </Typography>
                                        <Typography
                                            variant="body2" color="text">
                                                {dayjs(createdAt).format('h:mm a, MMMM DD YYYY')}
                                            </Typography>
                                        <hr className={classes.invisibleSeparator}/>
                                        <Typography variant="body">{body}</Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Fragment>
                )
            })}
        </Grid>
    )
}

Comments.propTypes = {
    comments: PropTypes.array.isRequired

}

export default withStyles(styles)(Comments)
