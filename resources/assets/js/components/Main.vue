<template>
    <div class="fullheight">
        <div v-if="login" class="fullheight">
            <login v-on:success="logined"></login>
        </div>
        <div v-else-if="agreement" class="fullheight">
            <!--<game></game>-->
            <agreement v-on:agree="agree"></agreement>
        </div>
        <div v-else-if="game" class="fullheight">
            <game v-bind:game="gameWrapper"></game>
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
        //props: ['username', 'wif'],
        created: function() {
            let permStorage = localStorage['permissions'];
            if (permStorage != undefined) {
                let permissions = JSON.parse(permStorage);
                this.login = false;
                this.agreement = true;
                this.$store.commit('permissions', permissions);
                //console.log('user', this.$store.state.user)            
                // Game.play(permissions.posting, permissions.user, function(err, game) {
                //     if (err) {
                //         console.log(err);
                //         return;
                //     }

                //     this.agreement = false;
                //     this.game = true;
                //     this.gameWrapper = game;
                // });
            }

            getCurrentState((state, game) => {
                this.agreement = state != STATUS_PLAYING;
                this.game = state == STATUS_PLAYING;
                this.gameWrapper = game;
            });
        },

        data: function () {
            return {
                login: true,
                agreement: false,
                game: false
            }
        },

        methods: {
            verifyUser () {
                verifyUser(this.username, this.wif);
            },

            agree: function(id) {
                // Game.play(this.wif, this.username, function(err, game) {
                //     if (err) {
                //         console.log(err);
                //         return;
                //     }

                //     this.login = false;
                //     this.agreement = false;
                //     this.game = true;
                //     this.gameWrapper = game;
                // });
            },
            logined: function(id) {
                this.login = false;
                this.agreement = true;
            }
        }
    };
</script>