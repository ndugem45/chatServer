'use strict';

exports.ok = function (values, res) {
    const data = {
        'status': 200,
        'error': false,
        'values': values
    };
    res.json(data);
    res.end();
};


exports.message = function (values, err, res) {
    const data = {
        'status': 200,
        'error': err,
        'message': values
    };
    res.json(data);
    res.end();
};