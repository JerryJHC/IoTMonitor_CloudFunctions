import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface monitor {
    temperature: number,
    humidity: number
    pressure: number,
    datetime: string
}

//Collect temperature, humidity and pressure values and store them into the database
export const save = functions.https.onRequest(async (request, response) => {
    //Get values
    const values: monitor = request.body;
    const datetime = new Date(values.datetime);
    const t = { "value": values.temperature, "datetime": admin.firestore.Timestamp.fromDate(datetime) };
    const h = { "value": values.humidity, "datetime": admin.firestore.Timestamp.fromDate(datetime) };
    const p = { "value": values.pressure, "datetime": admin.firestore.Timestamp.fromDate(datetime) };

    //Save values
    await admin.firestore().collection('temperature').add(t);
    await admin.firestore().collection('humidity').add(h);
    await admin.firestore().collection('pressure').add(p);

    return response.send('Saved');
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