import * as functions from 'firebase-functions';

export const viewMenu = functions.https.onRequest((request, response) => {
  response.send("View a menu");
 });
