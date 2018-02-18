<template>
    <div class="fullheight">
        <div v-if="$store.state.state == 0" class="fullheight">
            <login v-on:success="logged"></login>
        </div>
        <div v-if="$store.state.state == 1" class="fullheight">
            <agreement v-on:agree="agree"></agreement>
        </div>
        <div v-if="$store.state.state == 2" class="fullheight">
            <game></game>
        </div>
        <div v-if="$store.state.state == 3" class="fullheight">
            <result></result>
        </div>
    </div>
</template>

<script>
    var STATUS_NEW = 0;
    var STATUS_PLAYING = 1;
    var STATUS_DONE = 2;

    export default {
        created: function() {
            window.store = this.$store;
            let permStorage = localStorage['permissions'];
            if (permStorage != undefined) {
                console.log(permStorage);
                let permissions = JSON.parse(permStorage);
                //this.login = false;
                //this.agreement = true;
                this.$store.commit('state', 1);
                this.$store.commit('permissions', permissions);
                //console.log('user', this.$store.state.user)

                //console.log('user', this.$store.state.user)
                // Game.play(permissions.posting, permissions.user, function(err, game) {
                //     if (err) {
                //         console.log(err);
                //         return;
                //     }
                this.user = {
                    login: permissions.user,
                    key: permissions.posting
                };

                var agetsData = {
                    /* user1: 'avehogan',
                    user1_pass: '5JHUWcrGkgbgRjki8VpByyWZowrRbCcmKs3MJywtxKUtGPoRvTi',
                    user2: 'a-borisov',
                    user2_pass: '5KScas3m9WmX5pbK7vf2XAK7R1GehTySxb4x5FZHMGC8RgC2vLK', */
                    get_golos_terms: 'Победить в игре tic-tac-toe', // флаг выйгыша
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
                };

                localStorage.agents = JSON.stringify(agetsData);

                //this.login = false;
                //this.agreement = true;
            } else {
                this.$store.commit('state', 0);
            }

            this.getCurrentState((state, game) => {
                //this.agreement = state != STATUS_PLAYING;
                //this.game = state == STATUS_PLAYING;
//                this.$store.commit('state', 0);
                //this.$store.commit('state', 2);
                console.log(game);
                this.$store.commit('game', game);
            });
        },

        data: function () {
            return {
                game: false,
                user: null
            }
        },

        methods: {
            agree: function(id) {
                Game.play(this.user, (err, game) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    game.persist();
                    this.$store.commit('state', 2);
                });
            },
            logged: function(id) {
                //this.login = false;
                //this.agreement = true;
            },
            getCurrentState (cb) {
                var activeGame = Game.getCurrentGame();
                if (!activeGame.id) {
                    return cb(STATUS_NEW);
                }

                Game.getGame(activeGame.author, activeGame.id, function (err, game) {
//                    this.$store.commit('game', game);
                    console.log('MAIN: ', err, game);
                    if (err || game == null) {
                        console.log(err);
                        return cb(Game.STATUS_NEW);
                    }

                    return cb(game.state, game);
                });
            }
        }
    };
</script>