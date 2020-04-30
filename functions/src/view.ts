import * as functions from 'firebase-functions';
import * as express from 'express'
import * as cors from 'cors'
import * as handlebars from 'express-handlebars';
import {authenticateSheets, Request, MenuDocModel, adminSdk} from './authenticated_apis';

const HEADER_RANGE = 'Sheet1!A2:D2';
const DATA_RANGE = 'Sheet1!A4:C100';

interface Headers {
  name?: string;
  number?: string;
  location?: string;
  hours?: string;
}

interface MenuItem {
  name?: string;
  description?: string;
  price?: string;
}

interface MenuSection {
  name?: string,
  items?: MenuItem[],
}

interface Menu {
  headers?: Headers,
  sections?: MenuSection[];
}

export async function menuDocFromPath(req: Request, res: express.Response, next: any) {
  const menuPath = req.path.split('/');
  // we expect the path to contain three parts every time.
  if (menuPath.length !== 3) {
    res.redirect('https://menu.heron.dev');
    return;
  } else {
    const menuDoc = await db.collection('menuIds').doc(menuPath[menuPath.length - 1]).get()
    if (menuDoc.exists) {
      req.menuDoc = menuDoc.data() as MenuDocModel;
    }
    next();
    return;
  }
}

function parseHeaders(headers: string[]): Headers {
  return {
    name: headers[0],
    number: headers[1],
    location: headers[2],
    hours: headers[3],
  }
}

function parseMenuRows(menuRows: string[][]): MenuSection[] {
  const menuSections: MenuSection[] = [];
  let currentSection: MenuSection = {};
  for (const row of menuRows) {
    if (row.length == 1 && row[0].startsWith("##")) {
      if (currentSection?.name) {
        menuSections.push(currentSection);
      }
      currentSection = {name: row[0].slice(2), items: []};
    }
    else {
      currentSection.items!.push({
        name: row[0],
        description: row[1] === "#" ? "" : row[1],
        price: row[2] === "#" ? "" : row[2],
      })
    }
  }
  if (currentSection.name) {
    menuSections.push(currentSection);
  }
  return menuSections;
}

const app = express();
const db = adminSdk.firestore()
app.use(cors({origin: true}));
app.set('views', __dirname + '/views');
app.engine('handlebars', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(authenticateSheets);
app.use(menuDocFromPath);

app.get('*', (req: Request, res: express.Response) => {
  if (req.menuDoc) {
    req.sheets!.spreadsheets.values.batchGet({
      spreadsheetId: req.menuDoc.spreadsheetId, ranges: [HEADER_RANGE, DATA_RANGE]
    }).then(result => {
      if (result.data.valueRanges?.[0]?.values && result.data.valueRanges?.[1]?.values) {
        const menu: Menu = {};
        menu.headers = parseHeaders(result.data.valueRanges[0].values[0]);
        menu.sections = parseMenuRows(result.data.valueRanges[1].values);
        console.log(menu);
        res.render('menu', {menu});
      } else {
        res.send("Failed to fetch values for expected ranges");
      }
    }).catch(error => {
      res.send("Error getting spreadsheet" + error);
    });
    return;
  }
  else {
    res.redirect('https://menu.heron.dev');
    return;
  }
});

export const viewMenu = functions.https.onRequest(app);
