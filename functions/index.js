const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')

const app = require('express')();

const {getPlaylists, getPlaylist, deletePlaylist, addPlaylist, commentOnPlaylist, deleteCommentOnPlaylist, likeAPlaylist, unlikeAPlaylist} = require('./handlers/playlists')
const {signUp, login, uploadImage, getAuthenticatedUser, addUserDetails, spotifyLogin } = require('./handlers/users')
const { getSpotifyClientToken } = require('./handlers/spotify')
const {FBAuth} = require('./util/FBAuth')



// Playlist Routes
app.get('/playlists', getPlaylists)
app.post('/playlists', FBAuth, addPlaylist)
app.get('/playlists/:playlistId', getPlaylist)
app.delete('/playlists/:playlistId', deletePlaylist)
app.post('/playlists/:playlistId/like', FBAuth, likeAPlaylist)
app.delete('/playlists/:playlistId/like', FBAuth, unlikeAPlaylist)
app.post('/playlists/:playlistId/comment', FBAuth, commentOnPlaylist)
app.delete('/playlists/:playlistId/comment/:commentId', FBAuth, deleteCommentOnPlaylist)

// User Route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user', FBAuth, addUserDetails)

// Spotify
app.post('/spotifyLogin', getSpotifyClientToken, spotifyLogin)


exports.api = functions.https.onRequest(app);