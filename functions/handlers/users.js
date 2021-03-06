const { admin, db } = require('../util/admin')

const { config } = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const ky = require('ky/umd')

const { validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators')


 const signUp = (req, res) => {
    const body = JSON.parse(req.body)
    const { email, password, confirmPassword, spotifyUser } = body
    const firstname = body.firstname ? body.firstname : "John"
    const lastname = body.lastname ? body.lastname : "Doe"
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
                    display_name: `${firstname} ${lastname}`,
                    email: newUser.email,
                    createdAt: new Date().toISOString(),
                    photoURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${userImage}?alt=media`,
                    userId: user.uid
                }
                return db.doc(`/users/${newUser.spotifyUser}`).set(userCredentials);
            }
            return new Error('No IdToken returned')

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

const createFirebaseAccount = (req, res) => {
    const {spotifyID, display_name, email, accessToken} = req.body
    // console.log({spotifyID, display_name, email, accessToken})
    // The UID we'll assign to the user.
    const uid = `spotify:${spotifyID}`;
  
    // Save the access token to the Firebase Realtime Database.
    const databaseTask = admin.database().ref(`/spotifyAccessToken/${uid}`).set(accessToken);
    let photoURL = req.body.photoURL === '' || !req.body.photoURL ? `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/blank-profile-picture.png?alt=media` : req.body.photoURL
    // const userImage = 'blank-profile-picture.png';
    // token = IdToken;
    // const userCredentials = {
    //     spotifyUser: newUser.spotifyUser,
    //     display_name: `${firstname} ${lastname}`,
    //     email: newUser.email,
    //     createdAt: new Date().toISOString(),
    //     photoURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${userImage}?alt=media`,
    //     userId: user.uid
    // }
    // Create or update the user account.
    const userCreationTask = admin.auth().updateUser(uid, {
        displayName: display_name,
        photoURL: photoURL,
        email: email,
        emailVerified: true,
        spotifyUser: spotifyID
    })
    .then(() => {
        const userCredentials = {
            spotifyUser: spotifyID,
            display_name: display_name,
            email: email,
            photoURL: photoURL,
            userId: uid
        }
        return db.doc(`/users/${spotifyID}`).update(userCredentials);
    })
    .catch((error) => {
      // If user does not exists we create it.
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({
          uid: uid,
          spotifyUser: spotifyID,
          displayName: display_name,
          photoURL: photoURL,
          email: email,
          emailVerified: true,
        })
        .then(() => {
            const userCredentials = {
                spotifyUser: spotifyID,
                display_name: display_name,
                email: email,
                createdAt: new Date().toISOString(),
                photoURL: photoURL,
                userId: uid
            }
            return db.doc(`/users/${spotifyID}`).set(userCredentials);
        })
      }
      throw error;
    })

    const addUserToUsersDB = {};
    
    
    // Wait for all async tasks to complete, then generate and return a custom auth token.
    Promise.all([userCreationTask, databaseTask])
    .then(res => {
        // Create a Firebase custom auth token.
        return admin.auth().createCustomToken(uid);
    })
    .then(data => {
        //console.log('data', data)
        return admin.auth().createCustomToken(uid)
    })
    .then(token => {
        return res.status(200).json({ token });
    })
    .catch(reject => {
        console.log('reject', reject)
        return res.status(500).json({ reject })
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
const getAuthenticatedUser = (req, res, next) => {
    let userData = {};
    return db.doc(`/users/${req.user.spotifyUser}`).get()
        .then(doc => {
            //console.log('res.statusCode 212', res.statusCode)
            if(doc.exists) {
                userData.credentials = doc.data();
                return db.collection('playlists')
                    .where('spotifyUser', '==', req.user.spotifyUser)
                    .get()
            } else {
                throw new Error(JSON.stringify({ code: 404, message: 'User not found'}))
            }
        })

        .then(data => {
            userData.playlists = {}
            if (data && data.docs && data.docs.length > 0) {
                data.docs.forEach(doc => {
                    userData.playlists[doc.id] = {
                        firebasePlaylistId: doc.id,
                        inMyPlaylists: true,
                        ...doc.data()
                    }
                })
            }
            return db.collection('notifications')
                .where('recipient','==',req.user.spotifyUser)
                .orderBy('createdAt', 'desc').limit(10)
                .get()
        })
        .then(data => {
            userData.notifications = [];
            if (data && data.docs && data.docs.length > 0) {
                data.forEach(doc => {
                    userData.notifications.push({
                        notificationId: doc.id,
                        ...doc.data()
                    })
                })
            }
            //console.log('req.user.spotifyUser', req.user.spotifyUser)
            return db.collection('likes')
                .where('spotifyUser','==',req.user.spotifyUser)
                .orderBy('likedAt', 'desc')
                .get()
        })
        .then(likes => {
            userData.likes = []
            if (likes && likes.docs && likes.docs.length > 0) {
                likes.docs.forEach(likesObj => {
                    const like = likesObj.data()
                    userData.likes.push({likeId: like.id, ...like})
                })
            }
            return db.collection('savedSplits')
                .where('spotifyUserId','==', req.user.spotifyUser)
                .get()
        })
        .then(splits => {
            userData.splits = {}
            if (splits && splits.docs && splits.docs.length > 0) {
                splits.docs.forEach(split => {
                    const data = split.data()
                    userData.splits[data.firebasePlaylistId] = {
                        ...data
                    }
                })
            }

            return res.status(200).json(userData)
            //return next()
        })
        .catch(getAuthenticatedUserErrorResponse => {
            console.error({getAuthenticatedUserErrorResponse})
            let getAuthenticatedUserError = JSON.parse(getAuthenticatedUserErrorResponse.message)
            if (getAuthenticatedUserError.code) {
                console.log('getAuthenticatedUserError.code', getAuthenticatedUserError.code)
                req.error = getAuthenticatedUserErrorResponse
                return next()
            }
            return next()
            //return res.json(userData)
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

// Get Any User's Details
const getUserDetails = (req, res, next) => {
    let userDetails = {}
    const {spotifyUser} = req.params
    return db.doc(`/users/${spotifyUser}`).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error(JSON.stringify({ code: 404, message: 'User not found'}))
            }
            userDetails = doc.data()
            return db.collection('playlists')
                .where('spotifyUser', '==', spotifyUser)
                .orderBy('createdAt', 'desc')
                .get()

        })
        .then(playlistDocs => {
            let playlists = {}
            if (playlistDocs && playlistDocs.docs && playlistDocs.docs.length > 0) {
                playlistDocs.docs.forEach(playlistObj => {
                    const playlist = playlistObj.data()
                    console.log({playlist})
                    playlists[playlistObj.id] = {
                        firebasePlaylistId: playlistObj.id,
                        ...playlist
                    }
                })
            }
            userDetails.playlists = playlists
            return res.status(200).json({ message: 'User details retrieved successfully', userDetails})


        })
        .catch(getUserDetailsError => {
            console.error({getUserDetailsError})
            req.error = getUserDetailsError
            return next()
        })

}

// Upload a profile image for users
const uploadImage = (req, res) => {
    console.log('req.user', req.headers)
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
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        const imageExtension = filename.split('.')[filename.split('.').length-1];
        imageFilename = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);
        console.log('filepath', filepath)
        imageToBeUploaded = { filepath, mimetype }
        return file.pipe(fs.createWriteStream(filepath))
    });
    //console.log('imageToBeUploaded', imageToBeUploaded)
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
            const imageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`
            return db.doc(`/users/${req.user.spotifyUser}`).update({ imageURL })
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

const markNotificationsAsRead = (req, res, next) => {
    console.log('req.body', req.body)
    let notificationIds = JSON.parse(req.body)
    let batch = db.batch()
    notificationIds.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`)
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return res.status(200).json({ message: 'Notifications marked read'});
        })
        .catch(batchError => {
            console.error(batchError)
            req.error = batchError
            return next()
        })

}

