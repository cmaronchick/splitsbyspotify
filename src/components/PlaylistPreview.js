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
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'

const styles = {
    card: {
        display: 'flex',
        paddingHorizontal: 5,
        marginBottom: 20,
        flexDirection: 'column'
    },
    image: {
        minWidth: 200,
        minHeight: 200,
        objectFit: 'cover'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 25
    }
}


const PlaylistPreview = (props) => {
    const handleAddPlaylistClick = (playlistId) => {
        props.handleAddPlaylistClick(playlistId)
    }
    const showConfirmDeleteDialog = (playlistId, playlistName) => {
        console.log('playlistId, playlistName', playlistId, playlistName)
        props.handleShowConfirmDeleteDialog(playlistId, playlistName)
    }
    dayjs.extend(relativeTime)
    if (!props.playlist) {
        return (<div></div>)
    }
    const { classes, playlist : { name, images, id, owner, collaborative, inMyPlaylists, href } } = props
    const fbId = props.id
    const publicPlaylist = props.public
    return (
        <Card className={classes.card}>
            <Link to={`/playlist/${id}`} onClick={() => props.handleGetPlaylistTracks(props.playlist)}>
            <CardHeader
            title={name}

            action={ inMyPlaylists ? (
                <IconButton aria-label="settings"  onClick={() => showConfirmDeleteDialog(fbId, name)}>
                    <RemoveCircle/>
                </IconButton>
                ) : (
                <IconButton aria-label="settings"  onClick={() => handleAddPlaylistClick(id)}>
                    <AddCircle/>
                </IconButton>
                )
            }
            />
            </Link>
            <CardContent className={classes.content}>
                
                {images && images.length > 0 ? (
                <CardMedia
                image={`${images[0].url}`}
                title={`${name}`}
                className={classes.image}
                />
                ) : null}
                {/* <Typography variant="h5" color="primary" value={id} component={Link} to={`/playlist/${id}`}>{owner ? owner.id : null}</Typography> */}
                {/* <Typography variant="body2" value={createdAt}>{dayjs(createdAt).fromNow()}</Typography> */}
                <Typography variant="body1" value={name}>{name}</Typography>
            </CardContent>
        </Card>
    )
}

export default withStyles(styles)(PlaylistPreview)