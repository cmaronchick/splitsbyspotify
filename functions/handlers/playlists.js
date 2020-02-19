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
                    playListId: document.id,
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

const addPlaylist = (req, res) => {
    const newPlaylist = {
        playListName: req.body.playListName,
        playlistId: req.body.playListId,
        spotifyUser: req.body.spotifyUser,
        dateAdded: new Date().toISOString()
    }
    db
        .collection('userPlaylists')
        .add(newPlaylist)
        .then(document => {
            return res.json( { message: `document ${document.id} created successfully`})
        })
        .catch(addPlaylistError => {
            console.error(addPlaylistError)
            return res.status(500).json({ error: 'something went wrong'})
        })
}

module.exports = { getPlaylists, addPlaylist }