const saveSplits = (req, res) => {
    if (!req.body) {
        return res.status(500).json({ message: 'Something went wrong.'})
    }
    const { spotifyUser } = req.user
    const { firebasePlaylistId, selectedDistance, targetPace, selectedMeasurement } = req.body

    const splitsObject = { spotifyUserId: spotifyUser, firebasePlaylistId, selectedDistance, targetPace, selectedMeasurement }
    
    return db.collection('savedSplits')
        .where('firebasePlaylistId','==',firebasePlaylistId)
        .where('spotifyUserId','==',splitsObject.spotifyUserId)
        .get()
        .then(data => {
            if (data.docs.length === 0) {
                return db.collection('savedSplits').add(splitsObject)
            }
            const doc = data.docs[0]
            return db.doc(`/savedSplits/${doc.id}`).update(splitsObject)
        })
        .then(writeResponse => {
            console.log('writeResponse', writeResponse)
            return res.status(200).json({ message: 'Splits saved successfully'})
        })
        .catch(savedSplitError => {
            console.log('savedSplitError', savedSplitError)
            return res.status(500).json({ message: `${savedSplitError}`})
        })
}

const deleteSplits = (req, res) => {
    if (!req.body) {
        return res.status(500).json({ message: 'Something went wrong.'})
    }
    const { spotifyUser } = req.user
    const { firebasePlaylistId, selectedDistance, targetPace, selectedMeasurement } = req.body

    const splitsObject = { spotifyUserId: spotifyUser, firebasePlaylistId, selectedDistance, targetPace, selectedMeasurement }
    
    return db.collection('savedSplits')
        .where('firebasePlaylistId','==',firebasePlaylistId)
        .where('spotifyUserId','==',splitsObject.spotifyUserId)
        .get()
        .then(data => {
            if (data.docs.length === 0) {
                return res.status(404).json({message: 'Saved Split not found'})
            }
            const doc = data.docs[0]
            return db.doc(`/savedSplits/${doc.id}`).delete()
        })
        .then(writeResponse => {
            console.log('writeResponse', writeResponse)
            return res.status(200).json({ message: 'Splits deleted successfully'})
        })
        .catch(savedSplitError => {
            console.log('savedSplitError', savedSplitError)
            return res.status(500).json({ message: `${savedSplitError}`})
        })
}

module.exports = { signUp, login, uploadImage, getAuthenticatedUser, addUserDetails, getUserDetails, spotifyLogin, createFirebaseAccount, markNotificationsAsRead, saveSplits, deleteSplits }