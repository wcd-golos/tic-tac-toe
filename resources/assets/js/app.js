
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');
require('./game');

window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

Vue.component('find-game', require('./components/FindGame.vue'));
Vue.component('agreement', require('./components/Agreement.vue'));
Vue.component('game', require('./components/Game.vue'));
Vue.component('mainmain', require('./components/Main.vue'));

const app = new Vue({
    el: '#app'
});
