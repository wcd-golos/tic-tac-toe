<template>
    <div>
        <div class="str" v-for="(row,i) in map">
            <div class="col" v-for="(col, j) in map[i]">
                <div v-if="map[i][j] == 1">O</div>
                <div v-else-if="map[i][j] == 2">X</div>
                <div v-else="map[i][j] == 0">&nbsp;</div>
            </div>
        </div>
    </div>
</template>

<script>
    var golosJs = require('golos-js');
    var count= 3;

    var username = 'a-borisov';
    var privWif = '5JCQ7FGt4fWN5ggL1rqL9aFiT9Ah2c9494Ej6CQ7fNLuWXd4pF6';

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
        for(let j = 0; j < count; j++) {
            map[i][j] = 0;
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
        let toright, toleft;
        toright = true;
        toleft = true;
        for (let i=0; i < count; i++) {
            toright &= (map[i][i] == symb);
            toleft &= (map[count - i - 1][i] == symb);
        }

        if (toright || toleft) return true;

        return false;
    };

    let checkLanes = (symb) => {
        let cols = 0, rows = 0;
        for (let col=0; col < count; col++) {
            cols = true;
            rows = true;
            for (let row=0; row < count; row++) {
                cols &= (map[col][row] == symb);
                rows &= (map[row][col] == symb);
            }

            if (cols || rows) return true;
        }

        return false;
    };

    let checkWin = (sym) => {
        return checkLanes(sym) || checkDiagonal(sym);
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
            onInit() {
                var timer = setInterval(function() {
                    Vue.set(map[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 3), Math.floor(Math.random() * 3));
                    let res = checkWin(1);
                    if(res) clearInterval(timer);
                    console.log('Результат: ' + (res ? 'win' : 'fail'));
                }, 100);

            }
        }
    };
</script>