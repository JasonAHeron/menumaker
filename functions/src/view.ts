import * as functions from 'firebase-functions';
import * as express from 'express'
import * as cors from 'cors'
import {SHEETS_KEY} from './keys';
import {google} from 'googleapis';

const TEST_SHEET = '1VfjfNv2IqW7_VYa0kCCoToQLz1B3tFvnIRmT5czwotI'
const app = express();
app.use(cors({origin: true}));
const sheets = google.sheets({
  version: 'v4',
  auth: SHEETS_KEY,
});

app.get('*', (req: express.Request, res: express.Response) => {
  sheets.spreadsheets.get({spreadsheetId: TEST_SHEET}).then(result => {
    res.send(result.data);
  }).catch(error => {
    res.send(error);
  })
});

export const viewMenu = functions.https.onRequest(app);
