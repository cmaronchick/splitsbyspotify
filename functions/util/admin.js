const admin = require('firebase-admin')
const serviceAccount = require('../../splitsbyspotify-firebase-adminsdk-xkg5z.json')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://splitsbyspotify.firebaseio.com"
  });

  
  const db = admin.firestore();

module.exports = { admin, db };