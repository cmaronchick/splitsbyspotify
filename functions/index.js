const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')
const { db } = require('./util/admin')

const app = require('express')();

const {getPlaylists, getPlaylist, deletePlaylist, addPlaylist, commentOnPlaylist, deleteCommentOnPlaylist, likeAPlaylist, unlikeAPlaylist} = require('./handlers/playlists')
const {
    signUp,
    login,
    uploadImage,
    getAuthenticatedUser,
    addUserDetails,
    getUserDetails,
    spotifyLogin,
    markNotificationsAsRead } = require('./handlers/users')
const { getSpotifyClientToken } = require('./handlers/spotify')
const {FBAuth} = require('./util/FBAuth')
const {errors} = require('./handlers/errors')



// Playlist Routes
app.get('/playlists', getPlaylists)
app.post('/playlists', FBAuth, addPlaylist, errors)
app.get('/playlists/:playlistId', getPlaylist, errors)
app.delete('/playlists/:playlistId', FBAuth, deletePlaylist, errors)
app.post('/playlists/:playlistId/like', FBAuth, likeAPlaylist)
app.delete('/playlists/:playlistId/like', FBAuth, unlikeAPlaylist)
app.post('/playlists/:playlistId/comment', FBAuth, commentOnPlaylist, errors)
app.delete('/playlists/:playlistId/comment/:commentId', FBAuth, deleteCommentOnPlaylist)

// User Route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user', FBAuth, addUserDetails)
app.get('/user/:spotifyUser', getUserDetails, errors)
app.post('/notifications', FBAuth, markNotificationsAsRead)

// Spotify
app.post('/spotifyLogin', getSpotifyClientToken, spotifyLogin)


exports.api = functions.https.onRequest(app);

exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(error => console.error({error}))
    })
exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/playlists/${snapshot.data().playlistId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().spotifyUser !== snapshot.data().spotifyUser) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    playlistId: doc.id,
                    type: 'like',
                    read: false
                })
            }
            throw new Error('Document does not exist');
        })
        .catch(error => console.error({error}))
    })

exports.createNotificationsOnComment = functions.region('us-central1').firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/playlists/${snapshot.data().playlistId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().spotifyUser !== snapshot.data().spotifyUser) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    playlistId: doc.id,
                    type: 'comment',
                    read: false
                })
            }
            throw new Error('No snapshot found');
        })
        .catch(error => console.error({error}))
    })

exports.onUserImageChange = functions.region('us-central1').firestore.document(`/users/{userId}`)
    .onUpdate((change) => {
        console.log(change.before.data())
        console.log(change.after.data())
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
        console.log('image has changed')
        const batch = db.batch();
        return db.collection('playlists')
            .where('spotifyUser', '==', change.before.data().spotifyUser)
            .get()
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        const playlist = db.doc(`/playlists/${doc.id}`)
                        batch.update(playlist, {
                            userImage: change.after.data().imageUrl
                        })
                    })
                }
                return batch.commit();
            })
            .catch(error => console.error(error))
        }
        return false;
    })

exports.onPlaylistDelete = functions.region('us-central1').firestore.document(`/playlists/{playlistId}`)
    .onDelete((snapshot, context) => {
        const playlistId = context.params.playlistId
        const batch = db.batch();
        return db.collection('comments')
            .where('playlistId', '==', playlistId)
            .get()
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        batch.delete(`/comments/${doc.id}`)
                    })
                }
                return db.collection('likes')
                    .where('playlistId','==', playlistId)
                    .get()
            })
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        batch.delete(`/likes/${doc.id}`)
                    })
                }
                return db.collection('notifications')
                    .where('playlistId','==', playlistId)
                    .get()
            })
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        batch.delete(`/notifications/${doc.id}`)
                    })
                }                
                return batch.commit()
            })
            .catch(error => console.error(error))
        })