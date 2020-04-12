
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

const routes = require('./routes');
routes(app);


io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('enterRoom', function (user) {
        console.log(`user ${user} enter room`);
    });

    socket.on('userSendMessage', function (user, msg) {
        console.log(`${user} message: ${msg}`);
        io.emit('userSendMessage', user, msg);
    });


});

http.listen(port, () => console.log(`app listening...`))