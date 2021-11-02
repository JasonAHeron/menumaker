import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyBFMsC2NH6DRMp9fjX_ko4ftHvjc0FN5UE",
  authDomain: "menumaker-b4bf2.firebaseapp.com",
  databaseURL: "https://menumaker-b4bf2.firebaseio.com",
  projectId: "menumaker-b4bf2",
  storageBucket: "menumaker-b4bf2.appspot.com",
  messagingSenderId: "1090297600118",
  appId: "1:1090297600118:web:b175ca8cc94bf83821e757"
};

firebase.initializeApp(firebaseConfig);

export default {
  auth: firebase.auth(),
  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  },
  logout() {
    firebase.auth().signOut()
    .then(function() {})
    .catch(function(error) {
      console.log(error)});
  },
  createMenu() {
    return firebase.functions().httpsCallable('c').call();
  }
}
