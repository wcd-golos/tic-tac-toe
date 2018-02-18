<template>
    <section class="game-proccess">
        <div class="header">
            <h2>{{ $store.state.game.author }} VS {{ $store.state.game.opponent }}</h2>
        </div>
        <div class="proccess">
            <div class="sect">
                <div class="member">
                    <h3>{{ $store.state.game.author }}</h3>
                    <img src="images/active-left.png" v-if="$store.state.game.myMove" alt="" class="ava-member">
                    <img src="images/muted-left.png" v-else alt="" class="ava-member">
                </div>
            </div>
            <div class="sect">
                <div class="field-container">
                    <h3 v-if="$store.state.game.myMove">
                        <span v-if="time != 0">Ваш ход через {{ time }} сек.</span>
                        <span v-else>Ваш ход!</span>
                    </h3>
                    <h3 v-if="!$store.state.game.myMove">Ход оппонента</h3>

                    <div class="field">
                        <div v-bind:class="$store.state.winclass" class="result-win"></div>
                        <div class="rov" v-for="(row,i) in $store.state.game.map" :key="i">
                            <div class="col" v-for="(col, j) in $store.state.game.map[i]" :key="j">
                                <div class="cell" v-if="$store.state.game.map[i][j] == 1" v-on:click="step(i, j)"><img src="images/circle.png" alt=""></div>
                                <div class="cell" v-else-if="$store.state.game.map[i][j] == 2" v-on:click="step($store.state.game.map[i][j], i, j)"><img src="images/cross.png" alt=""></div>
                                <div class="cell" v-else-if="$store.state.game.map[i][j] == 0" v-on:click="step($store.state.game.map[i][j], i, j)"><img src="images/empty.png" alt=""></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sect">
                <div class="member">
                    <h3>{{ $store.state.game.opponent }}</h3>
                    <img src="images/active-right.png" v-if="!$store.state.game.myMove" alt="" class="ava-member">
                    <img src="images/muted-right.png" v-else alt="" class="ava-member">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    export default {
        data: () => {
            return {
                time: 20
            }
        },
        created: function() {
            this.onInit();
            this.waitForStep();
            console.log('this.game', this.$store.state.game);

            setInterval(() => {
                Game.sync(this.$store.state.game, JSON.parse(localStorage.permissions).user, function () {
                    console.log('sync');
                });
            }, 1000);
        },
        methods: {
            verifyUser () {
                verifyUser();
            },

            waitForStep() {
                this.time = 20;
                var timer = setInterval(() => {
                    this.time--;
                    if(this.time == 0) clearInterval(timer);
                }, 1000);
            },

            step(valueInCell, i, j) {
                if(!this.$store.state.game.myMove) {
                    console.log('Ход оппонента');
                    return;
                }
                let permissions = JSON.parse(localStorage.permissions);
                this.$store.state.game.move({
                    login: permissions.user,
                    key: permissions.posting
                }, i, j, (err, res) => {
                    console.log('MOVE: '+this.$store.state.game.myMove);
                    if(err) {
                        console.log(err);
                        return;
                    }
                });
            },

            onInit() {
//                var timer = setInterval(() => {
//                    var val = Math.floor(Math.random() * 3);
//                    if(val == 1) {
//                        this.$store.state.game.myMove = true;
//                    } else {
//                        this.$store.state.game.myMove = false;
//                    }
//
//                    Vue.set(this.$store.state.game.map[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 3), val);
//                    this.$store.commit('winclass', res[1]);
//                    if(res == undefined) clearInterval(timer);
//                    if(res[0] == GAME_WIN) clearInterval(timer);
//                    console.log('Результат: ' + (res[0]));
//                }, 50);

            },

            getComments(permLink) {
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
                            let result = this.blockFilter(data.result, permLink);
                            if (start) {
                                console.log('result', data.result);
                            }
                        }
                    }
                }
            }
        }
    };
</script>

<style>
    .str {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .str:nth-child(2) {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
    }
    .str .col {
        padding: 10px;
        background-color: #eee;
        flex: 1 1 auto;
        text-align: center;
    }
    .str .col:nth-child(2) {
        border-left: 1px solid #000;
        border-right: 1px solid #000;
    }
</style>