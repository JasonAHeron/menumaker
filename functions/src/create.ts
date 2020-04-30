import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors'
import { TEST_SHEET } from './keys';
import {authenticateDrive, Request} from './authenticated_apis';

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
app.use(cors({ origin: true }));
app.use(cookieParser());
app.use(validateFirebaseIdToken);
app.use(authenticateDrive);
const db = admin.firestore()

app.post('*', (req: Request, res: express.Response) => {
  if(!!req.user?.email) {
    db.collection('users').doc(req.user.email).get()
    .then(doc => {
      if (!doc.exists) {
        req.drive!.files.copy({ fileId: TEST_SHEET }).then(response => {
          if (!!response.data?.id) {
            req.drive!.permissions.create({
              fileId: response.data.id,
              requestBody: { type: 'user', role: 'writer', emailAddress: req.user!.email }
            }).then(() => {
              const userMenuId = response.data.id!.substring(0, 6)
              const p1 = db.collection('menuIds').doc(userMenuId).set({ spreadsheetId: response.data.id });
              const p2 = db.collection('users').doc(req.user!.email!).set({ menuId: userMenuId, spreadsheetId: response.data.id });
              Promise.all([p1, p2])
              .then(() => {
                res.send({ data: { sheet: response.data.id, menu: userMenuId }});
                return;
              })
              .catch(err => console.error(err));
            }).catch(err => console.error(err));
          }
        })
        .catch(error => {
          console.error(error);
          res.status(500).send(error);
          return;
        });
      } else {
        res.send({data: {sheet: doc.get('spreadsheetId'), menu: doc.get('menuId')}});
        return;
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    })
  }
  res.status(500).send();
});

export const createMenu = functions.https.onRequest(app);
