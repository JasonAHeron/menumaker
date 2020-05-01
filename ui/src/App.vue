<template>
  <div class="antialiased" id="app">
    <div class="relative bg-gray-200">
      <div class="inset-0 flex flex-col" aria-hidden="true">
        <button
          v-if="authenticated"
          @click="logout"
          class="self-end m-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >Logout {{ firstName }}</button>
        <div class="flex-1 bg-gray-100"></div>
        <div class="flex-1 bg-teal-200"></div>
      </div>
      <div class="relative max-w-screen md:max-w-5xl mx-auto">
        <div class="flex h-screen items-center md:p-2 lg:p-8">
          <div
            class="flex flex-col flex-grow bg-white lg:shadow-2xl lg:rounded-lg lg:overflow-hidden"
          >
            <div
              v-if="authenticated && !this.menuData"
              class="self-center flex flex-col items-center p-8"
            >
              <h1
                class="mb-2 self-center font-semibold sm:text-xl md:text-3xl"
              >Welcome to MenuMaker!</h1>
              <button
                v-if="!this.loadingMenu && !this.menuData"
                @click="createMenu"
                class="m-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              >Create Free Menu</button>
              <span
                v-if="this.loadingMenu"
                class="m-2"
              >Loading... I wish I was smart enough to make a spinner. This can take like 20 seconds. It will probably work though.</span>
              <span
                v-if="this.errorFromCreate"
                class="m-2"
              >Well, I messed something up, maybe try refreshing or clicking create again?</span>
            </div>
            <div v-if="!authenticated" class="self-center flex flex-col items-center p-8">
              <h1
                class="mb-2 self-center font-semibold sm:text-xl md:text-3xl"
              >Welcome to MenuMaker!</h1>
              <button
                @click="login"
                class="m-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              >Login with Google to get started</button>
            </div>
            <div v-if="this.menuData" class="self-center flex flex-col items-start m-2 md:p-8">
              <div class="mb-4 flex flex-col">
                <span
                  class="block break-words text-gray-700 text-sm font-bold mb-2"
                >To update your menu make changes to the Google Sheet below</span>
                <div class="flex shadow border rounded py-2 px-3">
                  <a
                    target="_blank"
                    :href="sheetLink"
                    class="text-blue-500 break-all hover:text-blue-800 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >{{sheetLink}}</a>
                </div>
              </div>
              <div class="mb-4">
                <span
                  class="block text-gray-700 break-words text-sm font-bold mb-2"
                >To view and share your menu just share this link</span>
                <div class="flex shadow border rounded py-2 px-3">
                  <a
                    target="_blank"
                    :href="menuLink"
                    class="text-blue-500 hover:text-blue-800 break-all text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >{{menuLink}}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Firebase from "./firebase.js";

export default {
  name: "App",
  data() {
    return {
      loadingMenu: false,
      errorFromCreate: false,
      menuData: null,
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
    sheetLink() {
      console.log("computing sheetLink", this.menuData);
      if (this.menuData && this.menuData.sheet) {
        console.log(
          "returning",
          `https://docs.google.com/spreadsheets/d/` + this.menuData.sheet
        );
        return `https://docs.google.com/spreadsheets/d/` + this.menuData.sheet;
      }
      return null;
    },
    menuLink() {
      console.log("computing menuLink", this.menuData);
      if (this.menuData && this.menuData.menu) {
        console.log(
          "returning",
          `https://menu.heron.dev/view/` + this.menuData.menu
        );
        return `https://menu.heron.dev/view/` + this.menuData.menu;
      }
      return null;
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
      this.menuData = null;
    },
    createMenu() {
      this.loadingMenu = true;
      Firebase.createMenu()
        .then(result => {
          this.loadingMenu = false;
          this.errorFromCreate = false;
          this.menuData = result.data;
        })
        .catch(() => {
          this.loadingMenu = false;
          this.errorFromCreate = true;
        });
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
