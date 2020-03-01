import React from 'react'
import ky from 'ky';

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

    const getHashParams = (hashParamsString) => {
        if (!hashParamsString) {
            return false;
        }
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = hashParamsString.substring(1);
        while ( e === r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

//   var userProfileSource = document.getElementById('user-profile-template').innerHTML,
//       userProfileTemplate = Handlebars.compile(userProfileSource),
//       userProfilePlaceholder = document.getElementById('user-profile');

//   var oauthSource = document.getElementById('oauth-template').innerHTML,
//       oauthTemplate = Handlebars.compile(oauthSource),
//       oauthPlaceholder = document.getElementById('oauth');

  

const SpotifyLogin = (props) => {
    
    const handleSpotifyLogin = () => {
        props.handleSpotifyLogin()
    }
    return props.spotifyUser ? (
        <Typography variant="h3" color="primary" value={`${props.spotifyUser.id}`}>{props.spotifyUser.id}</Typography>
    ) : (
        <Button onClick={() => handleSpotifyLogin()}>Login to Spotify</Button>
    )
}

export default SpotifyLogin