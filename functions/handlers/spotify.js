const rp = require('request-promise')
const {spotifyConfig} = require('../util/config')


    // your application requests authorization
    const { client_id, client_secret } = spotifyConfig
    var authOptions = {
        method: 'POST',
        uri: 'https://accounts.spotify.com/api/token',
        headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {grant_type: 'client_credentials'}
    };

getSpotifyClientToken = (req, res, next) => {
    console.log('authOptions.headers', authOptions.headers, 'authOptions.url: ', authOptions.url)
    // request.post(authOptions, (error, res, body) => {
    //     if (!error && res.statusCode === 200) {
    //         console.log('spotifyResponse', res.body)
    //         //return res.json()
            
    //         req.spotifyToken = body.access_token
    //         return next()
    //     }
        
    // })
    rp(authOptions)
    .then(spotifyResponse => {
        const spotifyJson = JSON.parse(spotifyResponse)
        console.log('spotifyJson:', spotifyJson)
        req.spotifyToken = spotifyJson.access_token;
        return next()
    })
    .catch(getSpotifyTokenError => {
        console.log('getSpotifyTokenError', getSpotifyTokenError)
        res.status(500).json({ getSpotifyTokenError})
    })
}

module.exports = { getSpotifyClientToken }