import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors'

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

admin.initializeApp();
const app = express();
app.use(cors({origin: true}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);

app.post('*', (req: Request, res: express.Response) => {
  res.send({user: req.user!.name, sheet: "1234", menu: "567"});
});

export const createMenu = functions.https.onRequest(app);
