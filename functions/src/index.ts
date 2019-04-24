import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

//Represents monitor values
interface monitor {
    temperature: number,
    humidity: number
    pressure: number,
    datetime: string
}

//Parse string value to number
function getNumber(value: any): number {
    if (typeof value === 'string') {
        return parseFloat(value);
    }
    return value;
}

/// Input

//Collect temperature, humidity and pressure values and store them into the database
export const save = functions.https.onRequest(async (request, response) => {
    //Get values
    const values: monitor = request.body;
    const datetime = new Date(values.datetime);
    const t = { "value": getNumber(values.temperature), "datetime": admin.firestore.Timestamp.fromDate(datetime) };
    const h = { "value": getNumber(values.humidity), "datetime": admin.firestore.Timestamp.fromDate(datetime) };
    const p = { "value": getNumber(values.pressure), "datetime": admin.firestore.Timestamp.fromDate(datetime) };

    //Save values
    await admin.firestore().collection('temperature').add(t);
    await admin.firestore().collection('humidity').add(h);
    await admin.firestore().collection('pressure').add(p);

    return response.send('Saved');
});

///Output

//Represent single value
interface monitorValue {
    value: number,
    datetime: Date
}

//Transform Firestore values to json format
function getMonitorValues(docs: FirebaseFirestore.QuerySnapshot): monitorValue[] {
    let monitorValues: monitorValue[] = [];
    docs.docs.map(doc => {
        let s = doc.data();
        monitorValues.push({ "value": s.value, "datetime": s.datetime.toDate() });
    });
    return monitorValues;
}

//Return temperature value with datetime
export const temperature = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('temperature').get();
    return response.send(getMonitorValues(docs));
});

//Return humidity value with datetime
export const humidity = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('humidity').get();
    return response.send(getMonitorValues(docs));
});

//Return pressure value with datetime
export const pressure = functions.https.onRequest(async (request, response) => {
    const docs = await admin.firestore().collection('pressure').get();
    return response.send(getMonitorValues(docs));
});