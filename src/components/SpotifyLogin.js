import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const SpotifyLogin = (props) => {
    
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin()
    }
    const handleSpotifyLogout = () => {
        props.handleSpotifyLogout()
    }
    return props.spotifyUser ? (
        <div className="spotifyUser">
            <Typography variant="h3" color="primary" value={`${props.spotifyUser.id}`}>{props.spotifyUser.id}</Typography>
            <Button onClick={() => handleSpotifyLogout()}>Logout</Button>
        </div>
    ) : (
        <Button onClick={() => handleSpotifyLogin()}>Login to Spotify</Button>
    )
}

export default SpotifyLogin