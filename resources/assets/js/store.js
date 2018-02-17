import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: 'tet',
        posting: '',
        active: '',
        state: 0
    },
    mutations: {
        permissions (state, perm) {
            state.user = perm.user;
            state.posting = perm.posting;
            state.active = perm.active;
        },
        state(state, current) {
            state.state = current;
        }
    }
});

export default store;