const functions = require('firebase-functions');
const { config, spotifyConfig } = require('./util/config')
const { db } = require('./util/admin')

const cors = require('cors')
const app = require('express')();
app.use(cors())

const {
    getPlaylists,
    getMyPlaylists,
    getPlaylist,
    getPlaylistBySpotifyId,
    deletePlaylist,
    addPlaylist,
    updatePlaylist,
    commentOnPlaylist,
    deleteCommentOnPlaylist,
    likeAPlaylist,
    unlikeAPlaylist,
    followPlaylist,
    unfollowPlaylist} = require('./handlers/playlists')
const {
    signUp,
    login,
    uploadImage,
    getAuthenticatedUser,
    addUserDetails,
    getUserDetails,
    saveSplits,
    deleteSplits,
    spotifyLogin,
    createFirebaseAccount,
    markNotificationsAsRead } = require('./handlers/users')
const { getSpotifyClientToken } = require('./handlers/spotify')
const {FBAuth} = require('./util/FBAuth')
const {errors} = require('./handlers/errors')



// Playlist Routes
app.get('/playlists', getPlaylists)
app.get('/playlists/my', FBAuth, getMyPlaylists, errors)
app.post('/playlists', FBAuth, addPlaylist, errors)
app.get('/playlists/spotify/:spotifyPlaylistId', getPlaylistBySpotifyId, errors)
app.get('/playlists/:firebasePlaylistId', getPlaylist, errors)
app.post('/playlists/:firebasePlaylistId', FBAuth, updatePlaylist, errors)
app.post('/playlists/:firebasePlaylistId/follow', FBAuth, followPlaylist, errors)
app.delete('/playlists/:firebasePlaylistId/follow', FBAuth, unfollowPlaylist, errors)
app.delete('/playlists/:firebasePlaylistId', FBAuth, deletePlaylist, errors)
app.post('/playlists/:firebasePlaylistId/like', FBAuth, likeAPlaylist)
app.delete('/playlists/:firebasePlaylistId/like', FBAuth, unlikeAPlaylist)
app.post('/playlists/:firebasePlaylistId/comment', FBAuth, commentOnPlaylist, errors)
app.delete('/playlists/:firebasePlaylistId/comment/:commentId', FBAuth, deleteCommentOnPlaylist)

// User Route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user', FBAuth, addUserDetails)
app.get('/user/:spotifyUser', getUserDetails, errors)
app.post('/user/:spotifyUser/splits', FBAuth, saveSplits, errors)
app.delete('/user/:spotifyUser/splits', FBAuth, deleteSplits, errors)
app.post('/notifications', FBAuth, markNotificationsAsRead)

// Spotify
app.post('/spotifyAnonymous', getSpotifyClientToken, spotifyLogin)
app.post('/spotifyLogin', createFirebaseAccount, errors)


exports.api = functions.https.onRequest(app);

exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(error => console.error({error}))
    })
exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        console.log('snapshot.data().firebasePlaylistId', snapshot.data())
        return db.doc(`/playlists/${snapshot.data().firebasePlaylistId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().spotifyUser !== snapshot.data().spotifyUser) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    firebasePlaylistId: doc.id,
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
        return db.doc(`/playlists/${snapshot.data().firebasePlaylistId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().spotifyUser !== snapshot.data().spotifyUser) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().spotifyUser,
                    sender: snapshot.data().spotifyUser,
                    firebasePlaylistId: doc.id,
                    type: 'comment',
                    read: false
                })
            }
            throw new Error('No snapshot found');
        })
        .catch(error => console.error({error}))
    })

exports.createNotificationsOnFollow = functions.region('us-central1').firestore.document(`/playlists/{firebasePlaylistId}`)
    .onUpdate((change) => {
        console.log(change.before.data())
        console.log(change.after.data())
        if (!change.before.data().firebaseFollowers || (Object.keys(change.before.data().firebaseFollowers).length < Object.keys(change.after.data().firebaseFollowers).length)) {
            // Filter only new users
            let oldFollowers = change.before.data().firebaseFollowers ? Object.keys(change.before.data().firebaseFollowers) : []
            let newFollowers = change.after.data().firebaseFollowers ? Object.keys(change.after.data().firebaseFollowers) : []
            console.log('oldFollowers, newFollowers', oldFollowers, newFollowers)
            let newFollowerKeys = newFollowers.filter(key => {
                return !oldFollowers[key]
            })
            console.log('newFollowerKeys', newFollowerKeys)


            return db.collection('notifications')
            .where('firebasePlaylistId','==',change.before.id)
            .where('type','==','follow')
            .where('sender','==',newFollowerKeys[0])
            .limit(1)
            .get()
            .then(documents => {
                console.log('documents', documents.empty)
                if (documents.empty) {
                    return db.collection(`notifications`).add({
                        createdAt: new Date().toISOString(),
                        recipient: change.before.data().spotifyUser,
                        sender: newFollowerKeys[0],
                        firebasePlaylistId: change.before.id,
                        type: 'follow',
                        read: false
                    })
                }
                console.log('user has already followed that playlist')
                return false
            })
        }
        console.log('no new followers')
        return false;
    })

exports.onUserImageChange = functions.region('us-central1').firestore.document(`/users/{userId}`)
    .onUpdate((change) => {
        if (change.before.data().photoURL !== change.after.data().photoURL) {
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
                            userImage: change.after.data().photoURL
                        })
                    })
                }
                return batch.commit();
            })
            .catch(error => console.error(error))
        }
        return false;
    })

exports.onPlaylistDelete = functions.region('us-central1').firestore.document(`/playlists/{firebasePlaylistId}`)
    .onDelete((snapshot, context) => {
        const firebasePlaylistId = context.params.firebasePlaylistId
        const batch = db.batch();
        return db.collection('comments')
            .where('firebasePlaylistId', '==', firebasePlaylistId)
            .get()
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        batch.delete(`/comments/${doc.id}`)
                    })
                }
                return db.collection('likes')
                    .where('firebasePlaylistId','==', firebasePlaylistId)
                    .get()
            })
            .then(data => {
                if (data && data.docs && data.docs.length > 0) {
                    data.docs.forEach(doc => {
                        batch.delete(`/likes/${doc.id}`)
                    })
                }
                return db.collection('notifications')
                    .where('firebasePlaylistId','==', firebasePlaylistId)
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