<template>
    <div class="gradient">
        <form action="">
            <img src="images/logo.png" alt="" class="start-img">
            <div class="input-group-item">
                <input type="text" v-model="username" name="" placeholder="Имя пользователя">
                <input type="password" v-model="masterPassword" name="" placeholder="Мастер пароль">
            </div>
            <button type="button" class="submit-main-screen" v-on:click="login">Логин</button>
        </form>
    </div>
</template>
<script>
    var golos = require('golos-js');
    //import Store from './../store';

    var verifyUser = (username, password, contex) => {

        //проверяем наличие аккаунта
        golos.api.getAccounts([username], (err, result) => {
            let postingPubkey = result[0].posting.key_auths[0][0];
            if (result.length) {
                let roles = ['active', 'posting'];
                let keys = golos.auth.getPrivateKeys(username, password, roles);
                if (postingPubkey === keys.postingPubkey) {
                    //TODO взять 
                    var gameGolosRate = 0.011;
                    checkAccountGolosCount(username, gameGolosRate);

                    let permissions =  {
                        user: username,
                        posting: keys.posting,
                        active: keys.active
                    }
                    localStorage.permissions = JSON.stringify(permissions);
                    this.$store.commit('permissions', permissions);
                    contex.$emit('success', 1);
                } else {
                    alert("Неверно имя пользователя либо пароль");
                }
            } else {
                alert('В системе нет такого пользователя');
            }
        });
    };

    //проверяем достаточно ли голосов у пользователя
    let checkAccountGolosCount = (username, gameGolosRate) => {
        golos.api.getAccounts([username], function(err, response){
            if (!err) {
                $.each(response, function(index, val) {
                    var golos_count = parseFloat(val.balance.slice(0, -5)).toFixed(3);
                    if (golos_count < gameGolosRate) {
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
                verifyUser(this.username, this.masterPassword, this);
            },
        }
    };
</script>