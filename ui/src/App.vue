<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <div v-if="!authenticated">
      <button @click="login">Login</button>
    </div>
    <div v-if="authenticated">
      <button @click="logout">Logout</button>
      <h1>Hi {{ firstName }}!</h1>
      <button @click="createMenu">Create a menu!</button>
    </div>
  </div>
</template>

<script>
import Firebase from "./firebase.js";

export default {
  name: "App",
  data() {
    return {
      user: {
        loggedIn: false,
        data: {}
      }
    };
  },
  computed: {
    authenticated() {
      return this.user.loggedIn;
    },
    firstName() {
      if (this.user.data.displayName) {
        return this.user.data.displayName;
      }
      return null;
    }
  },
  methods: {
    login() {
      Firebase.login();
    },
    logout() {
      Firebase.logout();
    },
    createMenu() {
      Firebase.createMenu().then(result => {
        console.log(result);
      })
    }
  },
  mounted: function() {
    Firebase.auth.onAuthStateChanged(user => {
      if (user) {
        this.user.loggedIn = true;
        this.user.data = user;
      } else {
        this.user.loggedIn = false;
        this.user.data = {};
      }
    });
  }
};
</script>
