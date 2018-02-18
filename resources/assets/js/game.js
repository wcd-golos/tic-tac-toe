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
    this.opponent = null;
    this.isMy = true;
    this.myMove = true;

    this.moves = [];
    this.state = Game.STATUS_NEW;

    this.matrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
}

// создать транзакцию
function createTransfer(from, active_wif, to, agent, gbg_amount, golos_amount, fee, sendDeadline, sendEscrowExpiration, terms) {
    console.log('create transfer');

    //генерация id транзакции
    var escrow_id = parseInt(Math.random() * (99999999 - 10000000) + 10000000); // ID транзакции
    console.log('escrow_id: ', escrow_id);

    golosJs.api.getDynamicGlobalProperties(function(err, response) {
        // Added 'Z' reciver get correct UTC time in all browsers
        var ratification_deadline = new Date(response.time+'Z');
        ratification_deadline.setMinutes(ratification_deadline.getMinutes() + parseInt(sendDeadline) * 60 - 1);

        var escrow_expiration = new Date(response.time+'Z');
        escrow_expiration.setHours(escrow_expiration.getHours() + parseInt(sendEscrowExpiration));
        
        console.log('getDynamicGlobalProperties: ', response);

        var objTerms = {
            terms: terms
        };

        // создание транзакции
        golosJs.broadcast.escrowTransfer(
            active_wif, // sender active key
            from, // sender name
            to, // reciver name
            agent, // agent name
            escrow_id, // int, ID создоваемой транзакции,
            gbg_amount, // "0.100 GBG", колличество переводимых золотых голосов
            golos_amount, // "0.100 GOLOS", колличество переводимых голосов
            fee, // "0.001 GOLOS", доход гаранту/агенту в GOLOS или GBG
            ratification_deadline, // hours, период, в течение которого получатель и гарант должны согласится с условиями сделки. Если хоть один не успеет сделать этого, средства будут автоматически возвращены отправителю
            escrow_expiration, // hours, срок, после которого любая из сторон сможет выполнить любые действия (либо забрать средства себе, либо отправить их другой стороне). Этот период не может быть меньше, чем предыдущий
            JSON.stringify(terms),
            function(err, response) {
                if(!err && response.ref_block_num) {
                    console.log('create transaction: ', response);
                    
                    //TODO: сохранить имя отправителя, получателя и код транзакции escrow_id
                } else {
                    console.log('create transaction error: ', err);
                }
            }
        );
    });
}


//получить транзакцию
function loadTransaction(from, escrow_id) {

    golosJs.api.getEscrow(
        from, //отправитель
        escrow_id, // id транзакции
        function(err, response) {
            console.log('load transaction: ', response, err);
            if(err) {
                alert('Не удолось получить транзакцию');
            }
        }
    )
}


// подтверждение перевода агентом и получателем
function approveTransaction(login, wif, from, to, agent, escrow_id, approve) {
    golosJs.broadcast.escrowApprove(
        wif, // активный ключ подтверждающего
        from, // от кого перевод
        to, // кому перевод
        agent, 
        login, // тот кто подтверждает
        escrow_id, // id транзакции
        approve, // true or false
        function(err, response) {
            //console.log('approveTransaction: ', response, err);
            if (err) {
                alert('Не удалось подтвердить транзакцию');
            }
        }
    );
}


// агент решает кому пойдут деньги или отказ от денег одним из пользователей (после подтверждения получателем и агентом, отправитель разрешает перевод)
function releaseTransaction(login, wif, from, to, agent, escrow_id, reciever, gbg_amount, golos_amount) {
    golosJs.broadcast.escrowRelease(
        wif, // ключ того кто отказываеться от денег
        from, // от кого транзакция
        to, // кому
        agent, 
        login, // тот кто отказываеться от денег
        reciever, // тот кто получает деньги
        escrow_id, // id транзакции
        gbg_amount, // колличество золотых голосов в транзакции
        golos_amount, // колличество голосов в транзакции
        function(err, response) {
            //console.log('releaseTransaction: ', response, err);
            if (err) {
                alert('Не удалось подтвердить оканчательное отправление денег');
            }
        }
    );
}


// открыть спор для транзакции
function disputeTransaction (login, wif, from, to, agent, escrow_id) {
    golosJs.broadcast.escrowDispute(
        wif,
        from,
        to,
        agent,
        login, // тот кто открывает спор
        escrow_id,
        function(err, response) {
            //console.log('disputeTransaction: ', response, err);
            if (err) {
                alert('Не удалось подтвердить оканчательное отправление денег');
            }
        }
    );
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

    comment(user, game.author, game.id, JSON.stringify({x: x, y: y}), ['MOVE'], function(err, result, id) {
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

        var game = new Game(gameId, result.author);
        game.state = Game.STATUS_NEW;
        game.isMy = result.author == author;

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
                    var title = comment.title;
                    var moveAuthor = comment.author;

                    if (tags.indexOf('OPPONENT')) {
                        game.opponent = title;
                    } else if (meta.indexOf('MOVE')) {
                        try {
                            var move = JSON.parse(title);
                            game.moves.push({
                                author: author == moveAuthor,
                                x: move.x,
                                y: move.y
                            });
                        } catch (e) {

                        }
                    } else if (tags.indexOf('WIN')) {

                    } else if (tags.indexOf('DONE')) {
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