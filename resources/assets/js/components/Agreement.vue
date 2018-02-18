<template>
    <div class="gradient">
        <div class="screen2">
            <h3>Добро пожаловать! <br> Играть <b>=</b> <span>0.01 голос</span></h3>
            <a href="javascript:void(0);" v-if="!loader" class="link-btn" v-on:click="emit">ИГРАТЬ</a>
            <div v-if="loader">Загрузка...</div>
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
        methods: {
            emit: function () {
                checkAccountGolosCount(this.$store.state.user, this.$store.state.game_golos_rate);
                if (this.loader) {
                    return;
                }
                this.loader= true;
                this.$emit('agree', 1);
                //проверям есть ли активне посты
                //если нет создаем нувую игру
                //console.log('store', this.$store.state.user);
                // Game.play(this.$store.state.posting, this.$store.state.user, (err, result) => {
                //     //conole.log('err', err);
                //     //console.log('res'. result);
                // });
            },
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