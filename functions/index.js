const functions = require('firebase-functions');
const admin = require('firebase-admin')

admin.initializeApp();

const app = require('express')();

const firebaseConfig = {
    apiKey: "AIzaSyCK1dEAcmsBzKiNlHoofD7deS-QM72j8tk",
    authDomain: "splitsbyspotify.firebaseapp.com",
    databaseURL: "https://splitsbyspotify.firebaseio.com",
    projectId: "splitsbyspotify",
    storageBucket: "splitsbyspotify.appspot.com",
    messagingSenderId: "883901252726",
    appId: "1:883901252726:web:8f3ef8d507d6135c730b57",
    measurementId: "G-W3GXM0GX38"
  };
  const firebase = require('firebase')
  firebase.initializeApp(firebaseConfig)

  const db = admin.firestore();


app.get('/playlists', (req, res) => {
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
})


app.post('/playlists', (req, res) => {
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
})

// Signup Route
app.post('/signup', (req, res) => {
    const body = JSON.parse(req.body)
    const { email, password, confirmPassword, spotifyUser } = body
    const newUser = {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        spotifyUser: spotifyUser,

    }

    // TODO Validate data
    
    
    db.doc(`/users/${newUser.spotifyUser}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ spotifyUser: 'this spotify user is already taken'})
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            return data.user.getIdToken();
        })
        .then (token => {
            return res.status(201).json({ message: `user ${data.user.uid} signed up successfully`, token })
        })
        .catch((signupError) => {
            console.error(signupError)
            return res.status(500).json({ error: signupError.code})
        })    
})

exports.api = functions.https.onRequest(app);