import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

//Collect temperature, humidity and pressure values and store them into the database
export const save = functions.https.onRequest(async (request, response) => {
    const values = request.body;
    return response.send('Saved: ' + JSON.stringify(values));
});

//Return temperature value with datetime
export const temperature = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('temperature').get();
    return response.send(docs.docs.map(doc => doc.data()));
});

//Return humidity value with datetime
export const humidity = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('humidity').get();
    return response.send(docs.docs.map(doc => doc.data()));
});

//Return pressure value with datetime
export const pressure = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('pressure').get();
    return response.send(docs.docs.map(doc => doc.data()));
});