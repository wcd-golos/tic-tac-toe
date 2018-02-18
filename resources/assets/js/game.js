var golosJs = require('golos-js');

//  metadata format
//  message when game created
// {
//     app: Game.PARENT_PERMLINK,
//     type: 'created',
//     creater: username
// }
//  message when user joined
// {
//     "app": 'tic-tac-toe-games',
//     "type": 'start',
//     "userJoined": 'username'
// }
// message when move
// {
//     "app": "tic-tac-toe-games",
//     "type": "type",
//     "user": "username",
//     "x": 1,
//     "y": 1
// }
// message when end game
// {
//     "app": "tic-tac-toe-games",
//     "type": "end",
//     "winner": "username"
// }


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function comment(username, parentAuthor, wif, parentPermlink, title, info, cb) {

    golosJs.api.login('', '', function(err, result) {
        if (err || !result) {
            return cb(err);
        }

        var permLink = Game.generateId();
        var body = JSON.stringify({creator: username});

        var jsonMetadata = {
            info: info
        };

        //wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, function(err, result)
        golosJs.broadcast.comment(wif, parentAuthor, parentPermlink, username, permLink, title, body, jsonMetadata, function(err, result) {
            cb(err, result, permLink);
        });
    });

};

function Game(permLink, author) {
    this.permLink = permLink;
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
};

Game.PARENT_PERMLINK = 'tic-tac-toe-game-test22';

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

Game.prototype.move = function(user, x, y, cb) {
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

Game.getGame = function(author, permLink, cb ) {

    golosJs.api.getContent(author, permLink, function(err, result) {

        if (err) {
            return cb(err);
        }

        // console.log('post', result)
        // if (!result || !result.id) {
        //     return cb(null, null);
        // }
  
        var game = new Game(result.permlink, result.author, 1);
        //console.log('game', game);

        golosJs.api.getContentReplies(result.author, result.permLink, (err, comments) => {
            //console.log('getContentReplies');

            if (err) {
                return cb(err);
            }

            comments.forEach(comment => {
                try {
                    // var meta = JSON.parse(comment.jsonMetadata);
                    // var tags = meta.tags || [];
                    // var body = comment.body;

                    // if (meta.indexOf('OPPONENT')) {
                    //     game.opponent = body;
                    // } else if (meta.indexOf('MOVE')) {

                    // } else if (meta.indexOf('WIN')) {

                    // }
                } catch (e) {

                }
            });

            return cb(null, game);
        });
    });
};

Game.createGame = function (wif, username, cb) {

    var title = `Игра создана ${ username }`;

    jsonMetadata = {
        app: Game.PARENT_PERMLINK,
        type: 'created',
        creater: username
    };

    comment(username, '', wif, Game.PARENT_PERMLINK, title, jsonMetadata, function(err, result, permLink) {
        if (err) {
            return cb(err);
        }

        var game = new Game(permLink, username);
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
        result = result[0];
        console.log('result', result)
        //проверяем наличие комментариев
        golosJs.api.getContentReplies(result.author, result.permlink, (err, comments) => {
            console.log('comments', comments);
            if(!err) {
                //если нет комментариев игра активна
                if (!comments.length) {
                    var game = new Game(result.permlink, result.author);
                    console.log('game', game);
                    return cb(null, game);
                } else {
                    //console.log('comments!', comments);
                    //return cb(null, null)
                    comments.forEach(comment => {

                    });
                }
            } else { cb(err) }
        });
    });
};

Game.play = function(wif, username, cb) {
    Game.getLastGame((err, game) => {

        if (err) {
            return cb(err);
        }

        if (game == null) {
            Game.createGame(wif, username, cb);
            return;
        }

        Game.getGame(game.author, game.permLink, function(err, game) {
            if (err) {
                return cb(err);
            }

            if (game.state != Game.STATUS_NEW) {
                return Game.createGame(wif, username, cb);
            }

            game.join(wif, username, function(err, result) {
                game.state = 1;
                cb(err, game);
            });
        });
    });
};

Game.prototype.join = function(wif, username, cb) {
    //console.log('join');['OPPONENT']
    var jsonMetadata = {
        "app": Game.PARENT_PERMLINK,
        "type": "start",
        "userJoined": username
    };

    comment(username, this.author, wif, this.permLink, '', jsonMetadata, function(err, result, permLink) {
        //console.log('CREATE post/comment', err, result);
        cb(err, result);
    });
};

Game.generateId = function () {
    return guid();
};

Game.blockFilter = function (block, permLink) {
    for(var i = 0; i < block.length; ++i) {
        var type = block[i].op[0];
        if (type === 'comment') {
            var post = block[i].op[1];
            //console.log('parent_permlink', post.parent_permlink);
            if (post.parent_permlink == permLink) {
                //console.log('post', post);
                try {
                    var data = JSON.parse(post.json_metadata);
                    //console.log('jsonMetadata', jsonMetadata);
                    if (data.info.app == Game.PARENT_PERMLINK && data.info.type != 'created') {
                        //console.log('returned true!');
                        return true;
                    }
                } catch(e) {
                    console.log('filter', e);
                    return false;
                }
            }
        }
    }

    return false;
};

window.Game = Game;