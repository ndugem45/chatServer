'use strict';

const response = require('./res');
const connection = require('./conn');
const utils = require('./utils');
const async = require("async");


exports.profile = function (req, res) {
    // {
    //     userid
    // }

    connection.query(`SELECT * FROM users WHERE id=${req.body.userid}`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            rows[0].distance = utils.distance(req.body, rows[0])
            response.ok(rows, res)
        }
    });
};

exports.near = function (req, res) {
    // {
    //     id,
    //     lat,
    //     lng
    // }

    var sf = 3.14159 / 180;
    var er = 6371;
    var mr = req.body.maxDistance; //in KM (ex: 0.5)

    var q = `SELECT * FROM users 
    WHERE ${mr} >= ${er} * ACOS(SIN(lat * ${sf}) * SIN(${req.body.lat} * ${sf}) + COS(lat * ${sf}) * COS(${req.body.lat} * ${sf}) * COS((lng - ${req.body.lng}) * ${sf}))
    ORDER BY ACOS(SIN(lat * ${sf}) * SIN(${req.body.lat} * ${sf}) + COS(lat * ${sf}) * COS(${req.body.lat} * ${sf}) * COS((lng - ${req.body.lng}) * ${sf}))`

    connection.query(q, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            rows.map((s, i) => {
                rows[i].distance = utils.distance(req.body, s)
            })
            response.ok(rows, res)
        }
    });
};

exports.chatList = function (req, res) {
    // {
    //     id
    // }



    // var collect = {
    //     user: [],
    //     member: [],
    //     room: []
    // }

    // function room(id, cb) {
    //     connection.query(`SELECT * FROM chatmembers WHERE userid = ${id}`, function (error, rows, fields) {
    //         if (error) {
    //             console.log("q room error", error)
    //             cb(true, 'q room error');
    //         } else {
    //             collect.room = rows;
    //             cb(null, 'done');
    //         }
    //     });
    // }

    // async function member(roomid, id) {
    //     console.log(1)
    //     connection.query(`SELECT * FROM chatmembers WHERE userid != ${id} AND chatroomid = ${roomid}`, function (error, rows, fields) {
    //         console.log(2)
    //         if (error) {
    //             console.log("q member error", error)
    //         } else {
    //             collect.member.push(rows);
    //         }
    //     });
    //     console.log(3)
    // }

    // function user(id, cb) {
    //     connection.query(`SELECT * FROM users WHERE id = ${id}`, function (error, rows, fields) {
    //         if (error) {
    //             console.log("q user error", error)
    //         } else {
    //             collect.user.push(rows)
    //         }
    //     });
    // }



    // async.waterfall([
    //     function (callback) {
    //         room(req.body.id, (er, re) => callback(er, re))
    //     },
    //     function (ar, callback) {
    //         collect.room.map((s, i) => {
    //             await member(s.chatroomid, req.body.id)
    //         })
    //         callback(null, 'done')
    //     },
    //     function (ar, callback) {
    //         collect.member.map((s, i) => {
    //             user(s.userid)
    //         })
    //         callback(null, 'done')
    //     }
    // ], function (err, results) {
    //     // results is now equal to ['one', 'two']
    //     console.log("error", err)
    //     console.log("res", results)
    //     console.log("collect", collect)
    // });

    var q = `SELECT (SELECT fullname FROM users WHERE users.id = (SELECT userid FROM chatmembers WHERE chatroomid = r.id AND userid != 1)) AS fullname, (SELECT ava FROM users WHERE users.id = (SELECT userid FROM chatmembers WHERE chatroomid = r.id AND userid != 1)) AS ava, r.id, r.removeat, r.timeat,(SELECT message FROM messages WHERE messages.id = r.lastmessageid) AS message, (SELECT messages.timeat FROM messages WHERE messages.id = r.lastmessageid) AS messagetime, (SELECT lastonline FROM chatmembers WHERE chatmembers.chatroomid = r.id AND chatmembers.userid != ${req.body.id}) AS lastonline, (SELECT sub FROM chatmembers WHERE chatmembers.chatroomid = r.id AND chatmembers.userid != ${req.body.id}) AS sub FROM chatrooms AS r JOIN chatmembers AS m ON r.id = m.chatroomid WHERE m.userid = ${req.body.id} AND r.removeat = 0`

    connection.query(q, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            rows.map((s, i) => {
                rows[i].ava = utils.avaPath(rows[i].ava)
            })
            response.ok(rows, res)
        }
    });
};

