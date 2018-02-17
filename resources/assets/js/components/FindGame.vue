<template>
    <div class="home">
        <div class="flex-top position-ref">
            <div class="content">
                <div class="title m-b-md">
                    Поиск игроков
                    <hr/>
                </div>
                <div>
                    Loading...
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var golosJs = require('golos-js');

    let findGame = () => {
        ///TODO: find last post. If it has comments it in progress. Need to create new game.
        //Else join to exist game
    }

    export default {
        data: () => {
            return {
                title: '',
                body: ''
            }
        },
        methods: {
            verifyUser () {
                verifyUser();
            },
            findGame () {
                findGame();
            }
        }
    };
</script>