const functions = require('firebase-functions');
const admin = require('firebase-admin')
const serviceAccount = require('../../splitsbyspotify-firebase-adminsdk-xkg5z-2a806dd006.json')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://splitsbyspotify.firebaseio.com"
  });

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

const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('No Token found')
        return res.status(403).json({ error: 'Unauthorized'})
    }
    admin.auth().verifyIdToken(idToken)
        .then(DecodedIdToken => {
            req.user = DecodedIdToken;
            
            console.log({reqUser: req.user.uid})
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user.spotifyUser = data.docs[0].data().spotifyUser
            return next();
        })
        .catch(DecodedIdTokenError => {
            console.error({ DecodedIdTokenError })
            return res.status(403).json(DecodedIdTokenError)
        })
}

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


app.post('/playlists', FBAuth, (req, res) => {
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

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) {
        return true;
    } else {
        return false;
    }
}

const isEmpty = (string) => {
    if (!string || string.trim() === '') {
        return true;
    } else {
        return false;
    }
}


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

    let errors = {};

    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }

    if (isEmpty(newUser.password)) {
        errors.password = 'Must not be empty'
    }

    if (newUser.password !== newUser.confirmPassword) {
        errors.password = 'Passwords must match'
    }

    if (isEmpty(spotifyUser)) {
        errors.spotifyUser = 'Spotify username must not be empty'
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors)
    }

    // TODO Validate data
    
    let token, user;
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
            user = data.user
            console.log('data', data.user ?+ data.user : data.statusCode)
            return data.user ? data.user.getIdToken() : null
        })
        .then (IdToken => {
            if (IdToken) {
                token = IdToken;
                const userCredentials = {
                    spotifyUser: newUser.spotifyUser,
                    email: newUser.email,
                    createdAt: new Date().toISOString(),
                    userId: user.uid
                }
                return db.doc(`/users/${newUser.spotifyUser}`).set(userCredentials);
            }
            return null

        })
        .then(() => {
            if (user) {
                return res.status(201).json({ message: `user ${user.uid} signed up successfully`, token })
            }
            return 
        })
        .catch((signupError) => {
            console.error(signupError)
            if (signupError.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' })                
            }
            return res.status(500).json({ error: signupError.code})
        })    
})

app.post('/login', (req, res) => {
    const bodyJSON = JSON.parse(req.body)
    const user = {
        email: bodyJSON.email,
        password: bodyJSON.password
    }
    let errors = {};
    
    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty'
    }
    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty'
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({errors})
    }

    const { email, password } = user

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(data => {
        return data.user.getIdToken()
    })
    .then(token => {
        return res.json({token})
    })
    .catch(loginError => {
        if (loginError.code === 'auth/wrong-password' || loginError.code === 'auth/user-not-found') {
            return res.status(403).json({general: 'Wrong credentials. Please try again.'})
        } else {
            return res.status(500).json({error: loginError.code})
        }
    })
})

exports.api = functions.https.onRequest(app);