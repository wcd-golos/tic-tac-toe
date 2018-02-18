<template>
    <section class="game-proccess">
        <div class="header">
            <h2>{{ myName }} VS {{ hisName }}</h2>
        </div>
        <div class="proccess">
            <div class="sect">
                <div class="member">
                    <h3>{{ myName }}</h3>
                    <img src="images/muted-left.png" alt="" class="ava-member">
                </div>
            </div>
            <div class="sect">
                <div class="field-container">
                    <h3 v-if="myStep">
                        <span v-if="time != 0">Ваш ход через {{ time }} сек.</span>
                        <span v-else>Ваш ход!</span>
                    </h3>
                    <h3 v-if="!myStep">Ход оппонента</h3>

                    <div class="field">
                        <div v-bind:class="$store.state.winclass" class="result-win"></div>
                        <div class="rov" v-for="(row,i) in map" :key="i">
                            <div class="col" v-for="(col, j) in map[i]" :key="j">
                                <div class="cell" v-if="map[i][j] == 1" v-on:click="step(i, j)"><img src="images/circle.png" alt=""></div>
                                <div class="cell" v-else-if="map[i][j] == 2" v-on:click="step(map[i][j], i, j)"><img src="images/cross.png" alt=""></div>
                                <div class="cell" v-else-if="map[i][j] == 0" v-on:click="step(map[i][j], i, j)"><img src="images/empty.png" alt=""></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sect">
                <div class="member">
                    <h3>{{ hisName }}</h3>
                    <img src="images/active-right.png" alt="" class="ava-member">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    var count= 3;
    var GAME_WIN = 1;
    var GAME_FAIL = 0;
    var GAME_IN_PROGRESS = 2;
    var GAME_DRAW = 3;

    //0 => null
    //1 => X
    //2 => O
    var map = [];

    //init map values
    for(let i = 0; i < count; i++) {
        Vue.set(map, i, []);
        for(let j = 0; j < count; j++) {
            Vue.set(map[i], j, 0);
        }
    }

    let checkDiagonal = (symb) => {
        let toright, toleft, res = false;
        let inProgress= false, isInProgressRight = false, isInProgressLeft = false;
        let winClass = '';
        toright = true;
        toleft = true;
        for (let i=0; i < count; i++) {
            toright &= (map[i][i] == symb);
            toleft &= (map[count - i - 1][i] == symb);

            isInProgressRight = (map[i][i] == 0);
            isInProgressLeft = (map[count - i - 1][i] == 0);
        }

        if (toright) winClass = 'win-00-22';
        if (toleft) winClass = 'win-20-02';
        if (toright || toleft) res = true;

        //если нет выйграша то проверка на незаконченную игру
        if(!res) {
            if (isInProgressRight || isInProgressLeft) inProgress = true;
        }

        if(res === true) {
            return [GAME_WIN, winClass];
        } else {
            return [GAME_IN_PROGRESS, winClass];
        }
    };

    let checkLines = (symb) => {
        let cols = 0, rows = 0, res = false;
        let inProgress= false, isInProgressRight = false, isInProgressLeft = false;
        let winClass = '';
        for (let col=0; col < count; col++) {
            cols = true;
            rows = true;
            for (let row=0; row < count; row++) {
                cols &= (map[col][row] == symb);
                rows &= (map[row][col] == symb);

                isInProgressRight = (map[col][row] == 0);
                isInProgressLeft = (map[row][col] == 0);
            }

            if (rows) winClass = 'win-'+col+'0-'+col+'2';
            if (cols) winClass = 'win-0'+col+'-2'+col;
            if (cols || rows) return [GAME_WIN, winClass];
        }
        //если нет выйграша то проверка на незаконченную игру
        if(!res) {
            if (isInProgressRight || isInProgressLeft) inProgress = true;
        }

        return [GAME_IN_PROGRESS, winClass];
    };

    let isGameEnded = () => {
        for (let col=0; col < count; col++) {
            for (let row=0; row < count; row++) {
                if(map[col][row] == 0) {
                    return false;
                }
            }
        }
        return true;
    }

    // symbol 0 is 1
    // symbol X is 0
    let checkWin = (sym) => {
        let resLines = checkLines(sym);
        let resDiags = checkDiagonal(sym);
        
        if(resLines[0] == GAME_WIN) {
            return resLines;
        } else if(resDiags[0] == GAME_WIN) {
            return resDiags;
        } else if(resLines[0] == GAME_IN_PROGRESS || resDiags[0] == GAME_IN_PROGRESS) {
            return [GAME_IN_PROGRESS, ''];
        } else if (isGameEnded()) {
            return [GAME_DRAW, ''];
        }
        console.log(resLines);
        console.log(resDiags);
    };

    export default {
        props: ['game'],

        data: () => {
            return {
                map: map,
                body: '',
                myName: '',
                hisName: 'Петя',
                myStep: true,
                time: 20
                //game: null
            }
        },
        created: function() {
            this.onInit();
            let permissions = JSON.parse(localStorage.permissions);
            this.myName = permissions.user;
            this.waitForStep();
            console.log('this.game', this.$store.state.game);
        },
        methods: {
            verifyUser () {
                verifyUser();
            },
            waitForStep() {
                this.time = 20;
                var timer = setInterval(() => {
                    this.time--;
                    console.log(this.time);
                    if(this.time == 0) clearInterval(timer);
                }, 1000);
            },
            step(valueInCell, i, j) {
                if(valueInCell != 0) {
                    alert('Вы не можете сделать ход в эту клетку');
                    return;
                } else {
                    Vue.set(map[i], j, 1);
                    let res = checkWin(1);
                    if(res[0] == GAME_WIN) {
                        console.log(res);
                        this.$store.commit('winclass', res[1]);
                        alert('!!!Вы выйграли!!!');
                    } else if(res[0] == GAME_DRAW) {
                        alert('Ничья!');
                    }
                }
            },
            onInit() {
//                var timer = setInterval(() => {
//                    Vue.set(map[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 3), Math.floor(Math.random() * 3));
//                    let res = checkWin(1);
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