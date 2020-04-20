const { db } = require('../util/admin')

const getPlaylists = (req, res) => {
    db
        .collection('playlists')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let playlists = []
            data.docs.forEach(doc => {
                let playlist = doc.data()
                playlists.push({
                    firebasePlaylistId: doc.id,
                    ...playlist
                })
            })
            // console.log('playlists', playlists)
            return res.status(200).json(playlists)
        })
        .catch(getPlaylistsError => {
            console.error(getPlaylistsError)
            req.error = getPlaylistsError
            return next()
        })
}

const getMyPlaylists = (req, res, next) => {
    db
        .collection('playlists')
        .where('spotifyUser','==',req.user.spotifyUser)
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let playlists = []
            data.docs.forEach(doc => {
                let playlist = doc.data()
                playlists.push({
                    id: doc.id,
                    ...playlist
                })
            })
            return res.status(200).json(playlists)
        })
        .catch(getPlaylistsError => {
            console.error(getPlaylistsError)
            req.error = getPlaylistsError
            return next()
        })
}

const getPlaylist = (req, res, next) => {
    let playlistData = {};
    const { firebasePlaylistId } = req.params;

    if (!firebasePlaylistId) {
        return res.status(500).json({ error: 'No playlist id provided'})
    }

    return db
        .doc(`/playlists/${firebasePlaylistId}`)
        .get()
        .then(doc => {
            console.log(doc.exists)
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: 'No playlist found' }))
            }
            playlistData = doc.data()
            playlistData.firebasePlaylistId = doc.id;
            return db.collection('comments')
            .where('firebasePlaylistId', '==', firebasePlaylistId)
            .orderBy('createdAt', 'asc')
            .get()
        })
        .then(data => {
            playlistData.comments = []
            if (data.docs && data.docs.length > 0) {
                data.forEach(doc => {
                    const commentData = doc.data()
                    commentData.id = doc.id
                    playlistData.comments.push(commentData)
                })
            }
            return res.status(200).json({message: 'Playlist retrieved successfully', playlistData})
        })
        .catch(getPlaylistError => {
            console.error('getPlaylistError: ', getPlaylistError.message)
            req.error = getPlaylistError;
            return next()
        })
}

const deletePlaylist = (req, res, next) => {
    console.log('req.body', req.params)
    const { firebasePlaylistId } = req.params;
    const playlistDoc = db.doc(`/playlists/${firebasePlaylistId}`)
    const batch = db.batch();

    if (!firebasePlaylistId) {
        throw new Error(JSON.stringify({ code: 500, message: 'No playlist id provided' }))
    }

    playlistDoc
    .get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, error: 'That playlist was not found.'}))
            }
            if (doc.data().spotifyUser !== req.user.spotifyUser) {
                throw new Error(JSON.stringify({ code: 403, error: 'User not authorized to delete that playlist.' }))
            }
            return playlistDoc.delete()
        })
        .then(doc => {
            console.log({doc})
            if (doc) {
                return res.status(200).json({message: 'Playlist deleted successfully'})
            } else {
                throw new Error(JSON.stringify({ code: 400, error: 'No playlist with that ID was found' }))
            }

        })
        .catch(getPlaylistError => {
            console.error({ getPlaylistError })
            req.error = getPlaylistError
            return next()
        })    
}

const commentOnPlaylist = (req, res) => {
    console.log('req.body', req.body)
    const { body } = JSON.parse(req.body)
    const { firebasePlaylistId } = req.params
    const { spotifyUser, photoURL } = req.user
    if (!firebasePlaylistId || !body || !spotifyUser) return res.status(400).json({ error: `${firebasePlaylistId} || ${body} || ${spotifyUser} Must not be empty`})
    if (body && body.trim() === '') return res.status(400).json({ error: `Comment must not be empty.`})
    const comment = {
        firebasePlaylistId,
        body,
        spotifyUser: spotifyUser,
        userImage: photoURL ? photoURL : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/blank-profile-picture.png?alt=media`,
        createdAt: new Date().toISOString()
    }

    return db.doc(`/playlists/${firebasePlaylistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({code: 404, message: `Playlist not found`}))
            }
            return doc.ref.update({ commentCount: doc.data().commentCount ? doc.data().commentCount++ : 1})
        })
        .then(() => {
            return db.collection('comments')
            .add(comment)
        })
        .then(doc => {
            return res.status(200).json({ message: `Comment ${doc.id} added successfully`, comment})
        })
        .catch(err => {
            console.error({err})
            req.error = err
            return next()
        })
}

