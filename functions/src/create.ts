import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import {SHEETS_KEY} from './keys';
import {google} from 'googleapis';

interface Request extends express.Request {
  user?: admin.auth.DecodedIdToken;
}

const validateFirebaseIdToken = async (req: Request, res: express.Response, next: any) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    idToken = req.cookies.__session;
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    res.status(403).send('Unauthorized');
    return;
  }
};

// const sheets = google.sheets({
//   version: 'v4',
//   auth: SHEETS_KEY,
// });

const drive = google.drive({
  version: 'v3',
  auth: SHEETS_KEY,
});

const TEST_SHEET = '18zMmVFakNS_FAWSegEKB9UypHKpCnC8fmiPYMgXuN3Y'

admin.initializeApp();
const app = express();
app.use(cors({origin: false}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);

app.post('*', (req: Request, res: express.Response) => {
  drive.files.copy({fileId: TEST_SHEET}).then(response => {
    res.send({data: response.data});
  }).catch(error => {
    // Handle the error
    console.log(error);
    express.response.status(500).send(error);
  })
})
//   const sheetData = {user: req.user!.name,
//     menuTuple: { sheetsId: "abc", menuId: "def"}
//   };
//   admin.firestore().collection('users').add(sheetData).then(() => {
//     res.send({data: {user: req.user!.name, sheet: "1234", menu: "567"}});
// }).catch(error => {
//   // Handle the error
//   console.log(error);
//   express.response.status(500).send(error);
// }

export const createMenu = functions.https.onRequest(app);
