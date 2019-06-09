import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const cors = require('cors')({ origin: true });

admin.initializeApp();

//Represents monitor values
interface monitor {
    temperature: number,
    humidity: number
    pressure: number
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
    const datetime = new Date(Date.now());
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

//Represents a query of monitor values
interface queryMonitorValues {
    startDateTime: string,
    endDateTime: string
}

//Transform Firestore values to json format
function getMonitorValues(docs: FirebaseFirestore.QuerySnapshot): monitorValue[] {
    const monitorValues: monitorValue[] = [];
    docs.docs.map(doc => {
        const s = doc.data();
        monitorValues.push({ "value": s.value, "datetime": s.datetime.toDate() });
    });
    return monitorValues;
}

//Analyze request, perform a query in firestore and return docs
async function getDocs(request: functions.https.Request, response: functions.Response, collection: string) {
    cors(request, response, async () => {
        let docs: FirebaseFirestore.QuerySnapshot;
        if (request.method === "POST") {
            const query: queryMonitorValues = request.body;
            docs = await admin.firestore().collection(collection).where("datetime", ">=", new Date(query.startDateTime)).where("datetime", "<=", new Date(query.endDateTime)).orderBy("datetime", "asc").get();
        } else {
            docs = await admin.firestore().collection(collection).orderBy("datetime", "desc").limit(1).get();
        }
        response.send(getMonitorValues(docs));
    });
}

//Return temperature value with datetime
export const temperature = functions.https.onRequest(async (request, response) => {
    await getDocs(request, response, 'temperature')
});

//Return humidity value with datetime
export const humidity = functions.https.onRequest(async (request, response) => {
    await getDocs(request, response, 'humidity');
});

//Return pressure value with datetime
export const pressure = functions.https.onRequest(async (request, response) => {
    await getDocs(request, response, 'pressure');
});