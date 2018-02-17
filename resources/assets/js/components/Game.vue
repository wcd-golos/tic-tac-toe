<template>
    <div>
        <div class="str" v-for="(row,i) in map">
            <div class="col" v-for="(col, j) in map[i]">
                <div v-if="map[i][j] == 1" v-on:click="step(i, j)">O</div>
                <div v-else-if="map[i][j] == 2" v-on:click="step(map[i][j], i, j)">X</div>
                <div v-else="map[i][j] == 0" v-on:click="step(map[i][j], i, j)">&nbsp;</div>
            </div>
        </div>
    </div>
</template>

<script>
    var golosJs = require('golos-js');
    var count= 3;
    var GAME_WIN = 1;
    var GAME_FAIL = 0;
    var GAME_IN_PROGRESS = 2;
    var GAME_DRAW = 3;

    //верификация пользователя
    var verifyUser = () => {

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

    let addPost = (title, body) => {
        //Добавить пост
        /**
         * comment() add a post
         * @param {Base58} wif - private posting key
         * @param {String} parentAuthor - for add a post, empty field
         * @param {String} parentPermlink - main tag
         * @param {String} author - author of the post
         * @param {String} permlink - url-address of the post
         * @param {String} title - header of the post
         * @param {String} body - text of the post
         * @param {String} jsonMetadata - meta-data of the post (images etc.)
         * Это тестовый пост записанный с использованием golos-js
         */

        var wif = privWif;
        var parentAuthor = '';
        var parentPermlink = 'golos-laravel-catalog';
        var author = username;
        var permlink = `golos-laravel-catalog-${Date.now()}`;
        var title = title;
        var body = body;
        var jsonMetadata = '{}';

        golosJs.api.login('', '', function(err, result) {
            console.log('broadcast enable');
            //console.log(err, result);
            if (result === true) {
                golosJs.broadcast.comment(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, function(err, result) {
                    if (!err) {
                        console.log('comment', result);
                    }
                    else console.error(err);
                });
            } else {
                console.log('Упппсс... Что то пошло не так!');
            }
        });
    };

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


    //map codes to array index
    //b2 to map[1][1]
    let mapping = (code) => {
        let letters = ['a', 'b', 'c'];
        let nums = [1, 2, 3];

        let chars = code.split('');

        let first, second;

        for(let i = 0; i < count; i++) {
            if(letters[i] == chars[0]) {
                first = i;
            }
            if(nums[i] == chars[1]) {
                second = i;
            }
        }

        return [first, second];
    };

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
        } else if(inProgress) {
            return [GAME_IN_PROGRESS, winClass];
        } else {
            return [GAME_FAIL, winClass];
        }
    };

    let checkLanes = (symb) => {
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

            if (cols) winClass = 'win-'+col+'0-'+col+'2';
            if (rows) winClass = 'win-0'+col+'-2'+col;
            if (cols || rows) return [GAME_WIN, winClass];
        }
        //если нет выйграша то проверка на незаконченную игру
        if(!res) {
            if (isInProgressRight || isInProgressLeft) inProgress = true;
        }

        if(inProgress) {
            return [GAME_IN_PROGRESS, winClass];
        } else {
            return [GAME_FAIL, winClass];
        }
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

    let checkWin = (sym) => {
        let resLines = checkLanes(sym);
        let resDiags = checkDiagonal(sym);
        
        if(resLines[0] == GAME_WIN) {
            console.log(resLines[1]);
            return GAME_WIN;
        } else if(resDiags[0] == GAME_WIN) {
            console.log(resDiags[1]);
            return GAME_WIN;
        } else if(checkLanes(sym)[0] == GAME_IN_PROGRESS || checkDiagonal(sym)[0] == GAME_IN_PROGRESS) {
            return GAME_IN_PROGRESS;
        } else if (isGameEnded()) {
            return GAME_DRAW;
        }
    };

    export default {
        data: () => {
            return {
                map: map,
                body: ''
            }
        },
        created: function() {
            this.onInit();
        },
        methods: {
            verifyUser () {
                verifyUser();
            },
            step(valueInCell, i, j) {
                if(valueInCell != 0) {
                    alert('Вы не можете сделать ход в эту клетку');
                    return;
                } else {
                    Vue.set(map[i], j, 1);
                    let res = checkWin(1);
                    if(res == GAME_WIN) {
                        alert('!!!Вы выйграли!!!');
                    } else if(res == GAME_DRAW) {
                        alert('Ничья!');
                    }
                }
            },
            onInit() {
                var timer = setInterval(function() {
                    Vue.set(map[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 3), Math.floor(Math.random() * 3));
                    let res = checkWin(1);
                    if(res == GAME_WIN) clearInterval(timer);
                    console.log('Результат: ' + (res));
                }, 100);

            }
        }
    };
</script>