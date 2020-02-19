const ky = require('ky/umd')
const {spotifyConfig} = require('../util/config')


    // your application requests authorization
    const { client_id, client_secret } = spotifyConfig
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
        grant_type: 'client_credentials'
        },
        json: true
    };

getSpotifyClientToken = (req, res, next) => {
    console.log('authOptions.headers', authOptions.headers, 'authOptions.url: ', authOptions.url)
    ky.post(authOptions.url, {
        headers: authOptions.headers
    })
    .then(res => {
        console.log('spotifyResponse', res.status)
        return res.json()
    })
    .then(token => {
        req.spotifyToken = token
        return next()
    })
    .catch(getSpotifyTokenError => {
        console.log('getSpotifyTokenError', getSpotifyTokenError)
        res.status(500).json({ getSpotifyTokenError})
    })
}

module.exports = { getSpotifyClientToken }