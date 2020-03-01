import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = {
    card: {
        display: 'flex',
        paddingHorizontal: 5,
        marginBottom: 20,
    },
    image: {
        minWidth: 200,
        objectFit: 'cover'
    },
    content: {
        padding: 25
    }
}

const PlaylistPreview = (props) => {
    dayjs.extend(relativeTime)

    const { classes, playlist : { playlistName, createdAt, userImage, playlistId, likeCount, commentCount, spotifyUser } } = props
    return (
        <Card className={classes.card}>
            <CardMedia
            image={`${userImage}`}
            title={`${playlistName}`}
            className={classes.image}
            />
            <CardContent className={classes.content}>
                <Typography variant="h5" color="primary" value={spotifyUser} component={Link} to={`/playlist/${playlistId}`}>{spotifyUser}</Typography>
                <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography>
                <Typography variant="body1" value={playlistName}>{playlistName}</Typography>
            </CardContent>
        </Card>
    )
}

export default withStyles(styles)(PlaylistPreview)