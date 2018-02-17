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

    this.moves = [];
    this.state = Game.STATUS_NEW;
}

Game.PARENT_PERMLINK = 'cross-zero-game';

Game.STATUS_NEW = 0;
Game.STATUS_PLAYING = 1;
Game.STATUS_DONE = 2;

Game.prototype.persist = function () {
    var game = {
        id: this.id,
        author: this.author
    };

    localStorage.currentGame = JSON.stringify(game);
};

Game.prototype.move = function( x, y ) {

};

Game.getCurrentGame = function() {
    var defaultResult = { id: 0, author: null };

    try {
        if (!localStorage.currentGame) {
            return defaultResult;
        }

        return JSON.parse(localStorage.currentGame);
    } catch (e) {
        return defaultResult;
    }
};

Game.getGame = function( author, gameId, cb ) {
    golosJs.api.getContent(author, gameId, function(err, result) {
        if (err) {
            return cb(err);
        }

        if (!result || !result.id) {
            return cb(null, null);
        }

        var game = new Game(gameId, author);

        golosJs.api.getContentReplies(author, gameId, function(err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, game);
        });
    });
};

Game.createGame = function ( wif, author, cb ) {
    golosJs.api.login('', '', function(err, result) {
        if (err || !result) {
            return cb(err);
        }

        var gameId = Game.generateId();
        var title = `Игра создана ${ author }`;
        var body = JSON.stringify({creator: author});
        var jsonMetadata = '{}';

        golosJs.api.login('', '', function(err, result) {

            if (err || !result) {
                return cb(err);
            }

            golosJs.broadcast.comment(wif, '', Game.PARENT_PERMLINK, author, gameId, title, body, jsonMetadata, function(err, result) {
                if (err) {
                    return cb(err);
                }

                var game = new Game(gameId, author);

                cb(null, game);
            });
        });
    });
};

Game.getLastGame = function (cb) {
    let query = {
        select_tags: [Game.PARENT_PERMLINK],
        limit: 1,
    }

    golosJs.api.getDiscussionsByTrending(query, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, new Game());
    });
};

Game.play = function(wif, username, cb) {
    Game.getLastGame((err, game) => {
        if (err) {
            return cb(err);
        }

        if (game == null || game.state != Game.STATUS_NEW) {
            return Game.createGame(wif, username, cb);
        }

        game.join(username, function(err) {
            cb(err, game);
        });
    });
};

Game.prototype.join = function( username, cb ) {

};

Game.generateId = function () {
    return guid();
};

window.Game = Game;