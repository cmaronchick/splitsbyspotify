const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')

const app = require('express')();

const {getPlaylists, getPlaylist, deletePlaylist, addPlaylist, commentOnPlaylist} = require('./handlers/playlists')
const {signUp, login, uploadImage, getAuthenticatedUser, addUserDetails, spotifyLogin } = require('./handlers/users')
const { getSpotifyClientToken } = require('./handlers/spotify')
const {FBAuth} = require('./util/FBAuth')



// Playlist Routes
app.get('/playlists', getPlaylists)
app.post('/playlists', FBAuth, addPlaylist)
app.get('/playlists/:playlistId', getPlaylist)
app.delete('/playlists/:playlistId', deletePlaylist)
app.post('/playlists/:playlistId/like', FBAuth, likeAPlaylist)
app.post('/playlists/:playlistId/unlike', FBAuth, unlikeAPlaylist)
// TODO: Unlike a playlist

// User Route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user', FBAuth, addUserDetails)

// Spotify
app.post('/spotifyLogin', getSpotifyClientToken, spotifyLogin)


exports.api = functions.https.onRequest(app);