import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

export const save = functions.https.onRequest((request, response) => {
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    return admin.firestore().ref('/monitor').push({ temperature: 20 , humidity: 30, pressure: 15 }).then( (snapshot: { ref: { toString: () => string; }; }) => response.redirect(303, snapshot.ref.toString()));
});
