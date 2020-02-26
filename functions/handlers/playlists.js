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

    db
        .doc(`/playlists/${playlistId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({error: 'No playlist with that ID was found'})
            }
            playlistData = doc.data()
            playlistData.playlistId = doc.id;
            return db.collection('comments')
            .where('playlistId', '==', playlistId)
            .orderBy('createdAt', 'asc')
            .get()
            .then(data => {
                playlistData.comments = []
                data.forEach(doc => {
                    const commentData = doc.data()
                    commentData.id = doc.id
                    playlistData.comments.push(commentData)
                })
                res.status(200).json({message: 'Playlist retrieved successfully', playlistData})
            })
        })
        .catch(getPlaylistError => {
            console.error(`${getPlaylistError}`)
            return res.status(500).json({ error: getPlaylistError})
        })
}

const deletePlaylist = (req, res) => {
    console.log('req.body', req.params)
    const { playlistId } = req.params;

    if (!playlistId) {
        return res.status(500).json({ error: 'No playlist id provided'})
    }

    db
        .collection('playlists')
        .doc(playlistId)
        .delete()
        .then(doc => {
            console.log({doc})
            if (doc) {
                return res.status(200).json({message: 'Playlist deleted successfully'})
            } else {
                return res.status(400).json({error: 'No playlist with that ID was found'})
            }

        })
        .catch(deletePlaylistError => {
            console.error(`${deletePlaylistError}`)
            return res.status(500).json({ error: deletePlaylistError})
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

    db.doc(`/playlists/${playlistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: `Playlist not found`})
            }
            return doc.ref.update({ commentCount: doc.data().commentCount ? doc.data().commentCount++ : 1})
        })
        .then(() => {
            return db.collection('comments')
            .add(comment)
            .then(doc => {
                res.status(200).json({ message: `Comment ${doc.id} added successfully`, comment: doc})
            })
            .catch(addCommentError => {
                console.error({addCommentError})
                res.status(500).json({ error: addCommentError })
            })
        })
        .catch(getPlaylistError => {
            console.error(getPlaylistError)
            return res.status(500).json({ error: `Error getting playlist ${getPlaylistError}`})
        })
}

const deleteCommentOnPlaylist = (req, res) => {
    const { playlistId, commentId } = req.params
    const { spotifyUser } = req.user
    if (!playlistId || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${body} || ${spotifyUser} Must not be empty`})

    db.doc(`/playlists/${playlistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: `Playlist not found`})
            }
            return doc.ref.update({ commentCount: doc.data().commentCount > 0 ? doc.data().commentCount-- : 0})
        })
        .then(() => {
            return db.doc(`/comments/${commentId}`)
            .delete()
            .then(() => {
                res.status(200).json({ message: `Comment deleted successfully`})
            })
            .catch(deleteCommentError => {
                console.error({deleteCommentError})
                res.status(500).json({ error: deleteCommentError })
            })
        })
        .catch(getPlaylistError => {
            console.error(getPlaylistError)
            return res.status(500).json({ error: `Error getting playlist ${getPlaylistError}`})
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
    playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.playlistId = doc.id;
                // Get the like by user for the playlist
                return likeDocument.get()
            } else {
                //Return 404 if Playlist does not exist
                return res.status(404).json({ error: `Playlist not found`})
            }
        })
        .then(data => {
            if (!data || res.statusCode === 404) {
                return
            }
            // If the user has not liked the playlist continue
            if (data.empty) {
                const like = {
                    playlistId,
                    spotifyUser,
                    likedAt: new Date().toISOString()
                }
                return db.collection(`likes`)
                    .add(like)
                    .then(() => {
                        playlistData.likeCount++;
                        return playlistDocument.update({ likeCount: playlistData.likeCount })
                    })
                    .then(() => {
                        return res.status(200).json({ message: 'Like added successfully'})
                    })
                    .catch(likedPlaylistError => {
                        console.error(JSON.stringify(likedPlaylistError))
                    })

            }
            // Return error message that they playlist is already liked
            return res.status(400).json({ error: `You have already liked that playlist.`})
        })
        .catch(getPlaylistError => {
            console.log('res.status', res.statusCode)
            console.error('getPlaylistError174: ', getPlaylistError)
            if (!res.statusCode) {
                return res.status(500).json({ error: `something went wrong`})
            }
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
    playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.playlistId = doc.id;
                // Get the like by user for the playlist
                return unlikeDocument.get()
            }
            //Return 404 if Playlist does not exist
            return res.status(404).json({ error: `Playlist not found`})
        })
        .then(data => {
            // If the user has not liked the playlist continue
            if (!data || !data.docs || data.docs.length === 0) {
                if (res.statusCode === 404) {
                    return
                }
                // Return error message that they playlist is not liked
                return res.status(400).json({ error: `You have not liked that playlist.`})
            }
            console.log('${data.docs[0].data().id}', data.docs[0].id)
            return db.doc(`/likes/${data.docs[0].id}`)
                .delete()
                .then(() => {
                    playlistData.likeCount--;
                    return playlistDocument.update({ likeCount: playlistData.likeCount })
                })
                .then(() => {
                    res.status(200).json({ message: 'Like removed successfully'})
                })
                .catch(likedPlaylistError => {
                    console.error(JSON.stringify(likedPlaylistError))
                })
        })
        .catch(getPlaylistError => {
            console.error('getPlaylistError229: ', getPlaylistError)
            res.status(500).json({ error: `Error getting playlist ${getPlaylistError}`})
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