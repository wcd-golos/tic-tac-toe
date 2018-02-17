<template>
    <div>
        <div v-if="agreement">
            <agreement v-on:agree="agree"></agreement>
        </div>
        <div v-else-if="game">
            <game v-bind:game="gameWrapper"></game>
        </div>
    </div>
</template>

<script>

    var STATUS_NEW = 0;
    var STATUS_PLAYING = 1;
    var STATUS_DONE = 2;

    var golosJs = require('golos-js');

    var verifyUser = (username, privWif) => {

        //Проверяем наличие акаунта
        //Делаем запрос на получение акаутна по введенному логину
        golosJs.api.getAccounts([username], function(err, result) {
            //Проверяем есть ли возвращенные значения
            if (result.length) {
                //Берем публичный ключ
                var pubWif = result[0].posting.key_auths[0][0];
                //Проверяем введенный пользователем приватный ключ на валидность
                if (golosJs.auth.isWif(privWif)) {
                    //Проверяем соответствие приватного и публичного ключей
                    if (golosJs.auth.wifIsValid(privWif, pubWif)) {
                        //Привязываем данные Голоса к аккаунту пользователя
                        console.log("Success!");
                    } else {
                        //Возвращаем сообщение об ошибке "Не соответствие приватного и публичного ключей"
                        console.log('The private key does not match the public key');
                    }
                } else {
                    //Возвращаем сообщение об ошибке "Указанный приватный ключ не является валидным"
                    console.log('The private key specified is not valid');
                }
            } else {
                //возврат ошибки "Учетная запись пользователя не определена"
                console.log('user account is not defined')
            }
        });
    };

    var getActiveGame  = function () {
        return localStorage.currentGame || 0;
    };

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
        props: ['username', 'wif'],

        created: function() {
            Game.createGame(this.wif, this.username, (err, game) => {
                console.log(err, game);
            });

            getCurrentState((state, game) => {
                this.agreement = state != STATUS_PLAYING;
                this.game = state == STATUS_PLAYING;
                this.gameWrapper = game;
            });
        },

        data: function () {
            return {
                agreement: true,
                game: false,
                game: null
            }
        },

        methods: {
            verifyUser () {
                verifyUser(this.username, this.wif);
            },

            agree: function(id) {
                Game.play(this.wif, this.username, function(err, game) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    this.agreement = false;
                    this.game = true;
                    this.gameWrapper = game;
                });
            }
        }
    };
</script>