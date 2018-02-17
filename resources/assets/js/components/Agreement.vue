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
                this.$emit('agree', 1);
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