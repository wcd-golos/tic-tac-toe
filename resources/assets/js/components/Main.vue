<template>
    <div class="fullheight">
        <div v-if="$store.state.state == 0" class="fullheight">
            <login v-on:success="logged"></login>
        </div>
        <div v-if="$store.state.state == 1" class="fullheight">
            <game v-bind:game="gameWrapper"></game>
            <!--<agreement v-on:agree="agree"></agreement>-->
        </div>
        <div v-if="$store.state.state == 2" class="fullheight">
            <game v-bind:game="gameWrapper"></game>
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

    var getCurrentState = function (cb) {
        var activeGame = Game.getCurrentGame();
        if (!activeGame.id) {
            return cb(STATUS_NEW);
        }

        Game.getGame(activeGame.author, activeGame.id, function (err, game) {
            if (err || game == null) {
                return cb(Game.STATUS_NEW);
            }

            return cb(game.state, game);
        });
    }

    export default {
        created: function() {
            let permStorage = localStorage['permissions'];
            if (permStorage != undefined) {
                let permissions = JSON.parse(permStorage);
                //this.login = false;
                //this.agreement = true;
                this.$store.commit('state', 1);
                this.$store.commit('permissions', permissions);
                //console.log('user', this.$store.state.user)
                this.$store.commit('state', 1);
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

            }

            getCurrentState((state, game) => {
                //this.agreement = state != STATUS_PLAYING;
                //this.game = state == STATUS_PLAYING;
                this.gameWrapper = game;
            });
        },

        data: function () {
            return {
                game: false,
                user: null
            }
        },

        methods: {
//            verifyUser () {
//                verifyUser(this.username, this.wif);
//            },

            agree: function(id) {
                Game.play(this.user, (err, game) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    this.$store.commit('state', 2);
                    this.gameWrapper = game;
                });
            },
            logged: function(id) {
                //this.login = false;
                //this.agreement = true;
            }
        }
    };
</script>