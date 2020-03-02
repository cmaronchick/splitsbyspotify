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
    if (!props.playlist) {
        return (<div></div>)
    }
    const { classes, playlist : { name, images, id, owner } } = props
    console.log('images', images)
    return (
        <Card className={classes.card}>
            {images && images.length > 0 ? (
            <CardMedia
            image={`${images[0].url}`}
            title={`${name}`}
            className={classes.image}
            />
            ) : null}
            <CardContent className={classes.content}>
                <Typography variant="h5" color="primary" value={id} component={Link} to={`/playlist/${id}`}>{owner ? owner.id : null}</Typography>
                {/* <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography> */}
                <Typography variant="body1" value={name}>{name}</Typography>
            </CardContent>
        </Card>
    )
}

export default withStyles(styles)(PlaylistPreview)