import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import ky from 'ky'

import PlaylistPreview from '../components/PlaylistPreview'

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
                    <PlaylistPreview playlist={playlist} key={playlist.id} />
                )
            })
        ) : (
            <div>Loading...</div>
        )
        return (
            <Grid container spacing={2}>
                <Grid item sm={8} xs={12}>
                    <div className="playlist-container">
                        {recentPlaylistsMarkup}
                    </div>
                </Grid>
                <Grid item sm={4} xs={12}>
                    <div className="splits-container">
                        Content...
                    </div>
                </Grid>
            </Grid>
        )
    }
}

export default Home