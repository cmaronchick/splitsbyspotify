const { db } = require('../util/admin')

const getPlaylists = (req, res) => {
    db
        .collection('playlists')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let playlists = []
            data.forEach(document => {
                playlists.push({
                    playlistId: document.id,
                    spotifyUser: document.data().spotifyUser,
                    createdAt: document.data().createdAt
                })
            })
            return res.json(playlists)
        })
        .catch(getPlaylistsError => {
            console.error(getPlaylistsError)
        })
}

const getPlaylist = (req, res) => {
    let playlistData = {};
    const { playlistId } = req.params;

    if (!playlistId) {
        return res.status(500).json({ error: 'No playlist id provided'})
    }

    return db
        .doc(`/playlists/${playlistId}`)
        .get()
        .then(doc => {
            console.log(doc.exists)
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: 'No playlist found' }))
            }
            playlistData = doc.data()
            playlistData.playlistId = doc.id;
            return db.collection('comments')
            .where('playlistId', '==', playlistId)
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
        .catch(getPlaylistErrorObject => {
            const getPlaylistError = JSON.parse(getPlaylistErrorObject.message)
            console.error('getPlaylistError: ', getPlaylistError.message)
            return res.status(getPlaylistError.code ? getPlaylistError.code : 500).json({ error: getPlaylistError.message ? getPlaylistError.message : 'Something went wrong getting that playlist'})
        })
}

const deletePlaylist = (req, res) => {
    console.log('req.body', req.params)
    const { playlistId } = req.params;
    const playlistDoc = db.doc(`/playlists/${playlistId}`)

    if (!playlistId) {
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
        .catch(deletePlaylistErrorObject => {
            const deletePlaylistError = JSON.parse(deletePlaylistErrorObject.message)
            console.error(`${deletePlaylistError.message}`)
            return res.status(500).json({ error: deletePlaylistError})
        })
        .catch(getPlaylistError => {
            console.error({ getPlaylistError })
            return res.status(500).json({ error: 'Something went wrong getting that playlist.'})
        })    
}

const commentOnPlaylist = (req, res) => {
    const { body } = JSON.parse(req.body)
    const { playlistId } = req.params
    const { spotifyUser, imageUrl } = req.user
    if (!playlistId || !body || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${body} || ${spotifyUser} Must not be empty`})
    if (body && body.trim() === '') return res.status(400).json({ error: `Comment must not be empty.`})
    const comment = {
        playlistId,
        body,
        spotifyUser: spotifyUser,
        userImage: imageUrl ? imageUrl : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/blank-profile-picture.png?alt=media`,
        createdAt: new Date().toISOString()
    }

    return db.doc(`/playlists/${playlistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({code: 404, message: `Playlist not found`}))
            }
            return doc.ref.update({ commentCount: doc.data().commentCount ? doc.data().commentCount++ : 1})
        })
        .catch(getPlaylistError => {
            console.error({getPlaylistError})
            return res.status(500).json({ error: `Error getting playlist ${getPlaylistError}`})
        })
        .then(() => {
            return db.collection('comments')
            .add(comment)
        })
        .catch(addCommentError => {
            console.error({addCommentError})
            return res.status(500).json({ error: addCommentError })
        })
        .then(doc => {
            return res.status(200).json({ message: `Comment ${doc.id} added successfully`, comment: doc})
        })
        .catch(err => {
            console.error({err})
            return res.status(500).json({ error: 'Something went wrong'})
        })
}

const deleteCommentOnPlaylist = (req, res) => {
    const { playlistId, commentId } = req.params
    const { spotifyUser } = req.user
    if (!playlistId || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${body} || ${spotifyUser} Must not be empty`})

    return db.doc(`/playlists/${playlistId}`).get()
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
    const { playlistId } = req.params
    const { spotifyUser, imageUrl } = req.user
    let playlistData;
    if (!playlistId || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${spotifyUser} Must not be empty`})

    const likeDocument = db.collection(`likes`)
        .where('playlistId','==', playlistId)
        .where('spotifyUser','==',spotifyUser)
        .limit(1);
    const playlistDocument = db.doc(`/playlists/${playlistId}`)

    // Get Playlist
    return playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.playlistId = doc.id;
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
                    playlistId,
                    spotifyUser,
                    likedAt: new Date().toISOString()
                }
                return db.collection(`likes`).add(like)

            }
            // Return error message that they playlist is already liked
            console.log({data})
            throw new Error(JSON.stringify({ code: 400, message: `You have already liked that playlist.`}))
        })
        .then(() => {
            playlistData.likeCount++;
            return playlistDocument.update({ likeCount: playlistData.likeCount })
        })
        .then(() => {
            return res.status(200).json({ message: 'Like added successfully'})
        })
        .catch(errObject => {
            const err = errObject && errObject.message ? JSON.parse(errObject.message) : { code: 500, message: 'Something went wrong'}
            console.error(err)
            const { code, message } = err
            return res.status(code).json({ message: message})
        })
}

const unlikeAPlaylist = (req, res) => {
    const { playlistId } = req.params
    const { spotifyUser, imageUrl } = req.user
    let playlistData;
    if (!playlistId || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${spotifyUser} Must not be empty`})

    
    console.log('spotifyUser', spotifyUser);
    console.log('playlistId', playlistId);

    const unlikeDocument = db.collection('likes')
        .where('playlistId','==', playlistId)
        .where('spotifyUser','==',spotifyUser)
        .limit(1);
    const playlistDocument = db.doc(`/playlists/${playlistId}`)

    // Get Playlist
    return playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.playlistId = doc.id;
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
            return res.status(200).json({ message: 'Like removed successfully'})
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({ message: 'Something went wrong'})
        })

}

const addPlaylist = (req, res) => {
    const newPlaylist = {
        playlistName: req.body.playlistName,
        playlistId: req.body.playlistId,
        spotifyUser: req.body.spotifyUser,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0

    }
    db
        .collection('playlists')
        .add(newPlaylist)
        .then(document => {
            const resPlaylist = newPlaylist;
            resPlaylist.playlistId = doc.id
            return res.json( { message: `document ${document.id} created successfully`, playlist: resPlaylist})
        })
        .catch(addPlaylistError => {
            console.error(addPlaylistError)
            return res.status(500).json({ error: 'something went wrong'})
        })
}

module.exports = { getPlaylists, getPlaylist, addPlaylist, deletePlaylist, commentOnPlaylist, deleteCommentOnPlaylist, likeAPlaylist, unlikeAPlaylist }