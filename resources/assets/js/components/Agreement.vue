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
                    Согласен
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            emit: function () {
                this.$emit('agree', 1);
            },
        }
    };
</script>