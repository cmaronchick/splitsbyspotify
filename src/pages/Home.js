import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles'
import ky from 'ky/umd'

import PlaylistPreview from '../components/PlaylistPreview'
import Typography from '@material-ui/core/Typography'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'

// Redux
import { connect } from 'react-redux'

const styles = {
    container: {
        padding: '0 15px'
    }
}

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            allPlaylists: props.allPlaylists,
            myPlaylists: props.myPlaylists,
            handleAddPlaylistClick: props.handleAddPlaylistClick,
            handleRemovePlaylistClick: props.handleRemovePlaylistClick,
            handleGetPlaylistTracks: props.handleGetPlaylistTracks,
            handleConfirmDeletePlaylist: props.handleConfirmDeletePlaylist,
            handleShowConfirmDeleteDialog: props.handleShowConfirmDeleteDialog,
            handleHideConfirmDeleteDialog: props.handleHideConfirmDeleteDialog,
            showConfirmDeleteDialog: props.showConfirmDeleteDialog,
            confirmDeletePlaylistName: props.confirmDeletePlaylistName,
            confirmDeletePlaylistId: props.confirmDeletePlaylistId

        }
    }
    async componentDidMount() {
        try {
            let playlists = this.props.playlists ? this.props.playlists : await ky.get('/playlists').json()
            this.setState({
                playlists: playlists
            })  
        } catch(error) {
            console.error(error)   
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allPlaylists !== this.props.allPlaylists) {
          this.setState({
            allPlaylists: this.props.allPlaylists
          })
        }
        if (prevProps.myPlaylists !== this.props.myPlaylists) {
          this.setState({
            myPlaylists: this.props.myPlaylists
          })
        }
    }

    render() {
        let recentPlaylistsMarkup = (playlists) => playlists ? (
            Object.keys(playlists).map(playlistId => {
                return (
                    <PlaylistPreview
                     playlist={playlists[playlistId]}
                     id={playlistId}
                     key={playlistId}
                     handleAddPlaylistClick={this.state.handleAddPlaylistClick}
                     handleGetPlaylistTracks={this.state.handleGetPlaylistTracks}
                     handleShowConfirmDeleteDialog={this.state.handleShowConfirmDeleteDialog}
                     handleHideConfirmDeleteDialog={this.state.handleHideConfirmDeleteDialog}/>
                )
            })
        ) : (
            <div>You have no playlists.</div>
        )
        return (
            <Grid container spacing={2} className={this.props.classes.container}>
                <Grid item sm={6} xs={12}>
                    <Typography variant="h4" value="All Playlists">All Playlists</Typography>
                    <div className="playlist-container">
                        {recentPlaylistsMarkup(this.props.allPlaylists)}
                    </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Typography variant="h4" value="All Playlists">My Running Playlists</Typography>
                    <div className="playlist-container">
                        {recentPlaylistsMarkup(this.props.myPlaylists)}
                    </div>
                </Grid>

                <ConfirmDeleteDialog
                 open={this.props.showConfirmDeleteDialog}
                 playlistName={this.props.confirmDeletePlaylistName}
                 playlistId={this.props.confirmDeletePlaylistId}
                 handleConfirmDeletePlaylist={this.props.handleConfirmDeletePlaylist}
                 onClose={this.props.handleHideConfirmDeleteDialog}/>
            </Grid>
        )
    }
}

export default withStyles(styles)(Home)