import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import ky from 'ky'

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            playlists: null
        }
    }
    async componentDidMount() {
        try {
            let playlists = await ky.get('/playlists').json()
            this.setState({
                playlists: playlists
            })  
        } catch(error) {
            console.error(error)   
        }
    }
    render() {
        let recentPlaylistsMarkup = this.state.playlists ? (
            this.state.playlists.map(playlist => {
                return (
                    <div key={playlist.playlistId}>
                        {playlist.playlistName} | {playlist.spotifyUser}</div>
                )
            })
        ) : (
            <div>Loading...</div>
        )
        return (
            <Grid container spacing={8}>
                <Grid item sm={8} xs={12}>
                    {recentPlaylistsMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <div>
                        Content...
                    </div>
                </Grid>
            </Grid>
        )
    }
}

export default Home