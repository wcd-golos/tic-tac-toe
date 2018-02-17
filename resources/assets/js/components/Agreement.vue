<template>
    <div class="home">
        <div class="flex-center position-ref full-height">
            <div class="content">
                <div class="title m-b-md">
                    Добро пожаловать в игру!<br/>
                    Чтобы начать игру Вам нужно перечислить 0.01 голос для начала игры
                </div>
                <!--<a class="start-link" v-on:click="emit" href="/games">-->
                <a class="start-link" v-on:click="emit">
                    Играть
                    <div v-if="loader">Loading...</div>
                </a>
            </div>
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
                //this.$emit('agree', 1);
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