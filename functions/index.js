const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')

const app = require('express')();

const {getPlaylists, addPlaylist} = require('./handlers/playlists')
const {signUp, login, uploadImage, spotifyLogin } = require('./handlers/users')
const { getSpotifyClientToken } = require('./handlers/spotify')
const {FBAuth} = require('./util/FBAuth')

const ky = require('ky/umd')


// Playlist Routes
app.get('/playlists', getPlaylists)
app.post('/playlists', FBAuth, addPlaylist)

// User Route
app.post('/signup', signUp)
app.post('/login', login)



app.post('/spotifyLogin', getSpotifyClientToken, spotifyLogin)

app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.https.onRequest(app);