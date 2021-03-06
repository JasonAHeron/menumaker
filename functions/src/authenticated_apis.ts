import { DRIVE_AUTH_SECRET } from './keys';
import * as admin from 'firebase-admin';
import { google, drive_v3, sheets_v4 } from 'googleapis';
import * as express from 'express'

export const adminSdk = admin.initializeApp();

export interface MenuDocModel {
  spreadsheetId: string;
}

export interface Request extends express.Request {
  user?: admin.auth.DecodedIdToken;
  drive?: drive_v3.Drive;
  sheets?: sheets_v4.Sheets;
  menuDoc?: MenuDocModel;
}

function getAuthClient(scopes: string[]): Promise<any> {
  return google.auth.getClient({
    credentials: DRIVE_AUTH_SECRET,
    scopes,
  })
}

/**
 * Middleware to provide an authenticated drive client.
 */
export async function authenticateDrive(req: Request, res: express.Response, next: any) {
  const auth = await getAuthClient(['https://www.googleapis.com/auth/drive']);
  req.drive =  google.drive({
    version: 'v3',
    auth,
  })
  next();
}

/**
 * Middleware to provide an authenticated sheets client.
 */
export async function authenticateSheets(req: Request, res: express.Response, next: any) {
  const auth = await getAuthClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
  req.sheets =  google.sheets({
    version: 'v4',
    auth,
  })
  next();
}
