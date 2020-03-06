import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import ky from 'ky/umd'

import PlaylistPreview from '../components/PlaylistPreview'
import Typography from '@material-ui/core/Typography'


class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            allPlaylists: props.allPlaylists,
            myPlaylists: props.myPlaylists,
            handleAddPlaylistClick: props.handleAddPlaylistClick,
            handleRemovePlaylistClick: props.handleRemovePlaylistClick
        }
    }
    async componentDidMount() {
        console.log('this.props.playlists', this.props.playlists)
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
                    <PlaylistPreview playlist={playlists[playlistId]} key={playlistId} handleAddPlaylistClick={this.state.handleAddPlaylistClick} handleRemovePlaylistClick={this.state.handleRemovePlaylistClick} />
                )
            })
        ) : (
            <div>You have no playlists.</div>
        )
        return (
            <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                    <Typography variant="h3" value="All Playlists">All Playlists</Typography>
                    <div className="playlist-container">
                        {recentPlaylistsMarkup(this.props.allPlaylists)}
                    </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Typography variant="h3" value="All Playlists">My Running Playlists</Typography>
                    <div className="playlist-container">
                        {recentPlaylistsMarkup(this.props.myPlaylists)}
                    </div>
                </Grid>
            </Grid>
        )
    }
}

export default Home