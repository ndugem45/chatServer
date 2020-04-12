'use strict';

module.exports = function (app) {
    const todoList = require('./controller');

    app.route('/')
        .get(todoList.index);

    app.route('/getProfile')
        .post(todoList.profile);

    app.route('/getNear')
        .post(todoList.near);

    app.route('/getRoom')
        .post(todoList.chatList);

    app.route('/setChat')
        .post(todoList.newChat);

    app.route('/remRoom')
        .post(todoList.removeRoom);

    app.route('/muteRoom')
        .post(todoList.muteRoom);

    app.route('/blockUser')
        .post(todoList.blockUser);

    app.route('/unblockUser')
        .post(todoList.unblockUser);

    app.route('/blockList')
        .post(todoList.blockList);

    app.route('/reportUser')
        .post(todoList.reportUser);
};