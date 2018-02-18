import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: 'tet',
        posting: '',
        active: '',
        state: 0,
        game_golos_rate: 0.010, // колличество переводимых голосов
        game_gbg_rate: 0.000, // колличество переводимых золотых голосов
        game_commision: 0.001, // доход гаранту/агенту
        agent: 'timur.zevriev', // гарант/агент
        aget_active_wif: '5JmAaq8NGKHEZDiccH1AtYfHPVpUo1TB2Ls89gACYpN3nchDPgG', // активный ключ агента
        transaction_approve_time: 3, // время для подтверждения транзакции
        transaction_expiration_time: 48 // время жизни защиты транзакции, после любой может получить деньги
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