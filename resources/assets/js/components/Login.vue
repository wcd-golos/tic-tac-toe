<template>
    <div class="gradient">
        <form action="">
            <img src="images/logo.png" alt="" class="start-img">
            <div class="input-group-item">
                <input type="text" v-model="username" name="" placeholder="Имя пользователя">
                <input type="text" v-model="masterPassword" name="" placeholder="Мастер пароль">
            </div>
            <button type="button" class="submit-main-screen" v-on:click="login">Логин</button>
        </form>
    </div>
</template>
<script>
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

    export default {
        data: function() {
            return {
                username: '',
                masterPassword: ''
            }
        },
        methods: {
            login: function () {
                if(this.username == '') {
                    alert('Введите имя пользователя');
                    return;
                } else if(this.masterPassword == '') {
                    alert('Введите мастер пароль');
                    return;
                }
                verifyUser(this.username, this.masterPassword);
            },
        }
    };
</script>