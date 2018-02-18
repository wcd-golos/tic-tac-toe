<template>
    <div v-if="$store.state.win" class="fullheight">
        <div class="gradient">
            <div class="win-page">
                <img src="images/win.png" alt="">
                <h2>Поздравляем !!!</h2>
                <div class="content">
                    Вы победили! <br> Cумма вашего выигрыша
                    <span class="big">20 <small>голосов</small></span>
                </div>
                <div class="btn-gr">
                    <a href="javascript:void(0)" v-on:click="repeat" class="link-btn">Cыграть еще раз?</a>
                    <a href="javascript:void(0)" v-on:click="no" class="link-btn">Нет спасибо!</a>
                </div>
            </div>
        </div>
    </div>

    <div v-if="$store.state.fail" class="fullheight">
        <div class="gradient">
            <div class="win-page">
                <img src="images/no-win.png" alt="">
                <h2>Попробуйте еще раз!</h2>
                <div class="btn-gr">
                    <a href="javascript:void(0)" v-on:click="repeat" class="link-btn">Играть</a>
                    <a href="javascript:void(0)" v-on:click="no" class="link-btn">Нет спасибо!</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data: () => {
            return {
                win: this.$store.state.win
            }
        },
        methods: {
            repeat() {
                this.$store.commit('state', 1);
            },
            no() {
                this.$store.commit('state', 0);
            }
        }
    }
</script>