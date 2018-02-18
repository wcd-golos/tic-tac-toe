import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: 'tet',
        posting: '',
        active: '',
        state: 0,
        win: false,
        game_golos_rate: 0.010,
        game_gbg_rate: 0.000,
        game_commision: 0.001,
        agent: 'timur.zevriev',
        aget_active_wif: '5JmAaq8NGKHEZDiccH1AtYfHPVpUo1TB2Ls89gACYpN3nchDPgG'
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