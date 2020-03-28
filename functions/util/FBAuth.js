const {admin, db} = require('./admin')

const firebase = require('firebase');


const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('No Token found')
        return res.status(403).json({ error: 'Unauthorized'})
    }
    return admin.auth().verifyIdToken(idToken)
        .catch(tokenError => {
            if (tokenError.code === 'auth/argument-error') {
            console.log('tokenError.code', tokenError.code)
                return firebase.auth().signInWithCustomToken(idToken)
            } else {
                throw new Error({ code: 403, message: tokenError.code})
            }
        })
        .then(DecodedIdToken => {
            // console.log('DecodedIdToken', DecodedIdToken)
            // console.log('DecodedIDToken', DecodedIdToken && DecodedIdToken.user ? DecodedIdToken.user.uid : DecodedIdToken)
            req.user = DecodedIdToken.user ? DecodedIdToken.user : DecodedIdToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user.spotifyUser = data.docs[0].data().spotifyUser
            req.user.photoURL = data.docs[0].data().photoURL
            return next();
        })
        .catch(error => {
            console.log('err', error)
            return res.status(500).json({ error })
        })
}

module.exports = {FBAuth}