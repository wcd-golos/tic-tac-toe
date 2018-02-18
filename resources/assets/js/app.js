
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');
require('./game');

window.Vue = require('vue');
window.Golos = require('golos-js');

//golos.config.set('websocket', 'wss://ws.testnet3.golos.io');
//golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

window.Vuex = require('vuex');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import store from './store';

Vue.component('find-game', require('./components/FindGame.vue'));
Vue.component('agreement', require('./components/Agreement.vue'));
Vue.component('login', require('./components/Login.vue'));
Vue.component('game', require('./components/Game.vue'));
Vue.component('result', require('./components/Result.vue'));
Vue.component('mainmain', require('./components/Main.vue'));

const app = new Vue({
    el: '#app',
    store
});
