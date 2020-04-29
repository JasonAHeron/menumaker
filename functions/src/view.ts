import * as functions from 'firebase-functions';
import * as express from 'express'
import * as cors from 'cors'
import {SHEETS_KEY} from './keys';
import {google} from 'googleapis';

const TEST_SHEET = '18zMmVFakNS_FAWSegEKB9UypHKpCnC8fmiPYMgXuN3Y'
const HEADER_RANGE = 'Sheet1!A2:D2';
const DATA_RANGE = 'Sheet1!A4:C100';
const app = express();
app.use(cors({origin: true}));
const sheets = google.sheets({
  version: 'v4',
  auth: SHEETS_KEY,
});

app.get('*', (req: express.Request, res: express.Response) => {
  sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET,
    ranges: [HEADER_RANGE, DATA_RANGE]
  }).then(result => {
    res.send(result.data);
  }).catch(error => {
    res.send(error);
  })
});

export const viewMenu = functions.https.onRequest(app);
