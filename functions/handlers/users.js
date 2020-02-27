const ky = require('ky/umd')

const { admin, db } = require('../util/admin')

const { config } = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const { generateRandomString } = require('../util/spotify')
const querystring = require('querystring')

const { validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators')


 const signUp = (req, res) => {
    const body = JSON.parse(req.body)
    const { email, password, confirmPassword, spotifyUser } = body
    const newUser = {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        spotifyUser: spotifyUser,
    }

    const {valid, errors} = validateSignUpData(newUser)

    if (!valid) {
        return res.status(400).json(errors)
    }

    // TODO Validate data
    
    let token, user;
    return db.doc(`/users/${newUser.spotifyUser}`).get()
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
            console.log('data', data.user ? data.user : data.statusCode)
            return data.user ? data.user.getIdToken() : null
        })
        .then (IdToken => {
            if (IdToken) {
                const userImage = 'blank-profile-picture.png';
                token = IdToken;
                const userCredentials = {
                    spotifyUser: newUser.spotifyUser,
                    email: newUser.email,
                    createdAt: new Date().toISOString(),
                    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${userImage}?alt=media`,
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
            throw new Error('User not found')
        })
        .catch((signupError) => {
            console.error(signupError)
            if (signupError.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' })                
            }
            return res.status(500).json({ error: signupError.code})
        })    
}

const login = (req, res) => {
    const bodyJSON = JSON.parse(req.body)
    const user = {
        email: bodyJSON.email,
        password: bodyJSON.password
    }

    const {valid, errors} = validateLoginData(user)

    if (!valid) {
        return res.status(400).json({errors})
    }

    const { email, password } = user

    return firebase.auth().signInWithEmailAndPassword(email, password)
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
}

const spotifyLogin = (req, res) => {

  
    // use the access token to access the Spotify Web API
    console.log('req', req.spotifyToken)
    var token = req.spotifyToken //body.access_token;
    var options = {
        uri: 'https://api.spotify.com/v1/users/jmperezperez',
        headers: {
        'Authorization': 'Bearer ' + token
        },
        json: true
    };
    ky.get(options.uri, {
        headers: options.headers,
        json: true
    })
    .then(spotifyResponse => {
        //const data = JSON.parse(spotifyResponse)
        return spotifyResponse.json()
    })
    .then(spotifyJson => {
        return res.status(200).json({ message: 'user retrieved successfully', data: spotifyJson})
    })
    .catch(getUserError => {
        return res.status(500).json({ getUserError})
    })
}

// Get Own User Details
const getAuthenticatedUser = (req, res) => {
    let userData = {};
    return db.doc(`/users/${req.user.spotifyUser}`).get()
        .then(doc => {
            if(doc.exists) {
                userData.credentials = doc.data();
                return db.collection('playlists')
                    .where('spotifyUser', '==', req.user.spotifyUser)
                    .get()
            }
            return new Error('User not found')
        })
        .catch(getUserDetailsError => {
            console.error(getUserDetailsError)
            return res.status(500).json({ error: getUserDetailsError })
        })
        .then(data => {
            userData.playlists = [];
            if (data && data.docs && data.docs.length > 0) {
                data.forEach(doc => {
                    userData.playlists.push(doc.data())
                })
            }
            return db.collection('notifications')
                .where('recipient','==',req.user.spotifyUser)
                .orderBy('createdAt', 'desc').limit(10)
                .get()
        })
        .then(notifications => {
            userData.notifications = []
            if (notifications && notifications.docs && notifications.docs.length > 0) {
                notifications.docs.forEach(notification => {
                    userData.notifications.push({...notification, notificationId: notification.id})
                })
            }
            return res.status(200).json(userData)
        })
        .catch(addPlaylistsError => {
            console.error(addPlaylistsError)
            return res.status(200).json(userData)
        })
}

// Add user details
const addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);
    return db.doc(`/users/${req.user.spotifyUser}`).update(userDetails)
        .then(() => {
            return res.status(200).json({message: 'Details added successfully'})
        })
        .catch(updateUserDetailsError => {
            console.error({ updateUserDetailsError })
            return res.status(500).json({ error: updateUserDetailsError })
        })
}

// Upload a profile image for users
const uploadImage = (req, res) => {
    const BusBoy = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')

    const busboy = new BusBoy({ headers: req.headers })
    let imageFilename;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Please submit JPG or PNG files only.'})
        }
        const imageExtension = filename.split('.')[filename.split('.').length-1];
        imageFilename = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);
        imageToBeUploaded = { filepath, mimetype }
        return file.pipe(fs.createWriteStream(filepath))
    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket('splitsbyspotify.appspot.com')
            .upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                contentType: imageToBeUploaded.mimetype
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`
            return db.doc(`/users/${req.user.spotifyUser}`).update({ imageUrl })
        })
        .catch((uploadImageError) => {
            console.error(uploadImageError)
            return res.status(500).json({uploadImageError})

        })
        .then(() => {
            return res.json({ message: 'Image uploaded successfully'})
        })
        .catch(udpdateUserError => {
            console.error(udpdateUserError)
            return res.status(500).json({udpdateUserError})
        })
    })
    busboy.end(req.rawBody);
}


module.exports = { signUp, login, uploadImage, getAuthenticatedUser, addUserDetails, spotifyLogin }