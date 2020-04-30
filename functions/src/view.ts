import * as functions from 'firebase-functions';
import * as express from 'express'
import * as cors from 'cors'
import * as handlebars from 'express-handlebars';
import {authenticateSheets, Request} from './authenticated_apis';
import {TEST_SHEET} from './keys';

const HEADER_RANGE = 'Sheet1!A2:D2';
const DATA_RANGE = 'Sheet1!A4:C100';

const app = express();
app.use(cors({origin: true}));
app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views');
app.engine('handlebars', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(authenticateSheets);

app.get('*', (req: Request, res: express.Response) => {
  req.sheets!.spreadsheets.values.batchGet({
    spreadsheetId: TEST_SHEET, ranges: [HEADER_RANGE, DATA_RANGE]
  }).then(result => {
    if (result.data.valueRanges?.[0]?.values && result.data.valueRanges?.[1]?.values) {
      //const header_values = result.data.valueRanges[0].values;
      //const data_values = result.data.valueRanges[1].values;
      //res.send({header_values, data_values});
      res.render('menu');
      return;
    }
    res.send("Failed to fetch values for expected ranges");
    return;
  }).catch(error => {
    res.send(error);
  })
});

export const viewMenu = functions.https.onRequest(app);
