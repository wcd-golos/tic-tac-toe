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
//  message when transaction created
// {
//     "app": 'tic-tac-toe-games',
//     "type": 'transaction',
//     "escrow_id": 12341234
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

function comment(user, parentAuthor, parentPermlink, title, info, cb) {

    golosJs.api.login('', '', function(err, result) {
        if (err || !result) {
            return cb(err);
        }

        var permLink = Game.generateId();
        var body = JSON.stringify({creator: user.login});

        var jsonMetadata = {
            info: info
        };

        golosJs.broadcast.comment(user.key, parentAuthor, parentPermlink, user.login, permLink, title, body, jsonMetadata, function(err, result) {
            cb(err, result, permLink);
        });
    });

};

function Game(permLink, author) {
    this.permLink = permLink;
    this.author = author;
    this.opponent = '';
    this.isMy = true;
    this.myMove = true;

    this.moves = [];
    this.state = Game.STATUS_NEW;

    this.className = '';

    //0 => null
    //1 => X
    //2 => O
    this.map = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
};

Game.PARENT_PERMLINK = 'tic-tac-toe-games-28';

Game.STATUS_NEW = 0;
Game.STATUS_PLAYING = 1;
Game.STATUS_DONE = 2;

Game.RESULT_WIN = 1;
Game.RESULT_DRAW = 3;
Game.RESULT_IN_PROGRESS = 2;

Game.SIZE = 3;

Game.prototype.persist = function () {
    var game = {
        id: this.id,
        author: this.author
    };

    localStorage.currentGame = JSON.stringify(game);
};

Game.prototype.checkEnd = function () {

};

Game.prototype.move = function(user, x, y, cb) {
    console.log('move');

    if (this.map[x][y]) {
        // illegal move
        return cb('Вы не можете сделать этот ход');
    }

    this.map[x][y] = user.login == this.author ? 2 : 1;

    var data = {
        app: Game.PARENT_PERMLINK,
        type: "MOVE",
        user: user.login,
        x: x,
        y: y
    };

    var self = this;

    comment(user, this.author, this.permLink, 'move', data, function(err, result, id) {
        console.log('MOVE', err, result);

        self.moves.push({
            user: user.login,
            x:  x,
            y:  y
        });

        self.myMove = false;

        var result = self.checkWin();
        if (result[0] == Game.RESULT_IN_PROGRESS) {
            console.log('in progress');
        } else {
            var data = {
                app: Game.PARENT_PERMLINK,
                type: "DONE",
                user: user.login,
                winner: result[0] == Game.RESULT_WIN ? user.login : ''
            };

            self.state = Game.STATUS_DONE;

            comment(user, game.author, game.id, 'move', data, function(err, result, id) {});
        }

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

Game.getGame = function(author, user, permLink, cb ) {

    golosJs.api.getContent(author, permLink, function(err, result) {

        if (err) {
            return cb(err);
        }
  
        var game = new Game(result.permlink, result.author);
        game.isMy = result.author == user;
        game.myMove = game.isMy;

        //console.log('game', game);

        golosJs.api.getContentReplies(result.author, result.permLink, (err, comments) => {
            //console.log('getContentReplies');

            if (err) {
                return cb(err);
            }

            game.state = comments.length > 0 ? Game.STATUS_PLAYING : Game.STATUS_NEW;

            comments.forEach(comment => {
                try {
                    var meta = JSON.parse(comment.json_metadata);
                    var message = meta.info || {};
                    var commentAuthor = comment.author;

                     if ('JOIN' == message.type) {
                         game.opponent = message.user;

                     } else if ('MOVE' == message.type) {
                         game.moves.push({
                            user: commentAuthor,
                            x:  message.x,
                            y:  message.y
                         });

                         var sym = 1;
                         if (commentAuthor == user) {
                             sym = game.isMy ? 1 : 2;
                         } else {
                             sym = game.isMy ? 2 : 1;
                         }

                         game.map[message.x][message.y] = sym;
                         game.myMove = commentAuthor != user;
                     } else if ('DONE' == message.type) {
                        game.state = Game.STATUS_DONE;
                     }
                } catch (e) {

                }
            });

            return cb(null, game);
        });
    });
};

Game.sync = function (game, user, cb) {
    golosJs.api.getContentReplies(game.author, game.permLink, (err, comments) => {

        if (err) {
            return cb(err);
        }

        game.state = comments.length > 0 ? Game.STATUS_PLAYING : Game.STATUS_NEW;

        comments.forEach(comment => {
            try {
                var meta = JSON.parse(comment.json_metadata);
                var message = meta.info || {};
                var commentAuthor = comment.author;

                if ('JOIN' == message.type) {
                    game.opponent = message.user;
                } else if ('MOVE' == message.type) {
                    game.moves.push({
                        user: commentAuthor,
                        x:  message.x,
                        y:  message.y
                    });

                    var sym = 1;
                    if (commentAuthor == user) {
                        sym = game.isMy ? 1 : 2;
                    } else {
                        sym = game.isMy ? 2 : 1;
                    }

                    game.map[message.x][message.y] = sym;
                    game.myMove = commentAuthor != user;
                } else if ('DONE' == message.type) {
                    game.state = Game.STATUS_DONE;
                }
            } catch (e) {

            }
        });

        return cb(null, game);
    });
};

Game.createGame = function (user, cb) {

    var title = `Игра создана ${ user.login }`;

    var data = {
        app: Game.PARENT_PERMLINK,
        type: 'created',
        creator: user.login
    };

    comment(user, '', Game.PARENT_PERMLINK, title, data, function(err, result, permLink) {
        if (err) {
            return cb(err);
        }

        var game = new Game(permLink, user.login);
        cb(null, game);
    });
};

Game.getLastGame = function (user, cb) {

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

        var game = result[0];

        Game.getGame(game.author, user.login, game.permlink, cb);

        /*if (err) {
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
            } else {
                cb(err);
            }
        });*/
    });
};

Game.play = function(user, cb) {
    Game.getLastGame(user, (err, game) => {

        if (err) {
            return cb(err);
        }

        if (game == null) {
            Game.createGame(user, cb);
            return;
        }

        Game.getGame(game.author, user.login, game.permLink, function(err, game) {
            if (err) {
                return cb(err);
            }

            if (game.state != Game.STATUS_NEW) {
                return Game.createGame(user, cb);
            }

            game.join(user, (err, result) => {
                game.state = 1;
                cb(err, game);
            });
        });
    });
};

Game.prototype.join = function(user, cb) {

    var data = {
        app: Game.PARENT_PERMLINK,
        type: "JOIN",
        user: user.login
    };

    comment(user, this.author, this.permLink, '', data, function(err, result, permLink) {
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

// создать транзакцию
Game.createTransfer = function(from, active_wif, to, agent, agent_priv_wif, gbg_amount, golos_amount, fee, sendDeadline, sendEscrowExpiration, terms, cb) {
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
                } else {
                    console.log('create transaction error: ', err);
                }
                cb(err, escrow_id);
            }
        );
    });
};

