const { db } = require('../util/admin')

const getPlaylists = (req, res) => {
    db
        .collection('userPlaylists')
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
        .doc(`/userPlaylists/${playlistId}`)
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
                    playlistData.comments.push(doc.data())
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
        .collection('userPlaylists')
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

    db.doc(`/userPlaylists/${playlistId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: `Playlist not found`})
            }

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

const likeAPlaylist = (req, res) => {
    const { playlistId } = req.params
    const { spotifyUser, imageUrl } = req.user
    let playlistData;
    if (!playlistId || !spotifyUser) return res.status(400).json({ error: `${playlistId} || ${spotifyUser} Must not be empty`})

    const likeDocument = db.collection(`/likes`)
        .where('playlistId','==', playlistId)
        .where('spotifyUser','==',spotifyUser)
        .limit(1);
    const playlistDocument = db.doc(`playlists/${playlistId}`)

    playlistDocument.get()
        .then(doc => {
            if (doc.exists) {
                playlistData = doc.data()
                playlistData.playlistId = doc.id;
                return likeDocument.get()
            } else {
                return res.status(404).json({ error: `Playlist not found`})
            }
        })
        .then(data => {
            if (data.empty) {
                const like = {
                    playlistId,
                    spotifyUser,
                    likedAt: new Date().toISOString()
                }
                return db.collection(`likes`)
                    .add(like)
                    .then(doc => {
                        playlistData.likeCount++;
                        return res.status(200).json({ message: `Playlist liked successfully`})
                    })
                    .catch(likedPlaylistError => {
                        console.error(JSON.stringify(likedPlaylistError))
                    })

            }
                    return res.status(404).json({ error: `There is no playlist with that ID`})
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
        })
        .catch(getLikeError => {
            console.error({error: getLikeError})
            res.status(500).json({ error: `Something went wrong.`})
        })

    
}

const unlikeAPlaylist = (req, res) => {

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
        .collection('userPlaylists')
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

module.exports = { getPlaylists, getPlaylist, addPlaylist, deletePlaylist, commentOnPlaylist, likeAPlaylist, unlikeAPlaylist }