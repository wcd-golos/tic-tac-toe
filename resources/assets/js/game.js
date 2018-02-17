var golosJs = require('golos-js');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function Game( id, author ) {
    this.id = id;
    this.author = author;
}

Game.PARENT_PERMLINK = 'cross-zero-game';

Game.prototype.author = null;
Game.prototype.moves = [];
Game.prototype.isDone = false;
Game.prototype.isNew = true;

Game.getGame = function( author, gameId ) {
    golosJs.api.getContent(author, gameId, function(err, result) {
        if (err) {
            return cb(STATUS_NEW);
        }
    });
};

Game.createGame = function ( wif, author, cb ) {
    golos.api.login('', '', function(err, result) {
        if (err || !result) {
            return cb(err);
        }

        var permlink = Game.generateId();
        var title = `Игра создана ${ author }`;
        var body = JSON.stringify({creator: username});
        var jsonMetadata = '{}';

        golos.api.login('', '', function(err, result) {

            if (err || !result) {
                return cb(err);
            }

            golos.broadcast.comment(wif, '', Game.PARENT_PERMLINK, author, permlink, title, body, jsonMetadata, function(err, result) {
                if (err) {
                    return cb(err);
                }

                cb(null, new Game());
            });
        });
    });
};

Game.getLastGame = function (cb) {
    let query = {
        select_tags: [Game.PARENT_PERMLINK],
        limit: 1,
    }

    golos.api.getDiscussionsByTrending(query, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, new Game());
    });
};

Game.play = function(cb) {
    Game.getLastGame((err, game) => {
        if (err) {
            return cb(err);
        }

        if (game == null || !game.isNew) {
            return Game.createGame(0,0, cb);
        }

        return cb(null, game);
    });
};

Game.generateId = function () {
    return guid();
};