//получить транзакцию
Game.loadTransaction = function(from, escrow_id) {

    golosJs.api.getEscrow(
        from, //отправитель
        escrow_id, // id транзакции
        function(err, response) {
            console.log('load transaction: ', response, err);
            if(err) {
                alert('Не удолось получить транзакцию');
            }
        }
    );
};


// подтверждение перевода агентом и получателем
Game.approveTransaction = function(login, wif, from, to, agent, escrow_id, approve, cb) {
    golosJs.broadcast.escrowApprove(
        wif, // активный ключ подтверждающего
        from, // от кого перевод
        to, // кому перевод
        agent, 
        login, // тот кто подтверждает
        escrow_id, // id транзакции
        approve, // true or false
        function(err, response) {
            console.log('approveTransaction: ', response, err);
            cb(err, response);
        }
    );
};


// агент решает кому пойдут деньги или отказ от денег одним из пользователей (после подтверждения получателем и агентом, отправитель разрешает перевод)
Game.releaseTransaction = function(login, wif, from, to, agent, escrow_id, reciever, gbg_amount, golos_amount) {
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
};


// открыть спор для транзакции
Game.disputeTransaction = function (login, wif, from, to, agent, escrow_id) {
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
};


Game.prototype.checkDiagonal = function(symb) {
    var toright, toleft, res = false;
    var inProgress= false, isInProgressRight = false, isInProgressLeft = false;
    var winClass = '';
    toright = true;
    toleft = true;
    for (let i=0; i < Game.SIZE; i++) {
        toright &= (this.map[i][i] == symb);
        toleft &= (this.map[Game.SIZE - i - 1][i] == symb);

        isInProgressRight = (this.map[i][i] == 0);
        isInProgressLeft = (this.map[Game.SIZE - i - 1][i] == 0);
    }

    if (toright) winClass = 'win-00-22';
    if (toleft) winClass = 'win-20-02';
    if (toright || toleft) res = true;

    //если нет выйграша то проверка на незаконченную игру
    if(!res) {
        if (isInProgressRight || isInProgressLeft) inProgress = true;
    }

    if(res === true) {
        return [Game.RESULT_WIN, winClass];
    } else {
        return [Game.RESULT_IN_PROGRESS, winClass];
    }
};

Game.prototype.checkLines = function(symb) {
    var cols = 0, rows = 0, res = false;
    var inProgress= false, isInProgressRight = false, isInProgressLeft = false;
    var winClass = '';
    for (let col=0; col < Game.SIZE; col++) {
        cols = true;
        rows = true;
        for (let row=0; row < Game.SIZE; row++) {
            cols &= (this.map[col][row] == symb);
            rows &= (this.map[row][col] == symb);

            isInProgressRight = (this.map[col][row] == 0);
            isInProgressLeft = (this.map[row][col] == 0);
        }

        if (rows) winClass = 'win-'+col+'0-'+col+'2';
        if (cols) winClass = 'win-0'+col+'-2'+col;
        if (cols || rows) return [Game.RESULT_WIN, winClass];
    }
    //если нет выйграша то проверка на незаконченную игру
    if(!res) {
        if (isInProgressRight || isInProgressLeft) inProgress = true;
    }

    return [Game.RESULT_IN_PROGRESS, winClass];
};

Game.prototype.isGameEnded = function() {
    for (let col=0; col < Game.SIZE; col++) {
        for (let row=0; row < Game.SIZE; row++) {
            if(this.map[col][row] == 0) {
                return false;
            }
        }
    }
    return true;
};

// symbol 0 is 1
// symbol X is 0
Game.prototype.checkWin = function(sym) {
    var resLines = this.checkLines(sym);
    var resDiags = this.checkDiagonal(sym);

    if(resLines[0] == Game.RESULT_WIN) {
        return resLines;
    } else if(resDiags[0] == Game.RESULT_WIN) {
        return resDiags;
    } else if(resLines[0] == Game.RESULT_IN_PROGRESS || resDiags[0] == Game.RESULT_IN_PROGRESS) {
        return [Game.RESULT_IN_PROGRESS, ''];
    } else if (this.isGameEnded()) {
        return [Game.RESULT_DRAW, ''];
    }
    console.log(resLines);
    console.log(resDiags);
};

window.Game = Game;