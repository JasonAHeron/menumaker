<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <div v-if="!authenticated">
      <button @click="login" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" >
  Login
</button>
    </div>
    <div v-if="authenticated">
      <button @click="logout" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" >
  Logout
</button>
      <h1>Hi {{ firstName }}!</h1>
      <button @click="createMenu" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" >
  Create menu
</button>
    </div>
    <div v-if="this.user.menuData"> 
      <a id="hyperlink" href="#">link text</a>
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
        data: {},
        menuData: null,
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
    },
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
        this.user.menuData = result;
        var link = document.getElementById("hyperlink");
        link.href = "https://menu.heron.dev/view" + this.menuData.data.menu
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
