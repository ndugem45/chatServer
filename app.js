
const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    port = 3000,
    bodyParser = require('body-parser'),
    io = require('socket.io')(http)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/avatar', express.static(__dirname + '/asset/avatar'));



const users = []
io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        console.log(`user ${socket.id} disconnected`);

        var i = users.findIndex(x => x.socId == socket.id)
        users.splice(i, 1)

        console.log('users list', users)
    });

    socket.on('active', function (id, user) {
        if (user) {
            console.log(`user ${user} active`);
            var i = users.findIndex(x => x.user == user)
            if (i > -1) {
                users[i].socId = id
            } else {
                users.push({
                    user: user,
                    socId: id
                })
            }
            io.emit('info', users);
            console.log('users list', users)
        }
    });



    socket.on('sendMessage', function (from, user, msg) {
        console.log(`${user} message: ${msg}`);
        var i = users.findIndex(x => x.user == user)
        if (i > -1) {
            socket.to(users[i].socId).emit('personalMessage', from, msg);
        }
    });
});

const routes = require('./routes');
routes(app);

http.listen(port, () => console.log(`app listening...`))