<template>
    <div class="gradient">
        <div class="screen2">
            <img src="images/img1.png" alt="" class="start-img">
            <h3>Добро пожаловать! <br> Играть <b>=</b> <span>0.01 голос</span></h3>
            <a href="javascript:void(0);" v-if="!loader" class="link-btn" v-on:click="emit">ИГРАТЬ</a>
            <div v-if="loader">
                <div class="sk-circle">
                    <div class="sk-circle1 sk-child"></div>
                    <div class="sk-circle2 sk-child"></div>
                    <div class="sk-circle3 sk-child"></div>
                    <div class="sk-circle4 sk-child"></div>
                    <div class="sk-circle5 sk-child"></div>
                    <div class="sk-circle6 sk-child"></div>
                    <div class="sk-circle7 sk-child"></div>
                    <div class="sk-circle8 sk-child"></div>
                    <div class="sk-circle9 sk-child"></div>
                    <div class="sk-circle10 sk-child"></div>
                    <div class="sk-circle11 sk-child"></div>
                    <div class="sk-circle12 sk-child"></div>
                </div>
            </div>
            <!-- <button v-on:click="addPost()">Post</button> -->
            <!-- <button v-on:click="addComment()">Comment</button> -->
        </div>
    </div>
</template>

<script>
    var golosJs = require('golos-js');
    //import Store from './../store'


    //проверяем достаточно ли голосов у пользователя
    let checkAccountGolosCount = (username, game_golos_rate) => {
        golosJs.api.getAccounts([username], function(err, response){
            if (!err) {
                $.each(response, function(index, val) {
                    var golos_count = parseFloat(val.balance.slice(0, -5)).toFixed(3);
                    if (golos_count < game_golos_rate) {
                        return false;
                        alert('У вас не достаточно средств на счету для начала игры');
                    }
                });
            } else {
                alert('Не удалось получить данные аккаунта');
            }
            return true;
        });
    }

    export default {
        data: function() {
            return {
                loader: false
            }
        },
        created: function() {
            //this.getActiveGames();
        },
        methods: {
            emit: function () {
                checkAccountGolosCount(this.$store.state.user, this.$store.state.game_golos_rate);
                if (this.loader) {
                    return;
                }

                this.loader = true;
                var user = {
                    login:  this.$store.state.user,
                    key: this.$store.state.posting
                };

                Game.play(user, (err, result) => {
                    if (!err) {
                        console.log('new game', result);
                        if (result.state === 0) {
                            //создание новой игры
                            //Запускаем вебсокеты и ждем когда присоеденится опонент
                            console.log('game start Ready');
                            this.startReady(result.permLink);
                        } else if (result.state === 1) {
                            //присоединение к игре
                            console.log('joined to game');
                        }
                    } else {
                        console.log('err', err);
                        if (err.payload.id == 11) {
                            this.loader = false;
                            alert('Попробуйте чуть по позже');
                        }
                    }
                });
            },
            startReady(permLink) {
                let websocket = new WebSocket("wss://ws.golos.io");
                websocket.onopen = (event) => {
                    websocket.send(JSON.stringify({
                        id: 1,
                        method: 'call',
                        params: ["database_api", "set_block_applied_callback", [0]]
                    }));

                    websocket.onmessage = (raw) => {
                        var data = JSON.parse(raw.data);
                        if (data.method === 'notice' && data.params) {
                        var hex = data.params[1][0].previous.slice(0,8);
                        var height = parseInt(hex, 16);

                        websocket.send(JSON.stringify({
                            id: 2,
                            method: 'call',
                            params: ['database_api', 'get_ops_in_block', [height, "false"]]
                        }));

                        } else if (data.id === 2) {
                            //console.log('.');
                            let start = Game.blockFilter(data.result, permLink);
                            if (start) {
                                //go to game
                                console.log('go to game');
                            }
                        }
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
    .title {
        margin-bottom: 30px;
    }

    .start-link {
        cursor: pointer;
    }
</style>