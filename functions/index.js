const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')
const db = require('./util/admin')

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

exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch((deleteNotificationError) => {
                console.error({deleteNotificationError})
                return;
            })
    })
exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/playlists/${snapshot.data().playlistId}`)
        .get()
        .then(doc => {
            if(doc.exists) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    playlistId: doc.id,
                    type: 'like',
                    read: 'false'
                })
            }
            throw new Error('Document does not exist');
        })
        .catch(getSnapshotError => {
            console.error({getSnapshotError})
            return;
        })
        .then(() => {
            return
        })
        .catch(setNotificationError => {
            console.error({setNotificationError})
            return;
        })
    })

exports.createNotificationsOnComment = functions.region('us-central1').firestore.document('comment/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/playlists/${snapshot.data().playlistId}`)
        .get()
        .then(doc => {
            if(doc.exists) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    playlistId: doc.id,
                    type: 'comment',
                    read: 'false'
                })
            }
            throw new Error('No snapshot found');
        })
        .catch(getSnapshotError => {
            console.error({getSnapshotError})
            return;
        })
        .then(() => {
            return;
        })
        .catch(setNotificationError => {
            console.error({setNotificationError})
            return;
        })
    })