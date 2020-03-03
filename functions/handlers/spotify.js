//const rp = require('request-promise')
const ky = require('ky/umd')
const {spotifyConfig} = require('../util/config')

    // your application requests authorization
    const { client_id, client_secret } = spotifyConfig

    //console.log(`new Buffer.from(client_id + ':' + client_secret).toString('base64'): ${new Buffer.from(client_id + ':' + client_secret).toString('base64')}`);
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
    // request.post(authOptions, (error, res, body) => {
    //     if (!error && res.statusCode === 200) {
    //         console.log('spotifyResponse', res.body)
    //         //return res.json()
            
    //         req.spotifyToken = body.access_token
    //         return next()
    //     }
        
    // })
    const searchParams = new URLSearchParams();
    searchParams.set('grant_type', 'client_credentials')
    ky.post(authOptions.uri, {
        headers: authOptions.headers,
        body: searchParams
    })
    .then(kyResponse => {
        return kyResponse.json()
    })
    .then(kyJson => {
        console.log({kyJson})
        req.spotifyToken = kyJson.access_token;
        return next();
    })
    .catch(kyError => {
        console.error({kyError});
    })
    // rp(authOptions)
    // .then(spotifyResponse => {
    //     const spotifyJson = JSON.parse(spotifyResponse)
    //     console.log('spotifyJson:', spotifyJson)
    //     req.spotifyToken = spotifyJson.access_token;
    //     return next()
    // })
    // .catch(getSpotifyTokenError => {
    //     console.log('getSpotifyTokenError', getSpotifyTokenError)
    //     res.status(500).json({ getSpotifyTokenError})
    // })
}

module.exports = { getSpotifyClientToken }