const deleteCommentOnPlaylist = (req, res) => {
    const { firebasePlaylistId, commentId } = req.params
    const { spotifyUser } = req.user
    if (!firebasePlaylistId || !spotifyUser) return res.status(400).json({ error: `${firebasePlaylistId} || ${body} || ${spotifyUser} Must not be empty`})

    return db.doc(`/playlists/${firebasePlaylistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: `Playlist not found`}))
            }
            return doc.ref.update({ commentCount: doc.data().commentCount > 0 ? doc.data().commentCount-- : 0})
        })
        .catch(getPlaylistError => {
            console.error(getPlaylistError)
            return res.status(getPlaylistError && getPlaylistError.code ? getPlaylistError.code : 500).json({ error: `Error getting playlist ${getPlaylistError ? getPlaylistError.message : ''}`})
        })
        .then(() => {
            return db.doc(`/comments/${commentId}`)
            .delete()
        })
        .catch(deleteCommentError => {
            console.error({deleteCommentError})
            return res.status(500).json({ error: deleteCommentError })
        })
        .then(() => {
            return res.status(200).json({ message: `Comment deleted successfully`})
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({ message: 'Something went wrong'})
        })
}

const likeAPlaylist = (req, res) => {
    const { firebasePlaylistId } = req.params
    const { spotifyUser, photoURL } = req.user
    let playlistData;
    if (!firebasePlaylistId || !spotifyUser) return res.status(400).json({ error: `${firebasePlaylistId} || ${spotifyUser} Must not be empty`})

    const likeDocument = db.collection(`likes`)
        .where('firebasePlaylistId','==', firebasePlaylistId)
        .where('spotifyUser','==',spotifyUser)
        .limit(1);
    const playlistDocument = db.doc(`/playlists/${firebasePlaylistId}`)

    // Get Playlist
    return playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.firebasePlaylistId = doc.id;
                // Get the like by user for the playlist
                return likeDocument.get()
            } else {
                //Return 404 if Playlist does not exist
                throw new Error(JSON.stringify({code: 404, message: `Playlist not found`}))
            }
        })
        // .catch(getPlaylistErrorObject => {
        //     const getPlaylistError = JSON.parse(getPlaylistErrorObject.message)
        //     console.error(getPlaylistError)
        //     return res.status(getPlaylistError && getPlaylistError.code ? getPlaylistError.code : 500).json({ error: `something went wrong ${getPlaylistError ? getPlaylistError.message : ''}`})
        // })
        .then(data => {
            // If the user has not liked the playlist continue
            if (data.empty) {
                const like = {
                    firebasePlaylistId,
                    spotifyUser,
                    createdAt: new Date().toISOString()
                }
                return db.collection(`likes`).add(like)
            }
            // Return error message that they playlist is already liked
            // console.log({data})
            throw new Error(JSON.stringify({ code: 400, message: `You have already liked that playlist.`}))
        })
        .then(() => {
            playlistData.likeCount++;
            return playlistDocument.update({ likeCount: playlistData.likeCount })
        })
        .then(() => {
            return res.status(200).json(playlistData)
        })
        .catch(errObject => {
            const err = errObject && errObject.message ? JSON.parse(errObject.message) : { code: 500, message: 'Something went wrong'}
            console.error(err)
            const { code, message } = err
            return res.status(code).json({ message: message})
        })
}

const unlikeAPlaylist = (req, res) => {
    const { firebasePlaylistId } = req.params
    const { spotifyUser, photoURL } = req.user
    let playlistData;
    if (!firebasePlaylistId || !spotifyUser) return res.status(400).json({ error: `${firebasePlaylistId} || ${spotifyUser} Must not be empty`})



    const unlikeDocument = db.collection('likes')
        .where('firebasePlaylistId','==', firebasePlaylistId)
        .where('spotifyUser','==',spotifyUser)
        .limit(1);
    const playlistDocument = db.doc(`/playlists/${firebasePlaylistId}`)

    // Get Playlist
    return playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.firebasePlaylistId = doc.id;
                // Get the like by user for the playlist
                return unlikeDocument.get()
            }
            //Return 404 if Playlist does not exist
            throw new Error(JSON.stringify({ code: 404, message: `Playlist not found`}))
        })
        .catch(getPlaylistError => {
            console.error('getPlaylistError229: ', getPlaylistError)
            return res.status(getPlaylistError && getPlaylistError.code ? getPlaylistError.code : 500).json({ error: `Error getting playlist ${getPlaylistError ? getPlaylistError.message : ''}`})
        })
        .then(data => {
            // If the user has not liked the playlist continue
            if (!data || !data.docs || data.docs.length === 0) {
                // Return error message that they playlist is not liked
                throw new Error(JSON.stringify({code: 400, message: `You have not liked that playlist.`}))
            }
            return db.doc(`/likes/${data.docs[0].id}`).delete()
        })
        .catch(likedPlaylistError => {
            console.error(JSON.stringify(likedPlaylistError))
            return res.status(likedPlaylistError && likedPlaylistError.code ? likedPlaylistError.code : 500).json({ error: likedPlaylistError ? likedPlaylistError.message : `Error getting playlist ${getPlaylistError}`})
        })
        .then(() => {
            playlistData.likeCount--;
            return playlistDocument.update({ likeCount: playlistData.likeCount })
        })
        .catch(playlistIncrementCount => {
            console.error({ playlistIncrementCount})
        })
        .then(() => {
            return res.status(200).json(playlistData)
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({ message: 'Something went wrong'})
        })
}

const addPlaylist = (req, res, next) => {
    const newPlaylist = {
        spotifyPlaylistId: req.body.spotifyPlaylistId,
        spotifyUser: req.user.spotifyUser,
        playlistName: req.body.playlistName,
        playlistImage: req.body.playlistImage,
        photoURL: req.user.photoURL,
        public: req.body.public ? req.body.public : false,
        collaborative: req.body.collaborative ? req.body.collaborative : false,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0

    }
    return db.collection(`playlists`)
        .where('spotifyPlaylistId','==',req.body.spotifyPlaylistId)
        .get()
    .then(playlistDocs => {
            if (playlistDocs.docs && playlistDocs.docs.length === 0) {
                console.log('newPlaylist', newPlaylist)
                return db
                    .collection('playlists')
                    .add(newPlaylist)
            } else {
                return res.json( { message: `Playlist ${req.body.spotifyPlaylistId} already exists`})
            }
        })
        .then(doc => {
            const resPlaylist = newPlaylist;
            resPlaylist.firebasePlaylistId = doc.id
            return res.json( { message: `document ${doc.id} created successfully`, playlist: resPlaylist})
        })
        .catch(addPlaylistError => {
            console.error(addPlaylistError)
            return res.status(500).json({ error: 'something went wrong'})
        })
}

const updatePlaylist = (req, res, next) => {
    console.log('req.body', req.body)
    const playlist = {
        spotifyPlaylistId: req.body.spotifyPlaylistId,
        spotifyUser: req.user.spotifyUser,
        playlistName: req.body.playlistName,
        playlistImage: req.body.playlistImage,
        public: req.body.public ? req.body.public : false,
        collaborative: req.body.collaborative ? req.body.collaborative : false,
        photoURL: req.user.photoURL,

    }
    return db.collection(`playlists`)
        .where('spotifyPlaylistId','==',req.body.spotifyPlaylistId)
        .get()
    .then(playlistDocs => {
            if (playlistDocs.docs && playlistDocs.docs.length > 0) {
                return db
                    .collection('playlists')
                    .update(playlist)
            }
                return res.status(404).json( { message: `Playlist not found`})
        })
        .then(doc => {
            const resPlaylist = newPlaylist;
            resPlaylist.firebasePlaylistId = doc.id
            return res.json( { message: `document ${doc.id} created successfully`, playlist: resPlaylist})
        })
        .catch(addPlaylistError => {
            console.error(addPlaylistError)
            return res.status(500).json({ error: 'something went wrong'})
        })
}

const followPlaylist = (req, res, next) => {
    console.log('req.body', req.body)
    const bodyJSON = req.body.firebasePlaylistId ? { body: req.body } : JSON.parse(req.body)
    console.log('bodyJSON', bodyJSON)
    const { spotifyPlaylistId, firebasePlaylistId, playlistName, playlistImage, collaborative } = bodyJSON.body
    const { spotifyUser } = req.user
    const playlist = {
        spotifyPlaylistId: spotifyPlaylistId,
        firebasePlaylistId: firebasePlaylistId,
        spotifyUser: spotifyUser,
        playlistName: playlistName,
        playlistImage: playlistImage,
        public: bodyJSON.body.public ? bodyJSON.body.public : false,
        collaborative: collaborative ? collaborative : false,
    }
    console.log('playlist', playlist, firebasePlaylistId)
    return db.doc(`/playlists/${firebasePlaylistId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: 'Playlist not found.' }))
            }
            firebasePlaylist = doc.data()
            if (firebasePlaylist.spotifyUser === spotifyUser) {
                throw new Error(JSON.stringify({ code: 500, message: 'You cannot follow a playlist that you own.' }))
            }
            if (firebasePlaylist.followers && firebasePlaylist.followers[spotifyUser]) {
                throw new Error(JSON.stringify({ code: 500, message: 'You have already followed this playlist.' }))
            }

            const followers = firebasePlaylist.followers ? {...firebasePlaylist.followers} : {}
            followers[spotifyUser] = {
                followedAt: new Date().toISOString(),
                userImage: req.user.photoURL ? req.user.photoURL : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/blank-profile-picture.png?alt=media`,
            }
            return db.doc(`/playlists/${firebasePlaylistId}`).update({
                followers
            })
        })
        .then(() => {
            console.log('spotifyUser', spotifyUser)

            return db.doc(`/users/${spotifyUser}`).get()
        })
        .then(userDoc => {
            if (!userDoc.exists) {
                throw new Error(JSON.stringify({ code: 500, message: 'Something went wrong.' }))
            }
            const user = userDoc.data()
            let followedPlaylists = user.followedPlaylists ? {...user.followedPlaylists} : {}
            if (followedPlaylists[firebasePlaylistId]) {
                throw new Error(JSON.stringify({ code: 500, message: 'You already followed this playlist.' }))
            }
            followedPlaylists[firebasePlaylistId] = playlist
            return db.doc(`/users/${spotifyUser}`).update({
                followedPlaylists
            })
        })
        .then(() => {
            return res.status(200).json({ message: 'Playlist followed successfully'})
        })
        .catch(followPlaylistError => {
            console.log('error', followPlaylistError)
            req.error = followPlaylistError
            return next()
        })

}

const unfollowPlaylist = (req, res, next) => {
    console.log('req.body', req.body)
    const bodyJSON = req.body.firebasePlaylistId ? { body: req.body } : JSON.parse(req.body)
    // const bodyJSON = {body: req.body}
    const { firebasePlaylistId } = bodyJSON.body
    const { spotifyUser } = req.user
    return db.doc(`/playlists/${firebasePlaylistId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: 'Playlist not found.' }))
            }
            firebasePlaylist = doc.data()
            if (firebasePlaylist.spotifyUser === spotifyUser) {
                throw new Error(JSON.stringify({ code: 500, message: 'You cannot unfollow a playlist that you own.' }))
            }
            if (firebasePlaylist.followers && !firebasePlaylist.followers[spotifyUser]) {
                throw new Error(JSON.stringify({ code: 500, message: 'You are not following this playlist.' }))
            }

            const followers = firebasePlaylist.followers ? {...firebasePlaylist.followers} : {}
            delete followers[spotifyUser]
            return db.doc(`/playlists/${firebasePlaylistId}`).update({
                followers
            })
        })
        .then(() => {
            console.log('spotifyUser', spotifyUser)

            return db.doc(`/users/${spotifyUser}`).get()
        })
        .then(userDoc => {
            if (!userDoc.exists) {
                throw new Error(JSON.stringify({ code: 500, message: 'Something went wrong.' }))
            }
            const user = userDoc.data()
            let followedPlaylists = {...user.followedPlaylists}
            if (!followedPlaylists[firebasePlaylistId]) {
                throw new Error(JSON.stringify({ code: 500, message: 'You are not following this playlist.' }))
            }
            delete followedPlaylists[firebasePlaylistId]
            return db.doc(`/users/${spotifyUser}`).update({
                followedPlaylists: {...followedPlaylists}
            })
        })
        .then(() => {
            return res.status(200).json({ message: 'Playlist unfollowed successfully'})
        })
        .catch(unfollowPlaylistError => {
            console.log('error', unfollowPlaylistError)
            req.error = unfollowPlaylistError
            return next()
        })
}

module.exports = { getPlaylists, getMyPlaylists, getPlaylist, addPlaylist, deletePlaylist, updatePlaylist, followPlaylist, unfollowPlaylist, commentOnPlaylist, deleteCommentOnPlaylist, likeAPlaylist, unlikeAPlaylist }