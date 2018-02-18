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