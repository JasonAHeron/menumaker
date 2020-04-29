import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors'
import {TEST_SHEET, DRIVE_AUTH_SECRET} from './keys';
import {google, drive_v3} from 'googleapis';

interface Request extends express.Request {
  user?: admin.auth.DecodedIdToken;
  drive?: drive_v3.Drive;
}

const authenticateDrive = async (req: Request, res: express.Response, next: any) => {
  req.drive = await getAuthenticateDrive();
  next();
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

function getAuthenticateDrive(): Promise<drive_v3.Drive> {
  return google.auth.getClient({
    credentials: DRIVE_AUTH_SECRET,
    scopes: 'https://www.googleapis.com/auth/drive.file',
  }).then(validAuth =>
     google.drive({
      version: 'v3',
      auth: validAuth,
    })
  );
}

admin.initializeApp();
const app = express();
app.use(cors({origin: true}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);
app.use(authenticateDrive);

app.post('*', (req: Request, res: express.Response) => {
  req.drive!.files.copy({fileId: TEST_SHEET}).then(response => {
	    res.send({data: {user: req.user?.name, sheet: response.data}});
    }).catch(error => {
      console.error(error);
      res.status(500).send(error);
    })
  res.send({data: {user: req.user!.name, sheet: "1234", menu: "567"}});
});

export const createMenu = functions.https.onRequest(app);
