const functions = require('firebase-functions');
const admin = require('firebase-admin')

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello world");
});

exports.getPlayLists = functions.https.onRequest((request, response) => {
    admin.firestore().collection('userPlaylists').get()
        .then(data => {
            let playlists = []
            data.forEach(document => {
                playlists.push(document.data())
            })
            return response.json(playlists)
        })
        .catch(getPlaylistsError => {
            console.error(getPlaylistsError)
        })
})


exports.addPlaylist = functions.https.onRequest((request, response) => {
    console.log(`Received ${JSON.parse(request.body.tracks)}`)
    if (request.method !== 'POST') {
        return response.status(400).json({ error: "Method not allowed"})
    }
    let tracks = []
    let tracksJSON = JSON.parse(JSON.parse(request.body.tracks));
    const newPlaylist = {
        playListName: request.body.playListName,
        tracks: tracksJSON,
        spotifyUser: request.body.spotifyUser,
        dateAdded: admin.firestore.Timestamp.fromDate(new Date())
    }
    admin.firestore().collection('userPlaylists').add(newPlaylist)
        .then(document => {
            return response.json( { message: `document ${document.id} created successfully`})
        })
        .catch(addPlaylistError => {
            console.error(addPlaylistError)
            return response.status(500).json({ error: 'something went wrong'})
        })
})