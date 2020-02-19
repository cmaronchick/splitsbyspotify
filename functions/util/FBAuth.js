const {admin, db} = require('./admin')

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

module.exports = {FBAuth}