exports.newChat = function (req, res) {
    // {
    //     id,
    //     userid,
    //     message
    // }

    var dNow = Date.now();

    async.waterfall([
        function (callback) {
            async.waterfall([
                function (cb) {
                    connection.query(`INSERT INTO chatrooms(nameroom,timeat) VALUES ('user-${req.body.id}-${req.body.userid}','${dNow}')`, function (error, rows, fields) {
                        if (error) {
                            console.log(error)
                            cb(true, 'q1 error');
                        } else {
                            cb(null, rows.insertId);
                        }
                    });
                },
                function (idroom, cb) {
                    connection.query(`INSERT INTO messages(message,timeat,fromuser,chatroomid) values ('${req.body.message}','${dNow}',${req.body.id},${idroom})`, function (error, rows, fields) {
                        if (error) {
                            console.log(error)
                            cb(true, 'q2 error');
                        } else {
                            cb(null, idroom, rows.insertId);
                        }
                    });
                },
                function (idroom, idmess, cb) {
                    connection.query(`UPDATE chatrooms SET lastmessageid = ${idmess} WHERE id = ${idroom}`, function (error, rows, fields) {
                        if (error) {
                            console.log(error)
                            cb(true, 'q3 error');
                        } else {
                            cb(null, idroom);
                        }
                    });
                }
            ], function (err, result) {
                callback(err, result);
            });
        },
        function (arg1, callback) {
            connection.query(`INSERT INTO chatmembers(chatroomid,userid,timeat,lastonline) VALUES (${arg1},${req.body.id},'${dNow}','${dNow}'),(${arg1},${req.body.userid},'${dNow}','${dNow}')`, function (error, rows, fields) {
                if (error) {
                    console.log(error)
                    callback(true, 'qUser error');
                } else {
                    callback(null, 'done');
                }
            });
        }
    ], function (err, result) {
        console.log("error", err)
        console.log("res", result)
        if (err) {
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });


};

exports.removeRoom = function (req, res) {
    // {
    //     roomid
    // }

    connection.query(`UPDATE chatrooms SET removeat = ${Date.now()} WHERE id = ${req.body.roomid}`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });
};

exports.muteRoom = function (req, res) {
    // {
    //     roomid,
    //     sub,
    //     id
    // }

    connection.query(`UPDATE chatmembers SET sub = ${req.body.sub} WHERE userid = ${req.body.id} AND chatroomid = ${req.body.roomid}`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });
};

exports.blockList = function (req, res) {
    // {
    //     id
    // }

    connection.query(`SELECT * FROM blocklist as b JOIN users as u ON b.userid = u.id WHERE fromid = ${req.body.id}`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.ok(rows, res)
        }
    });
};

exports.blockUser = function (req, res) {
    // {
    //     userid,
    //     id
    // }

    connection.query(`INSERT INTO blocklist(fromid,userid,timeat) VALUES(${req.body.id},${req.body.userid},${Date.now()})`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });
};

exports.unblockUser = function (req, res) {
    // {
    //     userid,
    //     id
    // }

    connection.query(`UPDATE blocklist SET removeat = ${Date.now()} WHERE fromid = ${req.body.id} AND userid = ${req.body.userid}`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });
};

exports.reportUser = function (req, res) {
    // {
    //     userid,
    //     id,
    //     message
    // }

    connection.query(`INSERT INTO reportlist(fromid,userid,timeat,message) VALUES(${req.body.id},${req.body.userid},${Date.now()},${req.body.message})`, function (error, rows, fields) {
        if (error) {
            console.log(error)
            response.message('Something error ...', true, res)
        } else {
            response.message('Done', false, res)
        }
    });
};




exports.index = function (req, res) {
    res.send(`${req.baseUrl}`)
    res.sendFile(__dirname + '/index.html');
};

exports.sample = function (req, res) {
    res.sendFile(__dirname + '/index.html');
};