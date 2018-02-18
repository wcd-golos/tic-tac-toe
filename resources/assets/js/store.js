import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        game: null,
        user: 'tet',
        posting: '',
        active: '',
        state: 0,
        win: false, // флаг выйгыша
        user1: 'avehogan',
        user1_pass: '5JHUWcrGkgbgRjki8VpByyWZowrRbCcmKs3MJywtxKUtGPoRvTi',
        user2: 'a-borisov',
        user2_pass: '5KScas3m9WmX5pbK7vf2XAK7R1GehTySxb4x5FZHMGC8RgC2vLK',
        get_golos_terms: 'Победить в игре tic-tac-toe', // флаг выйгыша
        winclass: '',  //класс стиля для перечеркивания доски в случае победы
        game_golos_rate: "0.010 GOLOS", // количество переводимых голосов
        game_gbg_rate: "0.000 GBG", // количество переводимых золотых голосов
        game_commision: "0.001 GOLOS", // доход гаранту/агенту
        agent: 'timur.zevriev', // гарант/агент
        agent_priv_wif: '5JEcwiB6DzHvGYmFfaMFMPkx4uRwYkAUVSLdnDX65yNnpYC8N5R', // приватный ключ агента
        agent_active_wif: '5JmAaq8NGKHEZDiccH1AtYfHPVpUo1TB2Ls89gACYpN3nchDPgG', // активный ключ агента
        agent2: 'alibay', // второй гарант/агент
        agent2_priv_wif: '5KPtfFKtgQ3RSUKeXFHRfHzrGNTbV5UPjgNFdChEpyGAgcp7p3s', // приватный ключ агента
        agent2_active_wif: '5Jjo8W56WfwfLqBCq7a8qCgFFBRy8eeJ6ZYMSZD4UVJgYoHgQ8k', // активный ключ второго агента
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
        },
        winclass(state, current) {
            state.winclass = current;
        },
        game(state, game) {
            state.game = game;
        }
    }
});

export default store;