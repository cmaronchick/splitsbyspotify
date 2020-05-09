import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/analytics'

import firebaseConfig from './splitsbyspotify-firebase-adminsdk-xkg5z.json'
try {
    firebase.initializeApp(firebaseConfig)
    if (process.env.NODE_ENV !== 'test') {
        firebase.analytics();
    }
} catch (firebaseConfigError) {
    console.log('Error initalizing firebase')
    console.log('firebaseConfigError', firebaseConfigError)
}
export default firebase