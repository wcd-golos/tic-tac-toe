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

    //import Store from './../store'

    export default {
        data: function() {
            return {
                loader: false
            }
        },
        methods: {
            emit: function () {
                if (this.loader) {
                    return;
                }
                this.loader= true;
                //this.$emit('agree', 1);
                //проверям есть ли активне посты
                //если нет создаем нувую игру
                console.log('store', this.$store.state.user);
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