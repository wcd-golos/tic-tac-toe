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
                    let permissions =  {
                        user: username,
                        posting: keys.posting,
                        active: keys.active
                    }
                    localStorage.permissions = JSON.stringify(permissions);
                    contex.$store.commit('permissions', permissions);
                    contex.$store.commit('state', 1);
                    //contex.$emit('success', 1);
                } else {
                    alert("Неверно имя пользователя либо пароль");
                }
            } else {
                alert('В системе нет такого пользователя');
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
                verifyUser(this.username, this.masterPassword, this);
            },
        }
    };
</script>