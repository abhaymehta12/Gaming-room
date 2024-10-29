import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from 'firebase/compat/app';

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAKLDOuCbxAgjAZu9RlmZnecjhVdNb6z7Q",
  authDomain: "gameapp-e7a7e.firebaseapp.com",
  projectId: "gameapp-e7a7e",
  storageBucket: "gameapp-e7a7e.appspot.com",
  messagingSenderId: "964596108064",
  appId: "1:964596108064:web:0daf55926b3c0762ebe545",
  measurementId: "G-JLYE3L50PS"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
