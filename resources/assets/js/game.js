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

function comment(user, parentAuthor, parentId, title, tags, cb) {
    golosJs.api.login('', '', function(err, result) {
        if (err || !result) {
            return cb(err);
        }

        var newId = Game.generateId();
        var body = JSON.stringify({creator: user.login});
        var allTags = [parentId].concat(tags);

        var jsonMetadata = {
            tags: allTags
        };

        if (err || !result) {
            return cb(err);
        }

        golosJs.broadcast.comment(user.key, parentAuthor, parentId, user.login, newId, title, body, JSON.stringify(jsonMetadata), function(err, result) {
            cb(err, result, newId);
        });
    });
}

function Game( id, author ) {
    this.id = id;
    this.author = author;

    this.moves = [];
    this.opponent = null;
    this.isMy = true;
    this.state = Game.STATUS_NEW;

    this.matrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
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

Game.prototype.move = function( user, x, y, cb ) {
    console.log('move');

    comment(user, game.author, game.id, user.login, ['MOVE'], function(err, result, id) {
        console.log('MOVE', err, result);
        cb(err, result);
    });
};

Game.getCurrentGame = function() {
    console.log('getCurrentGame');

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
    console.log('getGame');

    golosJs.api.getContent(author, gameId, function(err, result) {
        if (err) {
            return cb(err);
        }

        if (!result || !result.id) {
            return cb(null, null);
        }

        var game = new Game(gameId, author);
        game.state = Game.STATUS_NEW;

        golosJs.api.getContentReplies(author, gameId, function(err, result) {
            console.log('getContentReplies');

            if (err) {
                return cb(err);
            }

            if (result.length) {
                game.state = Game.STATUS_PLAYING;
            }

            result.forEach(comment => {
                try {
                    var meta = JSON.parse(comment.jsonMetadata);
                    var tags = meta.tags || [];
                    var body = comment.body;

                    if (meta.indexOf('OPPONENT')) {
                        game.opponent = body;
                    } else if (meta.indexOf('MOVE')) {

                    } else if (meta.indexOf('WIN')) {

                    } else if (meta.indexOf('DONE')) {
                        game.state = Game.STATUS_DONE;
                    }

                } catch (e) {

                }
            });

            return cb(null, game);
        });
    });
};

Game.createGame = function ( user, cb ) {
    console.log('createGame');

    var title = `Игра создана ${ user.login }`;

    comment(user, '',  Game.PARENT_PERMLINK, title, ['test'], function(err, result, gameId) {
        console.log('CREATE post/comment', err, result);

        if (err) {
            return cb(err);
        }

        var game = new Game(gameId, user.login);

        cb(null, game);
    });
};

Game.getLastGame = function (cb) {
    console.log('getLastGame');

    let query = {
        select_tags: [Game.PARENT_PERMLINK],
        limit: 1,
    }

    golosJs.api.getDiscussionsByCreated(query, (err, result) => {

        if (err) {
            return cb(err);
        }

        if (!result.length) {
            return cb(null, null);
        }

        console.log(result);

        result = result[0];
        var game = new Game(result.permlink, result.author);

        return cb(null, game);
    });
};

Game.play = function(user, cb) {
    console.log('play');

    Game.getLastGame((err, game) => {

        if (err) {
            return cb(err);
        }

        if (game == null) {
            return Game.createGame(user, cb);
        }

        Game.getGame(game.author, game.id, (err, game) => {
            if (err) {
                return cb(err);
            }

            if (game.state != Game.STATUS_NEW) {
                return Game.createGame(user, cb);
            }

            console.log(game);

            game.join(user, function(err) {
                cb(err, game);
            });
        });
    });
};

Game.prototype.join = function( user, cb ) {
    console.log('join');

    comment(user, this.author, this.id, user.login, ['OPPONENT'], function(err, result, id) {
        console.log('CREATE post/comment', err, result);
        cb(err, result);
    });
};

Game.generateId = function () {
    return guid();
};

window.Game = Game;